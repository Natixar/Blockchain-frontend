/**
 * 
 * This API route handles GET requests to retrieve a list of products associated with a specific account address from the blockchain.
 * The product details are fetched from the blockchain and numerical data such as price, quantity, and CO2 emissions are rounded.
 * @module
 */

import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving products associated with an account address from the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the `accountAddress` as a query parameter.
 * @returns {Promise<NextResponse>} A JSON response with the list of products and their rounded details, or an error message.
 * 
 * @throws {Error} Throws an error if the `accountAddress` is missing or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Retrieves the `accountAddress` from the query parameters.
 * 2. Fetches all products associated with the account address from the blockchain.
 * 3. Rounds the numerical product data such as price, quantity, and CO2 emissions before returning the response.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/api/get-products?accountAddress=0xAccountAddress', {
 *   method: 'GET'
 * });
 * 
 * @example
 * // Example response when products are found:
 * [
 *   {
 *     "address": "0x1234...",
 *     "name": "Product A",
 *     "price": 100,
 *     "quantity": 50,
 *     "co2": 200
 *   },
 *   {
 *     "address": "0x5678...",
 *     "name": "Product B",
 *     "price": 120,
 *     "quantity": 75,
 *     "co2": 180
 *   }
 * ]
 */
export async function GET(request: NextRequest) {
  const accountAddress = request.nextUrl.searchParams.get('accountAddress');
  try {
    if (!accountAddress) {
      return NextResponse.json({ error: 'Missing account address' }, { status: 400 });
    }

    // Fetch products from the blockchain associated with the account address
    const products = await app.getMinerals(process.env.BLOCKCHAIN_NATIXAR_FACTORY as string, accountAddress);

    // Round numerical product data
    const roundedData = products.map((product) => ({
      ...product,
      price: Math.round(product.price),
      quantity: Math.round(product.quantity),
      co2: Math.round(product.co2!),
    }));

    return NextResponse.json(roundedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
  }
}
