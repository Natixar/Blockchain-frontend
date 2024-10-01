/**
 * 
 * This API route handles GET requests to retrieve blockchain transactions related to a specific account.
 * The transactions are fetched by calling a blockchain function that interacts with the Natixar Factory contract.
 * @module
 */

import { mineralInterface, natixarFactory, packageWithoutTransporterInterface } from '@/app/blockchain/src';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';
import { Utils } from '@/app/blockchain/src/Utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for retrieving transactions associated with a specific account address.
 * 
 * @param {NextRequest} request - The incoming request object, which contains the `accountAddress` as a query parameter.
 * @returns {Promise<NextResponse>} A JSON response with the retrieved transactions or an error message.
 * 
 * @throws {Error} Will throw an error if the `accountAddress` is not provided or if the blockchain request fails.
 * 
 * @remarks
 * This function:
 * 1. Extracts the `accountAddress` query parameter from the request URL.
 * 2. Calls the blockchain function `getPackages` to retrieve transactions associated with the provided account address from the Natixar Factory contract.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transactions/list/getTransactions?accountAddress=0xAccountAddress123', {
 *   method: 'GET'
 * });
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const transactionAddress = request.nextUrl.searchParams.get('transactionAddress');
    try {
        if (transactionAddress) {
            return NextResponse.json(await getPackage(transactionAddress, Mine_1));
        } else {
            const transactionAddresses: string[] = await natixarFactory.method("getPackagesWithoutTransporter").call(Mine_1);
            const transactionDetailsPromises = transactionAddresses.map(transactionAddress => getPackage(transactionAddress, Mine_1));
            return NextResponse.json(await Promise.all(transactionDetailsPromises));
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
    }
}

async function getPackage(transactionAddress: string, accountAddress: string) {
    let from: string = await packageWithoutTransporterInterface.address(transactionAddress).method('getFrom').call();
    from = await Utils.addressToName(from.toLowerCase());
    let to: string = await packageWithoutTransporterInterface.address(transactionAddress).method('getTo').call();
    to = await Utils.addressToName(to.toLowerCase());
    const productAddress: string = await packageWithoutTransporterInterface.address(transactionAddress).method('getMineral').call();
    // const status = await this.packageWithoutTransporter.contract(productAddress).methods.getStatus().call();
    const name = await mineralInterface.address(productAddress).method('name').call();
    const symbol = await mineralInterface.address(productAddress).method('symbol').call();
    const price = Math.round(Number(await mineralInterface.address(productAddress).method('price').call()) / Math.pow(10, 18));
    const quantity = Math.round(Number(await packageWithoutTransporterInterface.address(transactionAddress).method('getAmount').call()) / Math.pow(10, 18));
    const co2 = Math.round(Number(await mineralInterface.address(productAddress).method('footprintOf').call(accountAddress)) / Math.pow(10, 18));

    return {
        address: transactionAddress.substring(2, 8).toUpperCase(),
        from,
        to,
        product: {
            name,
            symbol,
            quantity,
            price,
            co2
        },
        // status
    };
}