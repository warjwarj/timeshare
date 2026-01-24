export type AvailabilityRuleDTO = {
  uuid: string | null;
  name: string | null;
  prevents_booking: boolean | null
  weekdays: number[] | null;
  start_datetime: string | null;
  end_datetime: string | null;
  start_time: string | null;
  end_time: string | null;
  iana_timezone: string | null;
}