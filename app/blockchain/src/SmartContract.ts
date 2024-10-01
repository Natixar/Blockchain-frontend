import { Factory } from "./Factory";
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

    public async call(...params: any[]) : Promise<any> {
        return await this.request<any>('call', ...params);
    }

    public async sendTransaction(...params: any[]) : Promise<TransactionReceipt> {
        return await this.request<TransactionReceipt>('sendTransaction', ...params);
    }

    private async request<T>(route: string, ...params: any[]) : Promise<T> {
        if (!this.instance.interface.name || !this.instance.address || !this.method) {
            throw new Error('Contract name, contract address, and method name are required');
        }
        try {          
            const response = await fetch(`${Factory.singleton.apiUrl}/${route}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'authorization': Factory.singleton.jwt,
                    'decodedjwt': JSON.stringify(Factory.singleton.jwt),
                },
                body: JSON.stringify({
                    interfaceName: this.instance.interface.name,
                    instanceAddress: this.instance.address,
                    method: this.method,
                    params: params,
                }),
            });

            if (response.status === 401) {
                await Factory.singleton.reloadJwt();
                return await this.request<T>(route, ...params);
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