import type { AvailabilityRuleDTO } from "../../types/AvailabilityRuleDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type UpdateAvailabilityRuleRequest = AvailabilityRuleDTO;

export default function updateAvailabilityRuleAction(req: UpdateAvailabilityRuleRequest, signal: AbortSignal): Promise<FetchWrapperResponse<AvailabilityRuleDTO>> {
  return fetchWrapper(`/availability/${req.uuid}`, req, { method: "PUT", signal: signal })
}
