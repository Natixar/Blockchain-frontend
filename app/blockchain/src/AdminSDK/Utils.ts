import { ethers } from "ethers";

export class Utils {
    static toUint(amount: number, decimals: number = 18) {
        return ethers.parseUnits(amount.toString(), decimals).toString();
    }
    static toUint18Decimals(amount: number) {
        return ethers.parseUnits(amount.toString(), 18).toString();
    }
}