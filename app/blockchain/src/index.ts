import { Factory } from './AdminSDK/Factory';
import { SmartContract } from './AdminSDK/SmartContract';

await Factory.init(process.env.BLOCKCHAIN_RPC_URL!, process.env.BLOCKCHAIN_RPC_KEY!);

export const natixarFactory = SmartContract.init("NatixarFactory").address(process.env.BLOCKCHAIN_NATIXAR_FACTORY || '');
export const mineralInterface = SmartContract.init("Mineral");
export const packageWithoutTransporterInterface = SmartContract.init("PackageWithoutTransporter");

export const FactorySingleton = Factory.singleton;

// export const [Mine_1, Trader_1, Refiner_1, Smelter_1, Factory_1, Mine_2] = ["0xe2a2e503436ca6b32225509ae567406bcabdd743", "0x732d3972d5bd4cf3a4279d492d0be288458ca936", "0xe26a2a861966e496a4529645a671bccee4057d8a", "0x0a7f931fe970210849f26dfa12559aea18fd5f11", "0x648fa3b0847e56c60b761d7cb3a5a06af928432b", "0x890b89689af49770c0fb4ba2ab95e858768d36de", "0x8c33d88b95bc8561a997b92a3523039c512b547a"];
