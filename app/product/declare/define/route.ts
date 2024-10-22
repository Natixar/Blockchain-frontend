import { NextRequest, NextResponse } from 'next/server';
import { mineralInterface, natixarFactory } from '@/app/blockchain/src';
import { Utils } from '@/app/blockchain/src/ClientSDK/Utils';
import { ethers } from 'ethers';

const ACCEPTABLE_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// The main POST handler for declaring a product
export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();

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
          return NextResponse.json({ success: false, message: `Invalid file type: ${file.name}. Only JPEG, PNG, and PDF files are allowed.` });
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ success: false, message: `File too large: ${file.name}. Maximum size is 50MB.` });
        }
      }
    }

    const groupId = req.headers.get('X-FusionAuth-GroupId') || '';

    try {
      // Declare custom product using the blockchain method
      const declareProductReceipt = await natixarFactory.method("createMineral").params(name, symbol, Utils.toUint18Decimals(price)).sendTransaction(groupId);
      const commodityAddress: string = declareProductReceipt.parsedLog?.CreateMineral.params.mineral;
      const documentNames: string[] = [];

      // Process each file: capture the filename only
      for (const file of files) {
        documentNames.push(file.name);
      }

      // Add document hashes to the blockchain
      for (const documentName of documentNames) {
        await mineralInterface.address(commodityAddress).method("addDocument").params(ethers.keccak256(ethers.toUtf8Bytes(documentName))).sendTransaction(groupId);
      }

      return NextResponse.json({ success: true, message: 'Product declared successfully' });
    } catch (error) {
      console.error('Failed to define product and add documents', error);
      return NextResponse.json({ success: false, message: 'An error occurred while declaring the custom product.' });
    }
  } else if (selectedProduct) {
    // If a predefined product is selected, just log the product
    return NextResponse.json({ success: true, message: `Predefined product "${selectedProduct}" was selected.` });
  } else {
    return NextResponse.json({ success: false, message: 'Invalid product details. Please check your inputs.' });
  }
}
