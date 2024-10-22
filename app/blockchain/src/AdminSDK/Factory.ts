export abstract class Factory {
    private static instance: Factory | null = null;

    static async init(apiUrl: string, privateKey: string) {
        Factory.instance = new AdminSDK(apiUrl, privateKey);
    }

    public static get singleton() {
        if (!Factory.instance) {
            throw new Error("Factory not initialized");
        }
        return Factory.instance;
    }

    readonly apiUrl: string | null = null;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    public abstract history<T>(token: string, tnx: string) : Promise<T>;
}

export class AdminSDK extends Factory {
    readonly privateKey: string | null = null;
    
    constructor(apiUrl: string, privateKey: string) {
        super(apiUrl);
        this.privateKey = privateKey;
    }

    public async history<T>(token: string, tnx: string) : Promise<T> {
        try {
            const headers = {} as any;
            headers['Content-Type'] = 'application/json';
            headers['Auth-Type'] = 'private';
            headers['Private-Api-Key'] = this.privateKey;

            const response = await fetch(`${this.apiUrl}/history`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    token: token,
                    tnx: tnx,
                }),
            });

            if (response.status === 401) {
                throw new Error('Unauthorized');
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