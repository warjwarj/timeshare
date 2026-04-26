import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type RegisterRequest = {
  org_name: string;
  name?: string;
  email: string;
  password: string;
}

export default function loginAction(req: RegisterRequest, signal: AbortSignal): Promise<FetchWrapperResponse> {
  return fetchWrapper("/auth/register", req, { method: "POST", signal: signal }, false)
}