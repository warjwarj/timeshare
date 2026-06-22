import type { TZDate } from "@date-fns/tz";

export type TimeRange = [string, string]

export type DayAvailabilityDTO = {
  brief: "Full Day" | "Part Day" | "None";
  iana_timezone: string;
  date: string;
  blocking: boolean;
  start_time: string;
  end_time: string;
  blocked_segments: TimeRange[];
}

export type ProcessedDayAvailabilityDTO = Omit<DayAvailabilityDTO, 'date'> & {
  date: TZDate;
}