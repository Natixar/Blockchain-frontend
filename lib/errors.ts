/*
 * Custom errors for network issues during fetch (e.g., TCP timeout).
 */
export class NetworkError extends Error {
  constructor(message: string, host: string) {
    super(message);
    this.name = 'ExplorerNetworkError';
    console.log(`Fetch from host ${host} failed with network error: ${message}`);
  }
}

/**
 * Custom error for HTTP errors from the explorer API, stores the code returned by the upstream server.
 */
export class HttpError extends Error {
    status: number;

    constructor(message: string, response: Response) {
        super(message);
        this.name = 'ExplorerHttpError';
        this.status = response.status;
        console.log(`Fetch from url ${response.url.toString()} failed with status HTTP ${response.status} ${response.statusText}: ${message}`);
    }
}