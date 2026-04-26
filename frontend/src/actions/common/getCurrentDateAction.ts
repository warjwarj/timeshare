import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

type GetCurrentDateResponse = {
  datetime: string;
  timezone: string;
}

export default function getCurrentDateAction(signal: AbortSignal): Promise<FetchWrapperResponse<GetCurrentDateResponse>> {
  return fetchWrapper("/common/current-datetime", { method: "GET", signal: signal })
}