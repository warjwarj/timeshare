import type { AvailabilityRuleDTO } from "../../types/AvailabilityRuleDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export default function getAvailabilityRuleAction(uuid: string, signal: AbortSignal): Promise<FetchWrapperResponse<AvailabilityRuleDTO>> {
  return fetchWrapper(`/availability/${uuid}`, undefined, { method: "GET", signal: signal })
}
