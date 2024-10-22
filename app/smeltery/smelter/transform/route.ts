import { natixarFactory } from '@/app/blockchain/src';
import { Utils } from '@/app/blockchain/src/ClientSDK/Utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { input, output, footprint } = await request.json();
  
  try {
    const groupId = request.headers.get('X-FusionAuth-GroupId') || '';

    // Map input array to transform quantities to Uint18 decimals
    const transformedInput = input.map((item: { mineral: string, quantity: number }) => ({
      mineral: item.mineral,
      amount: Utils.toUint18Decimals(item.quantity)
    }));

    // Map output array to transform quantities to Uint18 decimals
    const transformedOutput = output.map((item: { mineral: string, quantity: number }) => ({
      mineral: item.mineral,
      amount: Utils.toUint18Decimals(item.quantity)
    }));

    // Transform footprint to Uint18 decimals
    const transformedFootprint = Utils.toUint18Decimals(footprint);

    // Call the factory method with transformed inputs and outputs
    await natixarFactory.method("tranformMineral").params(
      transformedInput,
      transformedOutput,
      transformedFootprint
    ).sendTransaction(groupId);

    return NextResponse.json({ message: 'Products transformed successfully.' });
  } catch (error) {
    console.error('Failed to transform products:', error);
    return NextResponse.json({ error: 'Failed to transform products.' }, { status: 500 });
  }
}
