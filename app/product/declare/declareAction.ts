'use server';

import { createHash } from 'crypto';
import fs from 'fs/promises';
import app from '@/app/blockchain/src';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';

const ACCEPTABLE_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function declareProductAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const selectedProduct = formData.get('selectedProduct') as string | null;
  const name = formData.get('name') as string | null;
  const symbol = formData.get('symbol') as string | null;
  const price = parseInt(formData.get('price')?.toString() || '0', 10);
  const files = formData.getAll('files') as File[];

  // If a custom product is defined, ensure name, symbol, and price are valid
  if (name && symbol && price > 0) {
    // Validate files only if they are provided
    for (const file of files) {
      if (file && file.name && file.size > 0) {
        if (!ACCEPTABLE_FILE_TYPES.includes(file.type)) {
          return { success: false, message: `Invalid file type: ${file.name}. Only JPEG, PNG, and PDF files are allowed.` };
        }
        if (file.size > MAX_FILE_SIZE) {
          return { success: false, message: `File too large: ${file.name}. Maximum size is 50MB.` };
        }
      }
    }

    // Declare custom product
    try {
      const declareProductReceipt = await app
        .declareProduct(process.env.BLOCKCHAIN_NATIXAR_FACTORY as string, { name, symbol, price })
        .signAndSend(Mine_1);

      const mineralAddress: string = declareProductReceipt.parsedLog?.CreateMineral.params.mineral;
      const documentHashes: string[] = [];

      for (const file of files) {
        const filePath = `/tmp/${file.name}`;
        await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
        const hash = await calculateFileHash(filePath);
        documentHashes.push(hash);
        await fs.unlink(filePath); // Clean up the temporary file
      }

      for (const documentHash of documentHashes) {
        await app.addDocument(mineralAddress, { documentHash }).signAndSend(Mine_1);
      }

      return { success: true, message: 'Product declared successfully' };
    } catch (error) {
      console.error('Failed to define product and add documents', error);
      return { success: false, message: 'An error occurred while declaring the custom product.' };
    }
  } else if (selectedProduct) {
    // If a predefined product is selected, just log the product
    return { success: true, message: `Predefined product "${selectedProduct}" was selected.` };
  } else {
    return { success: false, message: 'Invalid product details. Please check your inputs.' };
  }
}

// Helper function to calculate file hash
async function calculateFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const fullHash = createHash('sha256').update(fileBuffer).digest('hex');
  const truncatedHash = fullHash.slice(0, 32); // Take the first 32 characters (128 bits)
  
  // Convert the truncated hash from hex to a BigInt
  let hashInt = BigInt('0x' + truncatedHash);
  
  // Define the maximum value for uint128 validation
  const maxUint128 = BigInt('0xffffffffffffffffffffffffffffffff');
  
  // Force the hash to fit within the uint128 range by applying a bitwise AND with the max uint128 value
  hashInt = hashInt & maxUint128;
  
  // Return the forced valid uint128 value as a hexadecimal string
  return hashInt.toString();
}