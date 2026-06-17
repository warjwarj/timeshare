import type { TZDate } from "@date-fns/tz";

// basic dto with primative types
export type EventDTO = {
  uuid: string;
  name: string;
  start: string;
  end: string;
  iana_timezone: string;
  colour: string;
  blocking: boolean;
};

// dto with string dates processed into Date objects
export type ProcessedEventDTO = Omit<EventDTO, 'start' | 'end'> & {
  start: TZDate;
  end: TZDate;
};
