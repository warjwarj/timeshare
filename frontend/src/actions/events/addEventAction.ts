import type { EventDTO } from "../../types/EventDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type AddEventRequest = Omit<EventDTO, "uuid">;

export default function addEventAction(req: AddEventRequest, signal: AbortSignal): Promise<FetchWrapperResponse<EventDTO>> {
  return fetchWrapper("/events", req, { method: "POST", signal: signal })
}
