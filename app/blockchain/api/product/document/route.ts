/**
 * 
 * This API route handles POST, DELETE, and GET requests for managing documents related to a product on the blockchain.
 * It allows for adding, removing, and retrieving documents using the product address and document hashes.
 * @module
 */

import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema to validate common user inputs, including the product address and account details.
 */
const userInputsSchema = z.object({
  productAddress: z.string().min(1, "productAddress cannot be empty"),
  account: z.object({
    keyId: z.string().min(1, "keyId is required"),
    address: z.string().min(1, "address is required"),
  })
});

/**
 * Schema for adding multiple documents, which extends the common user inputs schema.
 * Ensures at least one document hash is provided.
 */
const addDocumentsSchema = userInputsSchema.merge(
  z.object({
    documentHashes: z.array(z.string()).nonempty("At least one document hash is required"),
  })
);

/**
 * Schema for removing a document, which extends the common user inputs schema.
 * Validates a single document hash.
 */
const removeDocumentSchema = userInputsSchema.merge(
  z.object({
    documentHash: z.string().min(1, "documentHash cannot be empty"),
  })
);

/**
 * POST handler for adding multiple documents to a product on the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the product address, document hashes, and account details.
 * @returns {Promise<NextResponse>} A JSON response indicating whether the documents were added successfully or an error occurred.
 * 
 * @throws {Error} Throws an error if input validation fails or if the blockchain transaction to add documents fails.
 * 
 * @remarks
 * This function:
 * 1. Validates the user inputs using the `addDocumentsSchema`.
 * 2. Iterates over the provided document hashes and adds each document to the product on the blockchain.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/blockchain/api/product/document', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     productAddress: '0xProductAddress',
 *     documentHashes: ['hash1', 'hash2'],
 *     account: { keyId: '1', address: '0xAccountAddress' }
 *   }),
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const parsedInputs = addDocumentsSchema.safeParse(await request.json());
    if (!parsedInputs.success) {
      throw new Error(`${parsedInputs.error}`);
    }
    const { productAddress, documentHashes, account } = parsedInputs.data;

    // Process each document hash and add it to the blockchain
    for (const documentHash of documentHashes) {
      await app.addDocument(productAddress, { documentHash }).signAndSend(account);
    }

    return NextResponse.json({ message: 'Documents added successfully.' });
  } catch (error) {
    console.error('Error adding documents:', error);
    return NextResponse.json({ error: 'Failed to add documents.' }, { status: 500 });
  }
}

/**
 * DELETE handler for removing a document from a product on the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the product address, document hash, and account details.
 * @returns {Promise<NextResponse>} A JSON response indicating whether the document was removed successfully or an error occurred.
 * 
 * @throws {Error} Throws an error if input validation fails or if the blockchain transaction to remove the document fails.
 * 
 * @remarks
 * This function:
 * 1. Validates the user inputs using the `removeDocumentSchema`.
 * 2. Removes the specified document from the product on the blockchain.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/blockchain/api/product/document', {
 *   method: 'DELETE',
 *   body: JSON.stringify({
 *     productAddress: '0xProductAddress',
 *     documentHash: 'hash1',
 *     account: { keyId: '1', address: '0xAccountAddress' }
 *   })
 * });
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const parsedInputs = removeDocumentSchema.safeParse(await request.json());
    if (!parsedInputs.success) {
      throw new Error(`${parsedInputs.error}`);
    }
    const { productAddress, documentHash, account } = parsedInputs.data;

    await app.removeDocument(productAddress, { documentHash }).signAndSend(account);

    return NextResponse.json({ message: 'Document removed successfully.' });
  } catch (error) {
    console.error('Error removing document:', error);
    return NextResponse.json({ error: 'Failed to remove document.' }, { status: 500 });
  }
}

/**
 * GET handler for retrieving all documents associated with a product on the blockchain.
 * 
 * @param {NextRequest} request - The incoming request object containing the `productAddress` as a query parameter.
 * @returns {Promise<NextResponse>} A JSON response with the retrieved documents or an error message.
 * 
 * @throws {Error} Throws an error if the product address is missing or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Retrieves the product address from the query parameters.
 * 2. Fetches and returns all associated documents from the blockchain.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/blockchain/api/product/document?productAddress=0xProductAddress', {
 *   method: 'GET'
 * });
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const productAddress = request.nextUrl.searchParams.get('productAddress');
    if (!productAddress) {
      return NextResponse.json({ error: 'Missing product address' }, { status: 400 });
    }

    // Retrieve documents associated with the product from the blockchain
    const documents = await app.getDocuments(productAddress);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json({ error: 'Failed to retrieve documents.' }, { status: 500 });
  }
}
