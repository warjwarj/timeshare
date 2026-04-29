import type { EventDTO } from "../../types/EventDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type GetEventsRequest = {
  start: string;
  end: string;
}

export default function getEventsAction(req: GetEventsRequest, signal: AbortSignal): Promise<FetchWrapperResponse<EventDTO[]>> {
  const params = new URLSearchParams({ start: req.start, end: req.end });
  return fetchWrapper(`/events/?${params.toString()}`, undefined, { method: "GET", signal: signal })
}
