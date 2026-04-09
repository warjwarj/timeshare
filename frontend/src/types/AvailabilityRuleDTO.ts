import type { TZDate } from "@date-fns/tz";

// basic dto with primative types
export type AvailabilityRuleDTO = {
  uuid: string;
  name: string;
  iana_timezone: string;
  prevents_booking?: boolean;
  weekdays?: number[];
  start_datetime?: string;
  end_datetime?: string;
  start_time: string | null;
  end_time: string | null;
};

// dto with string dates processed into Date objects
export type ProcessedAvailabilityRuleDTO = Omit<AvailabilityRuleDTO, 'start_datetime' | 'end_datetime'> & {
  start_datetime?: TZDate;
  end_datetime?: TZDate;
};
