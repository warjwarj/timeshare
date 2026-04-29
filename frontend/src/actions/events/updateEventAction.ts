import type { EventDTO } from "../../types/EventDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type UpdateEventRequest = EventDTO;

export default function updateEventAction(req: UpdateEventRequest, signal: AbortSignal): Promise<FetchWrapperResponse<EventDTO>> {
  return fetchWrapper(`/events/${req.uuid}`, req, { method: "PUT", signal: signal })
}
