/**
 * 
 * This API route handles GET requests to retrieve specific product information from the blockchain using an account address and product address.
 * The product data includes details like price, quantity, and CO2 emissions.
 * @module
 */

import { mineralInterface } from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving a specific product's information from the blockchain.
 * 
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters extracted from the route.
 * @param {string} context.params.commodityAddress - The product's blockchain address from the route.
 * 
 * @returns {Promise<NextResponse>} A JSON response with the rounded product data, including price, quantity, and CO2 emissions, or an error message.
 * 
 * @throws {Error} Will throw if the `commodityAddress` is missing, if the product is not found, or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 2. Fetches all products associated an account from the blockchain.
 * 3. Finds the specific product by `commodityAddress` and rounds its numerical data (price, quantity, CO2).
 * 4. Returns the rounded product data or an appropriate error message.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/api/getProducts', {
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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ commodityAddress: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  try {
    const { commodityAddress } = params;
    if (!commodityAddress) {
      return NextResponse.json({ error: 'Missing product address in URL' }, { status: 400 });
    }

    const blockchainAddress = request.headers.get('X-FusionAuth-BlockchainAddress') || '';
    const name = await mineralInterface.address(commodityAddress).method('name').call();
    const symbol = await mineralInterface.address(commodityAddress).method('symbol').call();
    const price = Number(await mineralInterface.address(commodityAddress).method('price').call()) / Math.pow(10, 18);
    const quantity = Number(await mineralInterface.address(commodityAddress).method('balanceOf').params(blockchainAddress).call()) / Math.pow(10, 18) / 1000;
    const co2 = Number(await mineralInterface.address(commodityAddress).method('footprintOf').params(blockchainAddress).call()) / Math.pow(10, 18) / 1000;

    const product = {
      address: commodityAddress,
      name,
      symbol,
      price,
      quantity,
      co2
    };

    const roundedData = {
      ...product,
      price: Math.round(product.price),
      quantity: product.quantity.toFixed(2),
      co2: product.co2.toFixed(2),
    };

    return NextResponse.json(roundedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve product.' }, { status: 500 });
  }
}
