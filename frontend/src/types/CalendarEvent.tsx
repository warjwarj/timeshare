type CalendarEvent = {
  start: number; // 1-based day index
  end: number;   // inclusive
  title: string;
  extraClasses: string;
  left: number;
  width: number;
  top: number;
};

export type { CalendarEvent };