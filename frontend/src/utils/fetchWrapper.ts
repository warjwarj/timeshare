import { selectToken } from '../store/slices/authSlice';

const ENDPOINT = import.meta.env.VITE_API_URL as string

/**
 * fetch response, and the error within it if we've detected one.
 */
export type FetchWrapperResponse<T = void> = {
  ok: boolean;
  error: string;
  data: T;
}

export default async function fetchWrapper<T = void>(
  path: string,
  body?: unknown,
  options: RequestInit = {},
  redirectOn400: boolean = true
): Promise<FetchWrapperResponse<T>> {

  // lazy import becuase this loads before the reducer 
  const { store } = await import('../store/store');
  const state = store.getState();
  const token = selectToken(state);

  // call fetch
  const res = await fetch(`${ENDPOINT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...(body !== undefined && { "body": JSON.stringify(body) })
  });

  // redirect if we get a status 400 response
  if (redirectOn400 && res.status >= 400 && res.status < 500) {
    localStorage.removeItem("auth_state");
    window.location.href = '/login';
  }

  // parse as text first then json to avoid error on empty response body
  const text = await res.text();
  const data = text ? JSON.parse(text) : (undefined as T);

  // if !ok try parse error message.
  let error = "";
  if (!res.ok) {
    try {
      error = checkForErrorMessage(JSON.parse(text));
    } catch {
      error = text || res.statusText;
    }
  }

  // return the promise
  return { ok: res.ok, data, error }
};

/**
 * Try and parse the assumed error message from the raw response data
 * @param data The raw fetch response
 * @returns The error message embedded in the response
 */
function checkForErrorMessage(data: unknown): string {
  return String(data)
}