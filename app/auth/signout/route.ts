import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const redirectUrl = new URL('/auth/signin', request.url);

  // Get tokens from cookies
  const access_token = cookies().get('access_token')?.value;

  // Call FusionAuth's Logout API
  if (access_token) {
    try {
      const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
        },
        body: JSON.stringify({
          global: true, // Logs the user out of all sessions
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`Failed to logout user: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Clear cookies
  cookies().delete('access_token');
  cookies().delete('refresh_token');

  // Redirect to sign-in page
  const response = NextResponse.redirect(redirectUrl);
  return response;
}
