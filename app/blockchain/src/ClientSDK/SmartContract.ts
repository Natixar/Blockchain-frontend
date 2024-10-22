import { Factory, ClientSDK } from "./Factory";
import { TransactionReceipt } from "./TransactionReceipt";

export class SmartContract {
    static init(name: string): SmartContractInterface {
        return new SmartContractInterface(name);
    }
}

export class SmartContractInterface {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    public address(address: string): SmartContractInstance {
        return new SmartContractInstance(this, address);
    }
}

export class SmartContractInstance {
    public interface: SmartContractInterface;
    public address: string;

    constructor(_interface: SmartContractInterface, address: string) {
        this.interface = _interface;
        this.address = address;
    }

    public method(method: string): SmartContractMethod {
        return new SmartContractMethod(this, method);
    }
}

export class SmartContractMethod {
    public instance: SmartContractInstance;
    public method: string;

    constructor(instance: SmartContractInstance, method: string) {
        this.instance = instance;
        this.method = method;
    }

    // if they are no params, the method will be called without any params
    public async call() : Promise<any> {
        return await new SmartContractExec(this).call();
    }

    public async sendTransaction() : Promise<TransactionReceipt> {
        return await new SmartContractExec(this).sendTransaction();
    }

    // if there are params, the method will be called with the params
    public params(...params: any[]): SmartContractExec {
        return new SmartContractExec(this, params);
    }
}

export class SmartContractExec {
    public method: SmartContractMethod;
    public params: any[];

    constructor(method: SmartContractMethod, ...params: any[]) {
        this.method = method;
        this.params = params;
    }

    public async call() : Promise<any> {
        return await this.request<any>('call');
    }

    public async sendTransaction() : Promise<TransactionReceipt> {
        return await this.request<TransactionReceipt>('sendTransaction');
    }

    private async request<T>(route: string) : Promise<T> {
        if (!this.method.instance.interface.name || !this.method.instance.address || !this.method) {
            throw new Error('Contract name, contract address, and method name are required');
        }
        if (Factory.singleton instanceof ClientSDK === false) {
            throw new Error('ClientSDK not initialized');
        }
        try {
            // console.log({
            //     interfaceName: this.method.instance.interface.name,
            //     instanceAddress: this.method.instance.address,
            //     method: this.method,
            //     params: this.params,
            // });

            const headers = {
                'Content-Type': 'application/json',
                'Auth-Type': 'public',
                'Public-Api-Key': Factory.singleton.publicKey || '',
                'Jwt': Factory.singleton.jwt || '',
            }

            const response = await fetch(`${Factory.singleton.apiUrl}/${route}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    interfaceName: this.method.instance.interface.name,
                    instanceAddress: this.method.instance.address,
                    method: this.method,
                    params: this.params,
                }),
            });

            if (response.status === 401) {
                await Factory.singleton.reloadJwt();
                return await this.request<T>(route);
            }
            if (!response.ok) {
                throw new Error('Failed to sign transaction');
            }

            const json = await response.json() as T;
            return json;
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }
}
