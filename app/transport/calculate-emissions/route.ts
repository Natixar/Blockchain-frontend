/**
 * 
 * This API route handles POST requests to process transport emissions data. It validates input data, calculates transport emissions, generates a QR code, and sends an email with the results.
 * @module
 */

import { NextRequest, NextResponse } from 'next/server';
import validateInputs from './validateInputs';
import sendEmail from './sendEmail';
import generateQR from './generateQR';
import calculateTransportEmissions from './calculateTransportEmissions';

/**
 * POST handler for processing transport emissions and sending a summary via email.
 * 
 * @param {NextRequest} request - The incoming request object, which contains segments, loadCarried, transactionAddress, and email.
 * @returns {Promise<NextResponse>} A JSON response containing the calculated transport emissions and a QR code in SVG format.
 * 
 * @throws {Error} Will throw an error if input validation, emissions calculation, QR code generation, or email sending fails.
 * 
 * @remarks
 * This function:
 * 1. Validates the incoming request using the `validateInputs` function.
 * 2. Calculates the transport emissions based on the provided segments and load carried.
 * 3. Generates a QR code that contains the transaction address and transport emissions.
 * 4. Sends an email with the emissions data and a QR code image.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transport/calculate-emissions', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     segments: [...],
 *     loadCarried: 1000,
 *     transactionAddress: '0xTransactionAddress',
 *     email: 'user@example.com'
 *   })
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { segments, loadCarried, transactionAddress, email } = await validateInputs(request);
    const transportEmissions = await calculateTransportEmissions(segments, loadCarried);
    const { qrCodeJpg, qrCodeSvg } = await generateQR(transactionAddress, transportEmissions);
    await sendEmail(email, transportEmissions, qrCodeJpg);

    return NextResponse.json({ transportEmissions, qrCodeSvg }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}