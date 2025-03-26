import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {

    const holderAddress = request.headers.get('X-FusionAuth-BlockchainAddress');
    const tokenAddress = request.url.match(/tokenAddress=([^?&]+)/i)?.[1];

    if (!holderAddress || !tokenAddress) {
      return NextResponse.json(
        { error: 'Both holder address and token address are required.' },
        { status: 400 }
      );
    }

    // Fetch token transactions
    const transactionData = await fetchFromExplorer('', {
      module: 'account',
      action: 'tokentx',
      address: holderAddress,
      contractaddress: tokenAddress,
      sort: 'desc',
      filterby: 'to'
    });

    // Format and return transactions
    const formattedTransactions = transactionData.result.map((tx: any) => formatTransaction(tx));
    return NextResponse.json(formattedTransactions);
    
  } catch (error) {
    console.error('Error retrieving token transactions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve token transactions.' },
      { status: 500 }
    );
  }
}

// Utility function to fetch data from the blockchain explorer API
async function fetchFromExplorer(endpoint: string, params: Record<string, string>) {
  const url = new URL(endpoint || 'api', `${process.env.BLOCKCHAIN_EXPLORER_URL || 'https://api.etherscan.io/'}`);
  url.searchParams.append('apikey', process.env.ETHERSCAN_API_KEY || '');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  
  return response.json();
}

// Format transaction data
function formatTransaction(tx: any) {
  const valueInTokenUnits = Number(tx.value) / 10**18 / 1000;
  
  const date = new Date(parseInt(tx.timeStamp) * 1000);
  const formattedDate = date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    timeStamp: tx.timeStamp,
    blockNumber: tx.blockNumber,
    formattedTime: formattedDate,
    formattedValue: valueInTokenUnits.toFixed(2)
  };
}
