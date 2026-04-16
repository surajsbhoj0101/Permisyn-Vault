export interface JsonRequestOptions extends Omit<RequestInit, "headers"> {
    fetcher?: typeof fetch;
    headers?: HeadersInit;
}
export declare class HttpRequestError extends Error {
    constructor(message: string);
}
export declare function resolveFetch(fetcher?: typeof fetch): typeof fetch;
export declare function requestJson<T>(apiBaseUrl: string, path: string, options?: JsonRequestOptions): Promise<T>;
//# sourceMappingURL=http.d.ts.map