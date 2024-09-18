/**
 * @category API Routes
 * 
 * This API route handles GET requests to retrieve a specific blockchain transaction associated with a given account and transaction address.
 * The transaction details are fetched by interacting with the blockchain.
 * @module
 */

import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving a specific transaction associated with an account address and transaction address.
 * 
 * @param {NextRequest} request - The incoming request object, which contains `accountAddress` and `transactionAddress` as query parameters.
 * @returns {Promise<NextResponse>} A JSON response with the retrieved transaction or an error message.
 * 
 * @throws {Error} Will throw if either the `accountAddress` or `transactionAddress` is not provided, or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Extracts the `accountAddress` and `transactionAddress` query parameters from the request URL.
 * 2. Calls the blockchain function `getPackage` to retrieve the details of a specific transaction associated with the provided addresses.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transactions/get?accountAddress=0xAccountAddress123&transactionAddress=0xTransactionAddress123', {
 *   method: 'GET'
 * });
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const accountAddress = request.nextUrl.searchParams.get('accountAddress');
    const transactionAddress = request.nextUrl.searchParams.get('transactionAddress');
    console.log(accountAddress, transactionAddress)
    try {
        if (!accountAddress || !transactionAddress) {
            throw new Error('Account or transaction address is null');
        }
        const transaction = await app.getPackage(transactionAddress, accountAddress);
        return NextResponse.json(transaction);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
    }
}
