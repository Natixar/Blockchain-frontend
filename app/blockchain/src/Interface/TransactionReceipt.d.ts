export interface TransactionReceipt {
    blockHash: string;
    blockNumber: bigint;
    cumulativeGasUsed: bigint;
    from: Address;
    gasUsed: bigint;
    logs: { address?: string; topics?: string[]; data?: string; blockNumber?: bigint; transactionHash?: string; transactionIndex?: bigint; blockHash?: string; logIndex?: bigint; removed?: boolean; }[];
    decodedLog?: LogDescription[];
    parsedLog?: { [key: string]: { name: string; anonymous: boolean, params: any; } };
    logsBloom: string;
    status: bigint;
    to: Address;
    transactionHash: string;
    transactionIndex: bigint;
    type?: bigint;
    events?: any;
}