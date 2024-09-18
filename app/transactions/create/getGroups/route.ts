/**
 * 
 * This API route handles GET requests to retrieve group information from FusionAuth.
 * The group details include the group name and associated blockchain address.
 * @module
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate the response structure from FusionAuth API, specifically the group information and blockchain address.
 */
const groupResponseSchema = z.object({
    groups: z.array(z.object({
        name: z.string(),
        data: z.object({
            blockchainAddress: z.string()
        })
    }))
});

/**
 * GET handler for retrieving group information from FusionAuth.
 * 
 * @returns {Promise<NextResponse>} A JSON response containing the group names and blockchain addresses, or an error message.
 * 
 * @throws {Error} Throws an error if the response from FusionAuth is not valid or if the request fails.
 * 
 * @remarks
 * This function:
 * 1. Fetches the group information from FusionAuth using their API.
 * 2. Validates the response structure using a Zod schema.
 * 3. Returns the group names and their associated blockchain addresses.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transactions/getGroups', { method: 'GET' });
 */
export async function GET(): Promise<NextResponse> {
    try {
        const groupResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/group`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
                Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
            },
        });
        if (!groupResponse.ok) {
            throw new Error(`${groupResponse.status} ${groupResponse.statusText}`);
        }

        const validatedData = groupResponseSchema.safeParse(await groupResponse.json());
        if (!validatedData.success) {
            throw new Error(`${validatedData.error}`);
        }
        const groups = validatedData.data.groups.map(group => ({ name: group.name, blockchainAddress: group.data.blockchainAddress }));

        return NextResponse.json(groups);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to retrieve groups.' }, { status: 500 });
    }
}