// basic dto with primative types
export type AvailabilityRuleDTO = {
  uuid: string;
  name: string;
  iana_timezone: string;
  prevents_booking?: boolean;
  weekdays?: number[];
  start_datetime?: string;
  end_datetime?: string;
  start_time?: string;
  end_time?: string;
};

// dto with string dates processed into Date objects
export type ProcessedAvailabilityRuleDTO = Omit<AvailabilityRuleDTO, 'start_datetime' | 'end_datetime'> & {
  start_datetime?: Date;
  end_datetime?: Date;
};
