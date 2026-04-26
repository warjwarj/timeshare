import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type UpdateAccountRequest = {
  name?: string;
  email?: string;
  password?: string;
}

export type UpdateAccountResponse = {
  success: boolean;
  uuid: string;
  name: string;
  email: string;
  colour: string;
}

export default function updateAccountAction(req: UpdateAccountRequest, signal: AbortSignal): Promise<FetchWrapperResponse<UpdateAccountResponse>> {
  return fetchWrapper("/auth/account", req, { method: "PUT", signal: signal })
}