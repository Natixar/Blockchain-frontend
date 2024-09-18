/** 
 * This API route handles PATCH requests to update a user's email address using FusionAuth for JWT validation.
 * @module
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate user inputs, specifically the new email.
 */
const userInputsSchema = z.object({
    newEmail: z.string().email()
});

/**
 * Schema to validate the JWT response from FusionAuth.
 */
const JwtResponseSchema = z.object({
    jwt: z.object({
        sub: z.string()
    })
});

/**
 * PATCH handler for updating the user's email address.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the new email and access token.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 * 
 * @throws {Error} Will throw if the input validation fails, token is invalid, or API requests fail.
 * 
 * @remarks
 * This function:
 * 1. Validates the user's input (new email) using a schema.
 * 2. Extracts and validates the JWT from cookies by querying FusionAuth.
 * 3. Fetches the user ID from the JWT and sends a PATCH request to update the email in FusionAuth.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/account/update/email', {
 *   method: 'PATCH',
 *   body: JSON.stringify({ newEmail: 'newemail@example.com' }),
 *   headers: { Authorization: `Bearer <access_token>` }
 * });
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
    try {
        const parsedInputs = userInputsSchema.safeParse(await request.json())
        if (!parsedInputs.success) {
            throw new Error(`${parsedInputs.error}`);
        }
        const { newEmail } = parsedInputs.data;

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
        const userId = parsedJwt.data.jwt.sub;

        const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
                'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
            },
            body: JSON.stringify({ user: { email: newEmail }, applicationId: process.env.FUSIONAUTH_APP_ID }),
        });

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        return NextResponse.json({ message: 'Email successfully updated' });

    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }
}
