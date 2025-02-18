import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || "/api/v1"; // Default to /api/v1 if not set

console.log("BACKEND_API_BASE_URL: ", BACKEND_API_BASE_URL);
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Generic API request function that automatically prepends the API base URL.
 * @param method HTTP method (GET, POST, etc.)
 * @param endpoint API endpoint (relative path, e.g., "/words")
 * @param data Optional request body for POST/PUT requests
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = `${BACKEND_API_BASE_URL}${endpoint}`; // Prepend base URL to the endpoint

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Generic query function for React Query that supports automatic API URL handling.
 * @param options Configuration for handling 401 unauthorized responses
 * @returns A QueryFunction that fetches data from the API
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey[0] as string; // Query key is the API endpoint
    const url = `${BACKEND_API_BASE_URL}${endpoint}`; // Prepend base API URL

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Use our fixed query function
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
