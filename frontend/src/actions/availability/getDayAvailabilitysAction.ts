import type { DayAvailabilityDTO } from "../../types/DayAvailabilityDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export type GetDayAvailabilitysRequest = {
  iana_timezone: string;
  start_datetime: string;
  end_datetime: string;
}

export default function getDayAvailabilitysAction(req: GetDayAvailabilitysRequest, signal: AbortSignal): Promise<FetchWrapperResponse<DayAvailabilityDTO[]>> {
  return fetchWrapper("/availability/getAvailability", req, { method: "POST", signal: signal })
}
