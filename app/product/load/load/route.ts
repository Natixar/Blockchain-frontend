/**
 * 
 * This API route handles POST requests to load a package on the blockchain, validating the necessary inputs and recording transport emissions data.
 * It uses the blockchain to register the transport emissions and completes the package loading process.
 * @module
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { packageWithoutTransporterInterface } from '@/app/blockchain/src';
import { Utils } from '@/app/blockchain/src/Utils';

/**
 * Schema to validate user inputs for loading a package, including the transaction address, transport emissions, and account details.
 */
const userInputsSchema = z.object({
  transactionAddress: z.string().min(1, "packageAddress cannot be empty"),
  transportEmissions: z.number().gt(0, "co2Emissions must be greater than 0"),
  account: z.object({
    keyId: z.string().min(1, "keyId is required"),
    address: z.string().min(1, "address is required"),
  }),
});

/**
 * POST handler for loading a package on the blockchain with transport emissions data.
 * 
 * @param {NextRequest} request - The incoming request object containing the package transaction address, transport emissions, and account information.
 * @returns {Promise<NextResponse>} A JSON response indicating whether the package was loaded successfully or an error occurred.
 * 
 * @throws {Error} Throws an error if input validation fails or if the blockchain transaction cannot be completed.
 * 
 * @remarks
 * This function:
 * 1. Validates the user inputs (transaction address, transport emissions, and account) using a schema.
 * 2. Initiates the blockchain call to load the package and records the transport emissions.
 * 3. Returns a success message upon successful package loading or an error message if the process fails.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/product/load/load', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     transactionAddress: '0xTransactionAddress',
 *     transportEmissions: 100,
 *   })
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const parsedInputs = userInputsSchema.safeParse(await request.json());
    if (!parsedInputs.success) {
      throw new Error(`${parsedInputs.error}`);
    }
    const { transactionAddress, transportEmissions } = parsedInputs.data;

    // Blockchain transaction to load the package and log transport emissions
    await packageWithoutTransporterInterface.address(transactionAddress).method("load").sendTransaction(Utils.toUint18Decimals(transportEmissions));

    return NextResponse.json({ message: 'Package loaded successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load package' }, { status: 500 });
  }
}
