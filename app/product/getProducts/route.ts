/**
 * 
 * This API route handles GET requests to retrieve a list of products associated with a specific account address from the blockchain.
 * The product details are fetched from the blockchain and numerical data such as price, quantity, and CO2 emissions are rounded.
 * @module
 */

import { mineralInterface, natixarFactory } from '@/app/blockchain/src';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';
import { NextResponse } from 'next/server';

/**
 * GET handler for retrieving products associated with an account address from the blockchain.
 * 
 * @returns {Promise<NextResponse>} A JSON response with the list of products and their rounded details, or an error message.
 * 
 * @throws {Error} Throws an error if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 2. Fetches all products associated with the account address from the blockchain.
 * 3. Rounds the numerical product data such as price, quantity, and CO2 emissions before returning the response.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/product/getProducts', {
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
export async function GET(): Promise<NextResponse> {
  try {

    // Fetch products from the blockchain associated with the account address
    const productAddresses: string[] = await natixarFactory.method("getMinerals").call(Mine_1)
    console.log(productAddresses)
    const productDetailsPromises = productAddresses.map(async (productAddress) => {
      const name = await mineralInterface.address(productAddress).method('name').call();
      const symbol = await mineralInterface.address(productAddress).method('symbol').call();
      const price = Number(await mineralInterface.address(productAddress).method('price').call()) / Math.pow(10, 18);
      const quantity = Number(await mineralInterface.address(productAddress).method('balanceOf').call(Mine_1)) / Math.pow(10, 18);
      const co2 = Number(await mineralInterface.address(productAddress).method('footprintOf').call(Mine_1)) / Math.pow(10, 18);

      return {
        address: productAddress,
        name,
        symbol,
        price,
        quantity,
        co2
      };
    });

    const products = await Promise.all(productDetailsPromises);

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
