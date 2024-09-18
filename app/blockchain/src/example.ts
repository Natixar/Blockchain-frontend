// const main = async () => {
//     // // Example of creating a mineral
//     const createMineralReceipt = await dapp.createMineral(NATIXAR_FACTORY, {name: "Gold", symbol: "GLD", price: 778}).signAndSend(Mine_1);
//     console.log("createMineralReceipt:", .parsedLog, "\n-----------------------------------\n\n");
//     const mineralAddress = createMineralReceipt.parsedLog["CreateMineral"].params.mineral;

//     console.log("getMinerals for Mine_1:", await dapp.getMinerals(NATIXAR_FACTORY, Mine_1));

//     // // Example of minting a mineral
//     const mintMineralReceipt = await dapp.mintMineral(mineralAddress, {amount: 1000, footprint: 250}).signAndSend(Mine_1);
//     console.log("mintMineralReceipt:", mintMineralReceipt.parsedLog, "\n-----------------------------------\n\n");

//     // // Example of adding and removing a document
//     const addDocumentReceipt = await dapp.addDocument(mineralAddress, { documentHash: "300016188978379939523308369749962306008" }).signAndSend(Mine_1);
//     console.log("addDocumentReceipt:", addDocumentReceipt.parsedLog, "\n-----------------------------------\n\n");

//     const removeDocumentReceipt = await dapp.removeDocument(mineralAddress, { documentHash: "300016188978379939523308369749962306008" }).signAndSend(Mine_1);
//     console.log("removeDocumentReceipt:", removeDocumentReceipt.parsedLog, "\n-----------------------------------\n\n");

//     console.log("getDocuments for", mineralAddress, ":", await dapp.getDocuments(mineralAddress));

//     // // Example of creating a package
//     const createPackageWithoutTransporterReceipt = await dapp.createPackageWithoutTransporter(NATIXAR_FACTORY, {from: Mine_1.address, to: Refiner_1.address, mineral: mineralAddress, amount: 100} ).signAndSend(Mine_1);
//     console.log("createPackageWithoutTransporterReceipt:", createPackageWithoutTransporterReceipt.parsedLog, "\n-----------------------------------\n\n");
//     const packageAddress = createPackageWithoutTransporterReceipt.parsedLog["CreatePackageWithoutTransporter"].params.packageWithoutTransporter;

//     console.log("getPackagesWithoutTransporter for Mine_1:", await dapp.getPackagesWithoutTransporter(NATIXAR_FACTORY, Mine_1));

//     // // Example of loading, unloading and completing a package
//     const loadPackageWithoutTransporterReceipt = await dapp.loadPackageWithoutTransporter(packageAddress, {footprint: 100}).signAndSend(Mine_1);
//     console.log("loadPackageWithoutTransporterReceipt:", loadPackageWithoutTransporterReceipt.parsedLog, "\n-----------------------------------\n\n");

//     const unloadPackageWithoutTransporterReceipt = await dapp.unloadPackageWithoutTransporter(packageAddress).signAndSend(Refiner_1);
//     console.log("unloadPackageWithoutTransporterReceipt:", unloadPackageWithoutTransporterReceipt.parsedLog, "\n-----------------------------------\n\n");
// };

// main().catch(console.error);
