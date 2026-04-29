import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export default function deleteAvailabilityRuleAction(uuid: string, signal: AbortSignal): Promise<FetchWrapperResponse> {
  return fetchWrapper(`/availability/${uuid}`, undefined, { method: "DELETE", signal: signal })
}
