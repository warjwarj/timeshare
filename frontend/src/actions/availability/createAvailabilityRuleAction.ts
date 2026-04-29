import type { AvailabilityRuleDTO } from "../../types/AvailabilityRuleDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type CreateAvailabilityRuleRequest = Omit<AvailabilityRuleDTO, "uuid">;

export default function createAvailabilityRuleAction(req: CreateAvailabilityRuleRequest, signal: AbortSignal): Promise<FetchWrapperResponse<AvailabilityRuleDTO>> {
  return fetchWrapper("/availability", req, { method: "POST", signal: signal })
}
