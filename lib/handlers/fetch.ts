import { ActionResponse } from "@/types/global";
import handleError from "./error";
import { RequestError } from "../http-errors";

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export default async function fetchData<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ActionResponse<T>> {
  const {
    timeout = 120000,
    headers: customHeaders = {},
    ...restOptions
  } = options;
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const headers = { ...customHeaders, ...defaultHeaders };
  const config = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };
  try {
    const response = await fetch(url, config);

    clearTimeout(timer);
    if (!response.ok)
      throw new RequestError(
        response.status,
        `Request failed with status ${response.status}`
      );

    return response.json();
  } catch (err) {
    const error = err instanceof Error ? err : new Error("An unknown error occurred");
    if(error.name === 'AbortError') 
        console.log("Request timed out");        
    else 
        console.log("Fetch error:", error.message);

    return handleError(error) as ActionResponse<T>;
  }
}
