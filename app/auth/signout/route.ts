/** 
 * This route handles user logout by clearing the authentication cookies (`access_token` and `refresh_token`) 
 * and making a request to FusionAuth's Logout API. Upon successful logout, the user is redirected to the 
 * sign-in page (`/auth/signin`).
 * @module
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * @param {Request} request - The HTTP request object, which contains information about the incoming request, including the URL.
 * @returns {Promise<NextResponse>} Redirects the user to the sign-in page after clearing cookies and attempting to log out from FusionAuth.
 * 
 * @example
 * // Example usage of the GET request
 * fetch('/auth/signout')
 *  .then(response => {
 *    if (response.ok) {
 *      // Redirect to login or show confirmation
 *    }
 *  });
 * 
 * @throws {Error} Logs an error if the logout request to FusionAuth fails or if there are issues during the fetch operation.
 * 
 * @see {@link https://fusionauth.io/docs/v1/tech/apis/authentication/logout Logout API documentation}
 */
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
