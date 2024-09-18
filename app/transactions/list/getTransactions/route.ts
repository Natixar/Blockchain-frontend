/**
 * @category API Routes
 * 
 * This API route handles GET requests to retrieve blockchain transactions related to a specific account.
 * The transactions are fetched by calling a blockchain function that interacts with the Natixar Factory contract.
 * @module
 */

import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving transactions associated with a specific account address.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the `accountAddress` as a query parameter.
 * @returns {Promise<NextResponse>} A JSON response with the retrieved transactions or an error message.
 * 
 * @throws {Error} Will throw an error if the `accountAddress` is not provided or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Extracts the `accountAddress` query parameter from the request URL.
 * 2. Calls the blockchain function `getPackages` to retrieve transactions associated with the provided account address from the Natixar Factory contract.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transactions/list/getTransactions?accountAddress=0xAccountAddress123', {
 *   method: 'GET'
 * });
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const accountAddress = request.nextUrl.searchParams.get('accountAddress');
    try {
        if (!accountAddress) {
            throw new Error('Account address is null');
        }
        const transactions = await app.getPackages(process.env.BLOCKCHAIN_NATIXAR_FACTORY as string, accountAddress);
        return NextResponse.json(transactions);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
    }
}
