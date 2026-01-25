export type EventDTO = {
  uuid: string | null;
  name: string | null;
  start: string | Date | null
  end: string | Date | null;
  iana_timezone: string | null;
  colour: string | null;
};