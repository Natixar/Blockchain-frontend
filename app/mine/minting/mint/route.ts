/**
 * 
 * This API route handles POST requests to mint a commodity on the blockchain by invoking a blockchain function. The route validates the input for commodity data and account details before calling the blockchain minting function.
 * @module
 */

import { mineralInterface } from '@/app/blockchain/src';
import { Utils } from '@/app/blockchain/src/ClientSDK/Utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate user inputs, including commodity address, quantity, footprint, and account details (keyId and address).
 */
const userInputsSchema = z.object({
  commodityAddress: z.string().min(1, "commodityAddress cannot be empty"), // Product address should be non-empty
  quantity: z.number().gt(0, "quantity must be greater than 0"), // Quantity should be greater than 0
  footprint: z.number().gt(0, "footprint must be greater than 0"), // Footprint should be greater than 0
});

/**
 * POST handler for minting a commodity on the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the commodity details and account information.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure of the minting process.
 * 
 * @throws {Error} Will throw if the input validation fails or if the blockchain minting process fails.
 * 
 * @remarks
 * This function:
 * 1. Validates the user's input (commodity address, quantity, footprint, and account details) using a schema.
 * 2. Calls the blockchain function `mintProduct` to mint a new commodity, passing the validated commodity data and account info.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/mine/minting/mint', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     commodityAddress: '0xcommodityAddress123',
 *     quantity: 10,
 *     footprint: 5,
 *   })
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const groupId = request.headers.get('X-FusionAuth-GroupId');
    const parsedInputs = userInputsSchema.safeParse(await request.json());
    if (!parsedInputs.success || !groupId) {
      throw new Error(`${parsedInputs.error}`);
    }

    const { commodityAddress, quantity, footprint } = parsedInputs.data;

    // Call the blockchain function to mint a commodity, passing the commodity data.
    await mineralInterface.address(commodityAddress).method("mint").params(Utils.toUint18Decimals(quantity), Utils.toUint18Decimals(footprint)).sendTransaction(groupId);

    return NextResponse.json({ message: 'Product minted successfully' });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to mint commodity' }, { status: 500 });
  }
}
