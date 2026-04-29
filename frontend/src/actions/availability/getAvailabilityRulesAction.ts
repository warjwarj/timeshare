import type { AvailabilityRuleDTO } from "../../types/AvailabilityRuleDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export default function getAvailabilityRulesAction(signal: AbortSignal): Promise<FetchWrapperResponse<AvailabilityRuleDTO[]>> {
  return fetchWrapper("/availability", undefined, { method: "GET", signal: signal })
}
