import { Factory, AdminSDK } from "./Factory";
import { TransactionReceipt } from "./TransactionReceipt";

export class SmartContract {
    static init(name: string): SmartContractInterface {
        return new SmartContractInterface(name);
    }
}

export class SmartContractInterface {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public address(address: string): SmartContractInstance {
        return new SmartContractInstance(this.name, address);
    }
}

export class SmartContractInstance {
    private name: string;
    private address: string;

    constructor(name: string, address: string) {
        this.name = name;
        this.address = address;
    }

    public method(method: string): SmartContractMethod {
        return new SmartContractMethod(this.name, this.address, method);
    }
}

export class SmartContractMethod {
    private name: string;
    private address: string;
    private method: string;

    constructor(name: string, address: string, method: string) {
        this.name = name;
        this.address = address;
        this.method = method;
    }

    // if they are no params, the method will be called without any params
    public async call() : Promise<any> {
        return await new SmartContractExec(this.name, this.address, this.method).call();
    }

    public async sendTransaction(uid: string) : Promise<TransactionReceipt> {
        return await new SmartContractExec(this.name, this.address, this.method).sendTransaction(uid);
    }

    // if there are params, the method will be called with the params
    public params(...params: any[]): SmartContractExec {
        return new SmartContractExec(this.name, this.address, this.method, ...params);
    }
}

export class SmartContractExec {
    private name: string;
    private address: string;
    private method: string;
    private params: any[];

    constructor(name: string, address: string, method: string, ...params: any[]) {
        this.name = name;
        this.address = address;
        this.method = method;
        this.params = params;
    }

    public async call() : Promise<any> {
        return await this.request<any>('call');
    }

    public async sendTransaction(uid: string) : Promise<TransactionReceipt> {
        return await this.request<TransactionReceipt>('sendTransaction', uid);
    }

    private async request<T>(route: string, uid?: string) : Promise<T> {
        if (!this.name || !this.address || !this.method) {
            throw new Error('Contract name, contract address, and method name are required');
        }
        if (Factory.singleton instanceof AdminSDK === false) {
            throw new Error('ClientSDK not initialized');
        }
        try {
            // console.log({
            //     interfaceName: this.name,
            //     instanceAddress: this.address,
            //     method: this.method,
            //     params: this.params,
            //     'Private-Api-Key': Factory.singleton.privateKey,
            //     'private-key-uuid': uid,
            // });

            const headers = {} as any;
            headers['Content-Type'] = 'application/json';
            headers['Auth-Type'] = 'private';
            headers['Private-Api-Key'] = Factory.singleton.privateKey;
            if (uid) headers['private-key-uuid'] = uid;

            const response = await fetch(`${Factory.singleton.apiUrl}/${route}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    interfaceName: this.name,
                    instanceAddress: this.address,
                    method: this.method,
                    params: this.params,
                }),
            });

            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                const message = `Error when accessing smart contract: ${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            const json = await response.json() as T;
            return json;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}