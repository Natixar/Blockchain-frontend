import Web3, { ContractAbi } from 'web3';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { Account } from './Interface/Account';
import { Contract } from './Interface/Contract';
import { TransactionReceipt } from './Interface/TransactionReceipt';

export class Web3Builder {
    
     /**
     * 
     * singleton
     */

    private static instance: Web3Builder | null = null;

    public static init(rpcUrl: string, apiUrl: string, gasPrice: string = "0x00", debug: boolean = false) {
        Web3Builder.instance = new Web3Builder(rpcUrl, apiUrl, gasPrice, debug);
    }

    public static getInstance() {
        if (!Web3Builder.instance) {
            throw new Error("Web3Builder not initialized");
        }
        return Web3Builder.instance;
    }

    /**
     * 
     * constructor
     */

    private web3: Web3;
    private apiUrl: string;
    private gasPrice: string;
    private debug: boolean;

    private constructor(rpcUrl: string, apiUrl: string, gasPrice: string, debug: boolean) {
        this.web3 = new Web3(rpcUrl);
        this.apiUrl = apiUrl;
        this.gasPrice = gasPrice;
        this.debug = debug;
    }

    /**
     * 
     * public
     */

    public async signTransaction(contractAddress: string, data: any, account: Account) {
        const txData = await this.web3CreateTransaction(account.address, contractAddress, data);
        return await this.apiSignTransaction(account.keyId, txData);
    }

    public async sendTransaction(signedTx: string, contractAbi: ContractAbi) {
        const receipt = await this.web3SendTransaction(signedTx);
        if (contractAbi) {
            receipt.decodedLog = receipt.logs.map(log => this.web3DecodeLog(log, contractAbi));
            receipt.parsedLog = this.web3ParseLog(receipt);
        }
        return receipt;
    }

    public initContract(abi: ContractAbi) : Contract {
        const contract = (address: string) => new this.web3.eth.Contract(abi, address);
        return {
            abi,
            contract,
        }
    }

    /**
     * 
     * private
     */

    private async apiSignTransaction(accountKeyId: string, txData: any) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'keyid': accountKeyId
                },
                body: JSON.stringify({txData: txData}),
            });
            if (!response.ok) {
                throw new Error('Failed to sign transaction');
            }
            const json = await response.json() as any;
            return json.signedTx as string;
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }

    private async web3CreateTransaction(accountAddress: string, contractAddress: string, data: any) {
        const txData = {
            nonce: this.web3.utils.toHex(await this.web3.eth.getTransactionCount(accountAddress, 'latest')),
            gasLimit: this.web3.utils.toHex(await data.estimateGas({ from: accountAddress })),
            to: contractAddress,
            gasPrice: this.gasPrice,
            value: '0x00',
            data: data.encodeABI()
        };
        if (this.debug) console.log("txData:", txData);
        return txData;
    }

    private async web3SendTransaction(signedTx: string) {
        return new Promise<TransactionReceipt>((resolve, reject) => {
            this.web3.eth.sendSignedTransaction(signedTx)
                .on('receipt', (receipt: TransactionReceipt) => {
                    resolve(receipt);
                })
                .on('error', error => {
                    console.error("error:", error);
                    reject(error);
                });
        });
    }

    private web3DecodeLog(log: any, abi: ContractAbi) {
        const iface = new ethers.Interface(abi);
        return iface.parseLog(log);
    }

    private web3ParseLog(receipt: TransactionReceipt) {
        const events: any = {};

        receipt.decodedLog?.forEach(log => {
            if (log) {
                const params: any = {};
                log.fragment.inputs.forEach((input: { name: string | number; }, index: string | number) => {
                    params[input.name] = log.args[index];
                });
                events[log.name] = {
                    name: log.fragment.name,
                    anonymous: log.fragment.anonymous,
                    params: params,
                };
            }
        });

        return events;
    }

    /**
     * 
     * static
     */

    static toWei(amount: number) {
        return new Web3().utils.toWei(amount.toString(), 'ether');
    }
}
