import { NextRequest, NextResponse } from 'next/server';
import { Factory } from '@/app/blockchain/src/AdminSDK/Factory';
import { z } from 'zod';
import { packageWithoutTransporterInterface } from '@/app/blockchain/src';

/**
 * Schema to validate user inputs
 */
const userInputsSchema = z.object({
  transactionHash: z.string().min(1, "transactionHash cannot be empty"), // Transaction hash should be non-empty
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const parsedInputs = userInputsSchema.safeParse(await request.json());
    if (!parsedInputs.success) {
      throw new Error(`${parsedInputs.error}`);
    }
    const { transactionHash } = parsedInputs.data;

    const commodityAddress: string = await packageWithoutTransporterInterface.address(transactionHash).method('getMineral').call();

    const history: any[] = await Factory.singleton.history(commodityAddress, transactionHash);

    console.log(history)

    // Enrich history data with group and related names
    const enrichedHistory = await Promise.all(
      history.map(async (entry: any) => {
        if (entry.method === 'createMineral' || entry.method === 'mint' || entry.method === 'createPackageWithoutTransporter') {
          try {
            const groupResponse = await fetch(
              `${process.env.FUSIONAUTH_ISSUER}/api/group/${entry['private-key-uuid']}`,
              {
                headers: { Authorization: `${process.env.FUSIONAUTH_API_KEY}` },
              }
            );
            const groupData = await groupResponse.json();
            entry.groupName = groupData.group?.name || 'Unknown';
          } catch {
            entry.groupName = 'Unknown';
          }
        }
        return entry;
      })
    );

    return NextResponse.json(enrichedHistory);
  } catch (error: any) {
    console.error("Error processing history request:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
