/**
 * 
 * This route allows users to change their password. The route validates the user through a JWT token provided by FusionAuth, then sends the new password and current password to FusionAuth's API for updating.
 * @module
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate user inputs, specifically the current password and new password.
 */
const userInputsSchema = z.object({
    currentPassword: z.string().min(1),
    password: z.string().min(1),
});

/**
 * Schema to validate the JWT response from FusionAuth, particularly to retrieve the user's email.
 */
const JwtResponseSchema = z.object({
    jwt: z.object({
        email: z.string()
    })
});

/**
 * POST handler for updating a user's password.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the user's current password, new password, and access token in cookies.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 * 
 * @throws {Error} Throws an error if the input validation fails, the JWT token is invalid, or the API requests fail.
 * 
 * @remarks
 * This function:
 * 1. Validates the user's input (current password and new password).
 * 2. Extracts and validates the JWT from cookies by querying FusionAuth.
 * 3. Sends a POST request to FusionAuth to update the user's password.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/account/update/password', {
 *   method: 'POST',
 *   body: JSON.stringify({ currentPassword: 'oldPassword', password: 'newPassword' }),
 *   headers: { Authorization: `Bearer <access_token>` }
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const parsedInputs = userInputsSchema.safeParse(await request.json())
        if (!parsedInputs.success) {
            throw new Error(`${parsedInputs.error}`);
        }
        const { currentPassword, password } = parsedInputs.data;

        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            throw new Error('Access token not valid');
        }

        const jwtResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/jwt/validate`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        if (!jwtResponse.ok) {
            throw new Error(`${jwtResponse.status} ${jwtResponse.statusText}`);
        }

        const parsedJwt = JwtResponseSchema.safeParse(await jwtResponse.json());
        if (!parsedJwt.success) {
            throw new Error(`${parsedJwt.error}`);
        }
        const email = parsedJwt.data.jwt.email;

        const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
                'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`
            },
            body: JSON.stringify({
                applicationId: process.env.FUSIONAUTH_APP_ID,
                loginId: email,
                currentPassword,
                password,
            }),
        });
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        return NextResponse.json({ message: 'Password successfully updated' });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
