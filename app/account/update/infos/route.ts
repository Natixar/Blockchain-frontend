/**
 * @category API Routes
 * 
 * This route allows users to update their first and last names, validating the user through a JWT token provided by FusionAuth.
 * @module
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * @category API Routes
 */

/**
 * Schema to validate user inputs, specifically first and last names.
 */
const userInputsSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

/**
 * Schema to validate the JWT response from FusionAuth.
 */
const JwtResponseSchema = z.object({
    jwt: z.object({
        sub: z.string().min(1)
    })
});

/**
 * PATCH handler for updating a user's first and last name.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the user's first and last names and access token in cookies.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 * 
 * @throws {Error} Throws an error if input validation fails, JWT token is invalid, or API requests fail.
 * 
 * @remarks
 * This function:
 * 1. Validates the user's input (first name and last name).
 * 2. Extracts and validates the JWT from cookies by querying FusionAuth.
 * 3. Fetches the user ID from the JWT and sends a PATCH request to update the user's info in FusionAuth.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/account/update/infos', {
 *   method: 'PATCH',
 *   body: JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
 *   headers: { Authorization: `Bearer <access_token>` }
 * });
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
    try {
        const validatedInputs = userInputsSchema.safeParse(await request.json())
        if (!validatedInputs.success) {
            throw new Error(`${validatedInputs.error}`);
        }
        const { firstName, lastName } = validatedInputs.data;

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

        const validatedJwt = JwtResponseSchema.safeParse(await jwtResponse.json());
        if (!validatedJwt.success) {
            throw new Error(`${validatedJwt.error}`);
        }
        const userId = validatedJwt.data.jwt.sub;

        const updateResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
                'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
            },
            body: JSON.stringify({ user: { firstName, lastName }, applicationId: process.env.FUSIONAUTH_APP_ID }),
        });
        if (!updateResponse.ok) {
            throw new Error(`${updateResponse.status} ${updateResponse.statusText}`);
        }

        return NextResponse.json({ message: 'Infos successfully updated' });

    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update infos' }, { status: 500 });
    }
}
