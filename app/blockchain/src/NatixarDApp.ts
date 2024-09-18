import { Account } from './Interface/Account';
import { Web3Builder } from './Web3Builder';
import { Web3Signer } from './Web3Signer';
import packageWithoutTransporterAbi from '../abi/PackageWithoutTransporter.json';
import natixarFactoryAbi from '../abi/NatixarFactory.json';
import mineralAbi from '../abi/Mineral.json';

export class NatixarDApp {
    packageWithoutTransporter = Web3Builder.getInstance().initContract(packageWithoutTransporterAbi);
    natixarFactory = Web3Builder.getInstance().initContract(natixarFactoryAbi);
    mineral = Web3Builder.getInstance().initContract(mineralAbi);

    // Function to create a mineral
    declareProduct(contractAddress: string, params: { name: string, symbol: string, price: number }) {
        const data = this.natixarFactory.contract(contractAddress).methods.createMineral(params.name, params.symbol, Web3Builder.toWei(params.price));
        return new Web3Signer(contractAddress, this.natixarFactory.abi, data);
    }

    // Function to get minerals of an account
    async getMinerals(contractAddress: string, accountAddress: string) {
        const productAddresses: string[] = await this.natixarFactory.contract(contractAddress).methods.getMinerals(accountAddress).call();

        const productDetailsPromises = productAddresses.map(async (productAddress) => {
            const name = await this.mineral.contract(productAddress).methods.name().call();
            const symbol = await this.mineral.contract(productAddress).methods.symbol().call();
            const price = Number(await this.mineral.contract(productAddress).methods.price().call()) / Math.pow(10, 18);
            const quantity = Number(await this.mineral.contract(productAddress).methods.balanceOf(accountAddress).call()) / Math.pow(10, 18);
            const co2 = Number(await this.mineral.contract(productAddress).methods.footprintOf(accountAddress).call()) / Math.pow(10, 18);

            return {
                address: productAddress,
                name,
                symbol,
                price,
                quantity,
                co2
            };
        });

        return await Promise.all(productDetailsPromises);
    }

    // Function to mint a product
    mintProduct(productAddress: string, params: { quantity: number, footprint: number }) {
        const data = this.mineral.contract(productAddress).methods.mint(Web3Builder.toWei(params.quantity), Web3Builder.toWei(params.footprint));
        return new Web3Signer(productAddress, this.mineral.abi, data);
    }

    // Function to mint a product
    transformProduct(productAddress: string, params: { quantity: number, footprint: number }) {
        const data = this.mineral.contract(productAddress).methods.mint(Web3Builder.toWei(params.quantity), Web3Builder.toWei(params.footprint));
        return new Web3Signer(productAddress, this.mineral.abi, data);
    }

    // Function to add a document to a mineral
    addDocument(contractAddress: string, params: { documentHash: string }) {
        const data = this.mineral.contract(contractAddress).methods.addDocument(params.documentHash);
        return new Web3Signer(contractAddress, this.mineral.abi, data);
    }

    // Function to remove a document from a mineral
    removeDocument(contractAddress: string, params: { documentHash: string }) {
        const data = this.mineral.contract(contractAddress).methods.removeDocument(params.documentHash);
        return new Web3Signer(contractAddress, this.mineral.abi, data);
    }

    // Function to get documents of a mineral
    async getDocuments(productAddress: string) {
        const documents = await this.mineral.contract(productAddress).methods.getDocuments().call();
        return documents;
    }

    // Function to create a package
    createPackageWithoutTransporter(contractAddress: string, params: { from: string, to: string, product: string, quantity: number }) {
        const data = this.natixarFactory.contract(contractAddress).methods.createPackageWithoutTransporter(params.from, params.to, params.product, Web3Builder.toWei(params.quantity));
        return new Web3Signer(contractAddress, this.natixarFactory.abi, data);
    }

    private async addressToName(address: string) {
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

    // Function to get minerals of an account
    async getPackages(contractAddress: string, accountAddress: string) {

        const transactionAddresses: string[] = await this.natixarFactory.contract(contractAddress).methods.getPackagesWithoutTransporter(accountAddress).call();

        // console.log(this.packageWithoutTransporter.contract(productAddresses[0]).methods)

        const transactionDetailsPromises = transactionAddresses.map(transactionAddress => this.getPackage(transactionAddress, accountAddress));

        return await Promise.all(transactionDetailsPromises);
    }

    async getPackage(transactionAddress: string, accountAddress: string) {
        let from: string = await this.packageWithoutTransporter.contract(transactionAddress).methods.getFrom().call();
        from = await this.addressToName(from.toLowerCase());
        let to: string = await this.packageWithoutTransporter.contract(transactionAddress).methods.getTo().call();
        to = await this.addressToName(to.toLowerCase());
        const productAddress: string = await this.packageWithoutTransporter.contract(transactionAddress).methods.getMineral().call();
        // const status = await this.packageWithoutTransporter.contract(productAddress).methods.getStatus().call();
        const name = await this.mineral.contract(productAddress).methods.name().call();
        const symbol = await this.mineral.contract(productAddress).methods.symbol().call();
        const price = Math.round(Number(await this.mineral.contract(productAddress).methods.price().call()) / Math.pow(10, 18));
        const quantity = Math.round(Number(await this.packageWithoutTransporter.contract(transactionAddress).methods.getAmount().call()) / Math.pow(10, 18));
        const co2 = Math.round(Number(await this.mineral.contract(productAddress).methods.footprintOf(accountAddress).call()) / Math.pow(10, 18));

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

    // Function to load a package
    loadPackage(contractAddress: string, params: { transportEmissions: number }) {
        const data = this.packageWithoutTransporter.contract(contractAddress).methods.load(Web3Builder.toWei(params.transportEmissions));
        return new Web3Signer(contractAddress, this.packageWithoutTransporter.abi, data);
    }

    // Function to unload a package
    unloadPackage(contractAddress: string) {
        const data = this.packageWithoutTransporter.contract(contractAddress).methods.unload();
        return new Web3Signer(contractAddress, this.packageWithoutTransporter.abi, data);
    }

    // // Function to complete a package
    // completePackage(packageAddress: string, footprint: number, account: any) {
    //     const data = this.setup.packageWithoutTransporter.contract(packageAddress).methods.complete(Web3Interface.toWei(footprint));
    //     return await this.setup.makeAndSendTransaction(account, packageAddress, data, this.setup.packageWithoutTransporter.abi);
    // }

    // // Function to complete a package with a signature
    // completePackageSig(packageAddress: string, footprint: number, transporterCompleteSignature: string, account: any) {
    //     const data = this.setup.packageWithoutTransporter.contract(packageAddress).methods.completeSig(Web3Interface.toWei(footprint), transporterCompleteSignature);
    //     return await this.setup.makeAndSendTransaction(account, packageAddress, data, this.setup.packageWithoutTransporter.abi);
    // }

    // // Function to close a package
    // closePackage(packageAddress: string, account: any) {
    //     const data = this.setup.packageWithoutTransporter.contract(packageAddress).methods.close();
    //     await this.setup.makeAndSendTransaction(account, packageAddress, data, this.setup.packageWithoutTransporter.abi);
    // }

    // // Function to generate a hash
    // generatePackageHash(transporter: string, from: string, to: string, mineral: string, amount: number): string {
    //     let hash = ethers.keccak256(ethers.solidityPacked(
    //         ['address', 'address', 'address', 'address', 'uint256'],
    //         [transporter, from, to, mineral, amount.toString()+"000000000000000000"]
    //     ));
    //     return hash;
    // }

    // generatePackageCompleteHash(amount: number): string {
    //     const hash = ethers.keccak256(ethers.solidityPacked(
    //          ['uint256'],
    //          [amount.toString()+"000000000000000000"]
    //     ));
    //     return hash;
    // }


}