import app from '@/app/blockchain/src';
import { NextRequest, NextResponse } from 'next/server';

// Define a new product
export async function POST(request: NextRequest) {

  const { name, symbol, price } = await request.json();

  try {
    app.declareProduct(process.env.BLOCKCHAIN_NATIXAR_FACTORY as string, {name, symbol, price});
    return NextResponse.json({ message: 'Product defined successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to define product.' }, { status: 500 });
  }
}