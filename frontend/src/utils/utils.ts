// fake enum
import { TimeSpanEnum, type TimeSpan } from "../types/dateTypes";
import axios from 'axios'

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Generic utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

// to make sure the error is of type string
function getStrErrorMessage(error: unknown): string {
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

function isNullOrWhitespace(input: string) {
  return !input || !input.trim();
}


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Date utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

function isValidDate(d: Date) {
  return (Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime()));
}

function getCalendarDaysInMonth(year: number, month: number) {
  const monthIndex = month - 1; // 0..11 instead of 1..12
  const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const date = new Date(year, monthIndex, 1);
  const result = [];
  while (date.getMonth() == monthIndex) {
    result.push(date.getDate() + '-' + names[date.getDay()]);
    date.setDate(date.getDate() + 1);
  }
  return result;
}

// get date from cell index. Date will always be rounded down to the nearest timeSpan.
function getDateFromCellIndex(cellStep: TimeSpan, gridStart: Date, cellIndex: number): Date {
  const ret = new Date(gridStart)
  switch (cellStep) {
    case TimeSpanEnum.Day:
      ret.setDate(gridStart.getDate() + cellIndex - 1)
      return ret
  }
  return gridStart;
}

function formatDate(date: Date | null) {
  if (!date) return 'Select a date';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

function isSameDay(date1: Date | null, date2: Date | null) {
  if (!date1 || !date2) return false;
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

function isToday(date: Date) {
  return isSameDay(date, new Date());
};

function getPreviousMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - diff);
  return result;
}

export {
  getStrErrorMessage,
  getCalendarDaysInMonth,
  getDateFromCellIndex,
  isValidDate,
  isNullOrWhitespace,
  formatDate,
  isToday,
  isSameDay,
  getPreviousMonday
}