import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export default function deleteEventAction(uuid: string, signal: AbortSignal): Promise<FetchWrapperResponse> {
  return fetchWrapper(`/events/${uuid}`, undefined, { method: "DELETE", signal: signal })
}
