export abstract class Factory {
    private static instance: Factory | null = null;

    static async init(apiUrl: string, publicKey: string, fetchJwt: () => Promise<any>) {
        Factory.instance = new ClientSDK(apiUrl, publicKey, await fetchJwt(), fetchJwt);
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
}

export class ClientSDK extends Factory {
    readonly publicKey: string | null = null;
    public jwt: string | null = null;
    readonly fetchJwt: () => Promise<string>;
    
    constructor(apiUrl: string, publicKey: string, jwt: string, fetchJwt: () => Promise<string>) {
        super(apiUrl);
        this.publicKey = publicKey;
        this.jwt = jwt;
        this.fetchJwt = fetchJwt;
    }

    public async reloadJwt() {
        try {
            this.jwt = await this.fetchJwt();
        } catch (error) {
            throw new Error('Failed to fetch JWT');
        }
    }
}
