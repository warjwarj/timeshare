import type { TZDate } from "@date-fns/tz";

export type EventDTO = {
  key: string;
  uuid: string
  start: TZDate; // event start
  end: TZDate;   // inclusive
  name: string;
  colour: string;
};