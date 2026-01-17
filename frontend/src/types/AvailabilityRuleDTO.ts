export type AvailabilityRuleDTO = {
  uuid?: string;
  name: string;
  prevents_booking: boolean;
  weekdays?: number[] | null;
  start_datetime?: string | null; // ISO 8601 format
  end_datetime?: string | null;
  start_time?: string | null; // ISO time format or HH:mm:ss
  end_time?: string | null;
}