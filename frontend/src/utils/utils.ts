// fake enum
import { useOutletContext } from "react-router-dom";
import { TimeSpanEnum, type TimeSpan } from "../types/dateTypes";
import axios from 'axios'
import type { MainLayoutContext } from "../MainLayout";
import { TZDate } from "@date-fns/tz";

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Generic utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

export function useLayoutContext() {
  return useOutletContext<MainLayoutContext>();
}

// to make sure the error is of type string
export function getStrErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message
      || error.response?.data?.detail
      || error.message
      || 'Request failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function isNullOrWhitespace(input: string) {
  return !input || !input.trim();
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Date utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

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