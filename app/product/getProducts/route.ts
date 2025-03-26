/**
 * 
 * This API route handles GET requests to retrieve a list of products associated with a specific account address from the blockchain.
 * The product details are fetched from the blockchain and numerical data such as price, quantity, and CO2 emissions are rounded.
 * @module
 */

import { mineralInterface } from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

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
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const blockchainAddress = request.headers.get('X-FusionAuth-BlockchainAddress') || '';
    if (!blockchainAddress) {
      return NextResponse.json({ error: 'Blockchain address is required.' }, { status: 400 });
    }

    // Fetch all tokens owned by the user
    const tokenListData = await fetchFromExplorer('?module=account&action=tokenlist', { address: blockchainAddress });
    const tokenAddresses: string[] = tokenListData.result.map((token: any) => token.contractAddress);

    // Fetch and process product details for each token
    const products = await Promise.all(tokenAddresses.map((contractAddress) => getProductDetails(contractAddress, blockchainAddress)));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
  }
}

/**
 * Utility function to fetch data from the blockchain explorer API.
 */
async function fetchFromExplorer(endpoint: string, params: Record<string, string>) {
  const url = new URL(endpoint, `${process.env.BLOCKCHAIN_EXPLORER_URL}/api`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
  return response.json();
}

/**
 * Retrieves and processes product details with balance fetched directly via RPC.
 */
async function getProductDetails(contractAddress: string, blockchainAddress: string) {
  const [name, symbol, rawPrice, rawCo2, rawBalance] = await Promise.all([
    mineralInterface.address(contractAddress).method('name').call(),
    mineralInterface.address(contractAddress).method('symbol').call(),
    mineralInterface.address(contractAddress).method('price').call(),
    mineralInterface.address(contractAddress).method('footprintOf').params(blockchainAddress).call(),
    mineralInterface.address(contractAddress).method('balanceOf').params(blockchainAddress).call(),
  ]);

  return {
    address: contractAddress,
    name,
    symbol,
    price: Math.round(Number(rawPrice) / 1e18),       // Convert price from wei and round
    quantity: (Number(rawBalance) / 1e18 / 1000).toFixed(2), // Convert balance from wei, scale down by 1000, and round
    co2: (Number(rawCo2) / 1e18 / 1000).toFixed(2),   // Convert footprint from wei, divide by 1000, and round
  };
}
