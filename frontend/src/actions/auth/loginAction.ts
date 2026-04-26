import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type LoginRequest = {
  name?: string;
  email: string;
  password: string;
}

export type LoginResponse = {
  success: boolean;
  access_token: string;
  token_type: string;
  uuid: string;
  name: string;
  email: string;
  colour: string;
}

export default function loginAction(req: LoginRequest, signal: AbortSignal): Promise<FetchWrapperResponse<LoginResponse>> {
  return fetchWrapper("/auth/login", req, { method: "POST", signal: signal }, false)
}