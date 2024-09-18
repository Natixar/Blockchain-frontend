import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function validateJwt(token: string, refreshToken: string, retry = true): Promise<any | null> {
  try {
    const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/jwt/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {jwtPayload: data.jwt};
    } else if (response.status === 401) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        // Validate the new token
        const jwtPayload = await validateJwt(newToken, refreshToken);
        return {jwtPayload, newToken};
      } else return null;
    } else {
      console.error(`JWT validation failed: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error: any) {
    if (error.cause?.errors) {
      console.error('Network Error Details:', error.cause.errors);
    }
    console.error('Error validating JWT:', error, error.message, error.stack, JSON.stringify(error));
        // Check if the error matches the specific fetch failure
        const errorString = JSON.stringify(error);
        console.log('errorString', errorString)
        if (
          retry && 
          errorString.includes('TypeError: fetch failed') && 
          errorString.includes('Error: AggregateError')
        ) {
          console.log('Retrying JWT validation due to fetch failure...', errorString);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await validateJwt(token, refreshToken, false);  // Retry once
        }
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/jwt/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FusionAuth-TenantId': 'Default'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else if (response.status === 400) {
      return null;
    } else {
      console.error(`Refresh token failed: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

function isAuthorized(roles: string[], pathname: string): boolean {
  let isAuthorized = false;
  roles.forEach((role: string) => {
    const allowedPaths = rolePaths[role];
    if (allowedPaths && allowedPaths.some((path) => pathname.startsWith(path))) {
      isAuthorized = true;
    }
  });
  return isAuthorized;
}

// Role paths configuration
const rolePaths: { [key: string]: string[] } = {
  mine: ['/mine', '/product', '/transactions'],
  smeltery: ['/smeltery', '/product', '/transactions'],
  // transport: ['/transport'],
  manufacturer: ['/manufacturer'],
  trader: ['/trader', '/transactions'],
};

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const refreshTokenCookie = request.cookies.get('refresh_token');

  // Validate the token if present
  if (tokenCookie?.value && refreshTokenCookie?.value) {
    const validationResult = await validateJwt(tokenCookie.value, refreshTokenCookie.value);

    // console.log('validationResult:', validationResult)

    if (validationResult) {
      const { jwtPayload, newToken } = validationResult;

      if (newToken) {
        const response = NextResponse.next();
        response.cookies.set({
          name: 'access_token',
          value: newToken,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
      }

      if (request.nextUrl.pathname.startsWith('/auth/signout') || request.nextUrl.pathname.startsWith('/account')) {
        return NextResponse.next();
      }

      if (jwtPayload.roles) {
        const rolesHeader = jwtPayload.roles.join(',');
        console.log('rolesHeader', rolesHeader)
        const response = NextResponse.next();
        response.headers.set('X-User-Roles', rolesHeader);

        // SIgn-up feature temporary disabled and redirected to sign-in
        if (request.nextUrl.pathname.startsWith('/auth/signup')) {
          return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        if (request.nextUrl.pathname === '/') {
          return NextResponse.redirect(new URL('/auth/signin', request.url))
        }

        if (request.nextUrl.pathname.startsWith('/auth/signin')) {
          return NextResponse.redirect(new URL('/account', request.url));
        }

        // Allow access to API routes
        if (request.nextUrl.pathname.startsWith('/blockchain/api')) {
          return NextResponse.next();
        }

        if (!isAuthorized(jwtPayload.roles, request.nextUrl.pathname)) {
          return NextResponse.redirect(new URL('/not-found', request.url));
          // return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        return NextResponse.next();
      }
    } else {
      // JWT validation failed, securely log out the user
      return NextResponse.redirect(new URL('/auth/signout', request.url));
    }
  } else if (request.nextUrl.pathname.startsWith('/auth/signin') || request.nextUrl.pathname.startsWith('/transport')) {
    return NextResponse.next();
  } else {
    // Redirect to signin if no token and not accessing signin
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/',
    '/mine/:path*',
    // '/transport/:path*',
    '/smeltery/:path*',
    '/manufacturer/:path*',
    '/trader/:path*',
    '/product/:path*',
    '/transactions/:path*',
    '/auth/:path*',
    '/account/:path*',
    '/blockchain/api/:path*',
  ],
};
