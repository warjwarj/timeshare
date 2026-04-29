// fake enum
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { useOutletContext } from "react-router-dom";
import type { MainLayoutContext } from "../MainLayout";
import { TimeSpanEnum, type TimeSpan } from "../types/dateTypes";

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Generic utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/


export function useLayoutContext() {
  return useOutletContext<MainLayoutContext>();
}

export function isNullOrWhitespace(input: string) {
  return !input || !input.trim();
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Date utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/


/**
 * Get minuites since midnight given a time label like 11:43am, or 23:43
 * 
 * @param time time label
 * @returns minuites since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (!match) return -1;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3]?.toLowerCase();

  if (period === "am" && hours === 12) hours = 0;
  if (period === "pm" && hours !== 12) hours += 12;
  // no period → treat as 24h, hours stays as-is

  return hours * 60 + minutes;
}

/**
 * Get a number like 20240303 to match dates.
 * 
 */
export function toDateNum(d: TZDate): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * This is designed to take a naive (definitely already UTC) iso string like the ones we store in the database, and convert it into a TZDate.
 * 
 * @param naive naive iso string like '2026-04-09T14:26:35'
 * @param tz like 'Europe/London'
 * @returns a TZDate in the specified timezone
 */
export function definitelyUtcButNaiveIsoStrToTzDate(naive: string, tz: string): TZDate {
  // the "Z" is important - causes the TZDate constructor to recognise the date as UTC and apply the timezone offset.
  // without it I think it would just add the timezone info, assuming that the datetime is already localised.
  return new TZDate(naive + "Z", tz)
}

/**
 * This is designed to take a naive, already wall clock iso string, and convert it into a TZDate.
 * 
 * @param naive naive iso string like '2026-04-09T14:26:35'
 * @param tz like 'Europe/London'
 * @returns a TZDate in the specified timezone
 */
export function naiveIsoStrToTzDate(naive: string, tz: string): TZDate {
  // Get the UTC offset for this timezone at the given date by creating a
  // reference point and formatting its offset. We use a Date with "Z" (UTC) so
  // the reference is unambiguous, then extract the offset string (e.g. "+01:00", "-10:00").

  // 1. new Date(naive + "Z") — creates a plain Date at that UTC instant (the Z just gives it an unambiguous reference point)                                                                                               
  // 2. format(..., "xxx", { timeZone: tz }) — asks date-fns-tz: "what is the UTC offset in timezone tz at this moment in time?" 
  // The "xxx" format token outputs the offset as +HH:mm or -HH:mm (e.g. "-10:00" for Tahiti, "+01:00" for BST)
  const offset = format(new Date(naive + "Z"), "xxx", { timeZone: tz })
  // Append the offset so the parser treats the naive string as wall-clock
  // time in the target timezone, not the browser's local timezone.
  return new TZDate(naive + offset, tz)
}

/**
 * Get a naive iso string representing the wall clock time in the dates timezone.
 * 
 * @param tzdt timezone aware date.
 * @returns an ISO string like 2026-04-09T14:26:35 in the TZDates timezone
 */
export function tzdateToWallClockInDatesTimezone(tzdt: TZDate): string {
  return format(tzdt, "yyyy-MM-dd'T'HH:mm", { timeZone: tzdt.timeZone })
}

/**
 * Get a naive iso string representing the utc time of this date, accounting for utc offset.
 * 
 * @param tzdt timezone aware date.
 * @returns an ISO string like 2026-04-09T14:26:35 in the TZDates timezone
 */
export function tzdateToWallClockTimeInAnotherTimezone(tzdt: TZDate, iana_timezone: string): string {
  const inTargetTz = new TZDate(tzdt.getTime(), iana_timezone);
  return format(inTargetTz, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Get an iso string representing the utc tiem of the utc date, accounting for the dates utc offset.
 * 
 * @param tzdt timezone aware date.
 * @returns an ISO string like 2026-04-09T14:26:35 in the TZDates timezone
 */
export function tzdateToUtcString(tzdt: TZDate): string {
  return new Date(tzdt.getTime()).toISOString()
}

/**
 * Convert a TZDate to a new TZDate representing the same instant in a different timezone.
 *
 * @param tzdt timezone aware date.
 * @param tz target IANA timezone like 'Pacific/Tahiti'
 * @returns a new TZDate in the target timezone representing the same instant
 */
export function tzdateToTzdate(tzdt: TZDate, tz: string): TZDate {
  return new TZDate(tzdt.getTime(), tz)
}

// Get TimeSpan duration in minutes
export function getTimeSpanInMinutes(timeSpan: TimeSpan): number {
  switch (timeSpan) {
    case TimeSpanEnum.Mins5: return 5;
    case TimeSpanEnum.Mins10: return 10;
    case TimeSpanEnum.Mins15: return 15;
    case TimeSpanEnum.Mins30: return 30;
    case TimeSpanEnum.Hour: return 60;
    case TimeSpanEnum.Day: return 1440;
    default: return 60;
  }
}

export function isValidDate(d: Date) {
  return (d instanceof Date) && !isNaN(d.getTime());
}

export function getCalendarDaysInMonth(year: number, month: number, timezone: string) {
  const tz = timezone;
  const monthIndex = month - 1; // 0..11 instead of 1..12
  const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let date = new TZDate(year, monthIndex, 1, tz);
  const result = [];
  while (date.getMonth() == monthIndex) {
    result.push(date.getDate() + '-' + names[date.getDay()]);
    date = new TZDate(date.getFullYear(), date.getMonth(), date.getDate() + 1, tz);
  }
  return result;
}

// get date from cell index. Date will always be rounded down to the nearest timeSpan.
export function getDateFromCellIndex(cellStep: TimeSpan, gridStart: TZDate, cellIndex: number): TZDate {
  const tz = gridStart.timeZone;
  switch (cellStep) {
    case TimeSpanEnum.Day:
      return new TZDate(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + cellIndex - 1,
        tz
      );
  }
  return gridStart;
}

export function formatDate(date: Date | null, timezone?: string) {
  if (!date) return;
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
}

export function isToday(date: TZDate): boolean {
  if (!date || !date.timeZone) { return false; }
  const tz = date.timeZone;
  return isSameDay(date, TZDate.tz(tz));
}

export function getPreviousMonday(date: TZDate): TZDate {
  const tz = date.timeZone;
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  return new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - diff,
    tz
  );
}

export function getLastDayOfMonth(d: TZDate): TZDate {
  const tz = d.timeZone;
  return new TZDate(
    d.getFullYear(),
    d.getMonth() + 1,
    0,
    tz
  );
}

export function getFirstDayOfMonth(d: TZDate): TZDate {
  const tz = d.timeZone;
  return new TZDate(
    d.getFullYear(),
    d.getMonth(),
    1,
    tz
  );
}