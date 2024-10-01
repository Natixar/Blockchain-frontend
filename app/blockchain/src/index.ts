import { Web3Builder } from './Web3Builder';
import { NatixarDApp } from './NatixarDApp';

Web3Builder.init("http://37.187.103.134:7585", "http://37.187.103.134:3001/signTransaction");
const app = new NatixarDApp();

export default app;

import { Factory } from './Factory';
// import { Mine_1_tenantId } from './setupAccounts';
import { SmartContract } from './SmartContract';

// await Factory.init(process.env.BLOCKCHAIN_RPC_URL!, async () => {
//     // Mine_1
//     return {"tenantId": Mine_1_tenantId, "aud":"3c219e58-ed0e-4b18-ad48-f4f92793ae32","exp":1710113030,"iat":1710112970,"iss":"acme.com","sub":"79a89713-2f84-479a-94b7-a63fec7e97ef","jti":"88e28e67-1965-4e87-aa67-f873607f071b","authenticationType":"PASSWORD","email":"imr@inbox.ru","email_verified":true,"preferred_username":"abcdef","applicationId":"3c219e58-ed0e-4b18-ad48-f4f92793ae32","scope":"offline_access","roles":["user"],"sid":"0747af15-5c6a-4a1e-97c3-e10b7ed94eb8","auth_time":1710112970,"tid":"d5a5b255-c0b9-eab1-e918-25ce27ee92be"};
    
//     // // Refiner_1
//     // // return {"tenantId": Refiner_1_tenantId, "aud":"3c219e58-ed0e-4b18-ad48-f4f92793ae32","exp":1710113030,"iat":1710112970,"iss":"acme.com","sub":"79a89713-2f84-479a-94b7-a63fec7e97ef","jti":"88e28e67-1965-4e87-aa67-f873607f071b","authenticationType":"PASSWORD","email":"imr@inbox.ru","email_verified":true,"preferred_username":"abcdef","applicationId":"3c219e58-ed0e-4b18-ad48-f4f92793ae32","scope":"offline_access","roles":["user"],"sid":"0747af15-5c6a-4a1e-97c3-e10b7ed94eb8","auth_time":1710112970,"tid":"d5a5b255-c0b9-eab1-e918-25ce27ee92be"};
// });

export const natixarFactory = SmartContract.init("NatixarFactory").address(process.env.BLOCKCHAIN_NATIXAR_FACTORY || '');
export const mineralInterface = SmartContract.init("Mineral");
export const packageWithoutTransporterInterface = SmartContract.init("PackageWithoutTransporter");
