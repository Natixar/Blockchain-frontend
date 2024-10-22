/**
 * 
 * This API route handles POST requests to unload a package on the blockchain, complete the transit process, and close the package.
 * It validates the inputs, interacts with the blockchain to finalize the transaction, and records transport emissions data.
 * @module
 */

import { packageWithoutTransporterInterface } from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate user inputs for unloading a package, including the transaction address, transport emissions, and account details.
 */
const userInputsSchema = z.object({
  transactionAddress: z.string().min(1, "packageAddress cannot be empty"),
  transportEmissions: z.number().gt(0, "co2Emissions must be greater than 0")
});

/**
 * POST handler for unloading a package, completing the transit, and closing the package on the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the package transaction address, transport emissions, and account information.
 * @returns {Promise<NextResponse>} A JSON response indicating whether the package was unloaded successfully or an error occurred.
 * 
 * @throws {Error} Throws an error if input validation fails or if the blockchain transaction cannot be completed.
 * 
 * @remarks
 * This function:
 * 1. Validates the user inputs (transaction address, transport emissions, and account) using a schema.
 * 2. Initiates the blockchain call to unload the package and complete the transit process.
 * 3. Returns a success message upon successful package unloading and transit completion, or an error message if the process fails.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/product/unload/unload', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     transactionAddress: '0xTransactionAddress',
 *     transportEmissions: 100,
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
    const { transactionAddress, transportEmissions } = parsedInputs.data;

    // Blockchain transaction to unload the package and close the package
    await packageWithoutTransporterInterface.address(transactionAddress).method("unload").sendTransaction(groupId);

    return NextResponse.json({ message: 'Package unloaded, transit completed, and package closed.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to unload package, complete transit, and close package.' }, { status: 500 });
  }
}
