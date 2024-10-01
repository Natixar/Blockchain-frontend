export class Factory {
    private static instance: Factory | null = null;

    static async init(apiUrl: string, fetchJwt: () => Promise<any>) {
        Factory.instance = new Factory(apiUrl, await fetchJwt(), fetchJwt);
    }

    public static get singleton() {
        if (!Factory.instance) {
            throw new Error("Factory not initialized");
        }
        return Factory.instance;
    }

    readonly apiUrl: string | null = null;
    public jwt: string | null = null;
    readonly fetchJwt: () => Promise<string>;
    
    private constructor(apiUrl: string, jwt: string, fetchJwt: () => Promise<string>) {
        this.apiUrl = apiUrl;
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