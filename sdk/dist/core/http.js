export class HttpRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "HttpRequestError";
    }
}
export function resolveFetch(fetcher) {
    const resolvedFetcher = fetcher ?? globalThis.fetch;
    if (typeof resolvedFetcher !== "function") {
        throw new HttpRequestError("No fetch implementation available. Pass `fetch` in the SDK config.");
    }
    return resolvedFetcher;
}
export async function requestJson(apiBaseUrl, path, options = {}) {
    const { fetcher, headers, ...init } = options;
    const resolvedFetcher = resolveFetch(fetcher);
    const response = await resolvedFetcher(new URL(path, apiBaseUrl), {
        credentials: "include",
        ...init,
        headers: {
            "content-type": "application/json",
            ...headers,
        },
    });
    const data = (await response.json().catch(() => null));
    if (!response.ok) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : `Request failed with status ${response.status}.`;
        throw new HttpRequestError(message);
    }
    return data;
}
//# sourceMappingURL=http.js.map