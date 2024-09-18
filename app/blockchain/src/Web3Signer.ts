import { Account } from "./Interface/Account";
import { Web3Builder } from "./Web3Builder";

export class Web3Signer {
    contractAddress: string;
    contractAbi: any;
    data: any;

    constructor(contractAddress: string, contractAbi: any, data: any) {
        this.contractAddress = contractAddress;
        this.contractAbi = contractAbi;
        this.data = data;
    }

    async signAndSend(account: Account) {
        const signedTx = await Web3Builder.getInstance().signTransaction(this.contractAddress, this.data, account);
        return await Web3Builder.getInstance().sendTransaction(signedTx, this.contractAbi);
    }
}