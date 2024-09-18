import * as Web3 from 'web3';

export interface Contract {
    abi: Web3.ContractAbi;
    contract: (address: string) => Web3.Contract<Web3.ContractAbi>;
};