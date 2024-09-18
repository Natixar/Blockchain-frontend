import { Web3Builder } from './Web3Builder';
import { NatixarDApp } from './NatixarDApp';

Web3Builder.init("http://37.187.103.134:7585", "http://37.187.103.134:3001/signTransaction");
const app = new NatixarDApp();

export default app;
