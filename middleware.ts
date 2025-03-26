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
      return { jwtPayload: data.jwt };
    } else if (response.status === 401) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        // Validate the new token
        const {jwtPayload} = await validateJwt(newToken, refreshToken);
        return { jwtPayload, newToken };
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
        'X-FusionAuth-TenantId': process.env.FUSIONAUTH_TENANTID!
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

async function applyRouteBasedHeaders(pathname: string, headers: Headers, userId: string) {
  try {
    const routesRequiringGroupId = [
      '/mine/minting/mint',
      '/product/declare/define',
      '/product/document',
      '/product/load/load',
      '/product/unload/unload',
      '/transactions/create/createPackage'
    ];
    const routesRequiringBlockchainAddress = [
      '/product/tnx-in',
      '/product/getProducts',
      /^\/product\/list\/[^/]+\/details$/, // dynamic path as regex
      /^\/transactions\/getTransactions(\?blockchainAddress=[^&]+)?$/ // request param as regex
    ];
    const requiresGroupId = routesRequiringGroupId.includes(pathname);
    const requiresBlockchainAddress = routesRequiringBlockchainAddress.some((route) =>
      typeof route === 'string' ? route === pathname : route.test(pathname)
    );
    // If either `groupId` or `blockchainAddress` is needed
    if (requiresGroupId || requiresBlockchainAddress) {
      // Fetch user data to get groupId
      const userResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
          'X-FusionAuth-TenantId': process.env.FUSIONAUTH_TENANTID!,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const groupId = (await userResponse.json()).user?.memberships?.[0]?.groupId;
        headers.set('x-hello-from-middleware1', 'hello')
        // Set groupId header if required
        if (requiresGroupId) {
          headers.set('X-FusionAuth-GroupId', groupId || '')
          return;
        }

        // Fetch group data for blockchainAddress if required and groupId exists
        if (requiresBlockchainAddress && groupId) {
          const groupResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/group/${groupId}`, {
            method: 'GET',
            headers: {
              Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
              'X-FusionAuth-TenantId': process.env.FUSIONAUTH_TENANTID!,
              'Content-Type': 'application/json'
            }
          });

          if (groupResponse.ok) {
            const blockchainAddress = (await groupResponse.json()).group?.data?.blockchainAddress;
            if (blockchainAddress) {
              headers.set('X-FusionAuth-BlockchainAddress', blockchainAddress || '');
            }
          } else {
            console.error('Failed to retrieve group data for blockchain address.');
          }
        }
      } else {
        console.error('Failed to retrieve user data from FusionAuth');
      }
    }
  } catch (error) {
    console.error('Error fetching data from FusionAuth:', error);
  }
}

// Role paths configuration
const rolePaths: { [key: string]: string[] } = {
  mine: ['/mine', '/product', '/transactions'],
  smeltery: ['/smeltery', '/product', '/transactions'],
  // transport: ['/transport'],
  manufacturer: ['/manufacturer', '/report'],
  trader: ['/trader', '/transactions', '/report'],
};

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const refreshTokenCookie = request.cookies.get('refresh_token');

  // Validate the token if present
  if (tokenCookie?.value && refreshTokenCookie?.value) {
    const validationResult = await validateJwt(tokenCookie.value, refreshTokenCookie.value);

    if (validationResult) {
      const { jwtPayload, newToken } = validationResult;

      const response = NextResponse.next();

      if (newToken) {
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
        return response;
      }

      if (jwtPayload.roles) {
        // const rolesHeader = jwtPayload.roles.join(',');
        // const response = NextResponse.next();
        // response.headers.set('X-User-Roles', rolesHeader);

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

        if (!isAuthorized(jwtPayload.roles, request.nextUrl.pathname)) {
          return NextResponse.redirect(new URL('/not-found', request.url));
          // return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        const requestHeaders = new Headers(request.headers);
        await applyRouteBasedHeaders(request.nextUrl.pathname, requestHeaders, jwtPayload.sub);

        return NextResponse.next({
          request: { headers: requestHeaders }
        })
      }
    } else {
      // JWT validation failed, securely log out the user
      return NextResponse.redirect(new URL('/auth/signout', request.url));
    }
  } else if (request.nextUrl.pathname.startsWith('/auth/signin') || request.nextUrl.pathname.startsWith('/auth/forgot-password') || request.nextUrl.pathname.startsWith('/transport')) {
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
    '/report/:path*',
    '/auth/:path*',
    '/account/:path*',
  ],
};
