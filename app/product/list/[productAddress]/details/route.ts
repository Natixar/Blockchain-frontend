/**
 * 
 * This API route handles GET requests to retrieve specific product information from the blockchain using an account address and product address.
 * The product data includes details like price, quantity, and CO2 emissions.
 * @module
 */

import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving a specific product's information from the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the `accountAddress` as a query parameter.
 * @param {{ params: { productAddress: string } }} params - The route parameters containing the product address.
 * @returns {Promise<NextResponse>} A JSON response with the rounded product data, including price, quantity, and CO2 emissions, or an error message.
 * 
 * @throws {Error} Will throw if the `accountAddress` or `productAddress` is missing, if the product is not found, or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Retrieves the `accountAddress` from the query parameters and `productAddress` from the URL parameters.
 * 2. Fetches all products associated with the `accountAddress` from the blockchain.
 * 3. Finds the specific product by `productAddress` and rounds its numerical data (price, quantity, CO2).
 * 4. Returns the rounded product data or an appropriate error message.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/api/get-product?accountAddress=0xAccountAddress123', {
 *   method: 'GET'
 * });
 * 
 * @example
 * // Example response when product is found:
 * {
 *   "address": "0x1234...",
 *   "name": "Product A",
 *   "price": 100,
 *   "quantity": 50,
 *   "co2": 200
 * }
 */

export async function GET(request: NextRequest, { params }: { params: { productAddress: string } }): Promise<NextResponse> {
  try {
    const accountAddress = request.nextUrl.searchParams.get('accountAddress');
    if (!accountAddress) {
      return NextResponse.json({ error: 'Missing account address' }, { status: 400 });
    }

    const { productAddress } = params;
    if (!productAddress) {
      return NextResponse.json({ error: 'Missing product address in URL' }, { status: 400 });
    }

    // Fetch all products from the blockchain for the given account address
    const products = await app.getMinerals(process.env.BLOCKCHAIN_NATIXAR_FACTORY as string, accountAddress);

    // Find the specific product using the product address
    const product = products.find(product => product.address === productAddress);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const roundedData = {
      ...product,
      price: Math.round(product.price),
      quantity: Math.round(product.quantity),
      co2: Math.round(product.co2!),
    };

    return NextResponse.json(roundedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve product.' }, { status: 500 });
  }
}
