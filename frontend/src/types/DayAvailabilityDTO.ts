export type DayAvailabilityDTO = {
  brief: "Full Day" | "Part Day" | "None";
  iana_timezone: string;
  date: string;
  blocking: boolean;
  start_time: string;
  end_time: string;
}

export type ProcessedDayAvailabilityDTO = Omit<DayAvailabilityDTO, 'date'> & {
  date: Date;
}