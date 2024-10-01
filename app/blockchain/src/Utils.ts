import { ethers } from "ethers";

export class Utils {
    static toUint(amount: number, decimals: number = 18) {
        return ethers.parseUnits(amount.toString(), decimals).toString();
    }
    static toUint18Decimals(amount: number) {
        return ethers.parseUnits(amount.toString(), 18).toString();
    }

    static async addressToName(address: string) {
        const groupResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/group`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
                Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
            },
        });
        if (!groupResponse.ok) {
            throw new Error('Failed to fetch groups');
        }
        const data: { groups: { data: { blockchainAddress: string }, name: string }[] } = await groupResponse.json();
        return data.groups.find(group => group.data.blockchainAddress === address)?.name || '';
    }
}