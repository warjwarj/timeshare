import React, { useMemo } from "react";
import { MonthEnum } from "../../types/dateTypes";
import { isSameDay } from "../../utils/utils";
import { ourUseSelector } from '../../store/hooks';
import { makeEventSelectors } from '../../store/slices/eventsSlice';
import { TZDate } from "@date-fns/tz";

import '../../../index.css';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate } from "../../store/slices/appSlice";

type YearGridProps = {
  onMonthSelect: (month: number) => void;
};

const monthNames = Object.values(MonthEnum);
const weekDayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const getMonthDays = (year: number, month: number, tz: string): (number | null)[] => {
  const firstDay = new TZDate(year, month, 1, tz);
  const lastDay = new TZDate(year, month + 1, 0, tz);
  const daysInMonth = lastDay.getDate();

  // Adjust to Monday-based week (0 = Monday, 6 = Sunday)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

const MiniMonth: React.FC<{
  year: number;
  month: number;
  eventDates: Set<string>;
  onMonthSelect: (month: number) => void;
}> = ({ year, month, eventDates, onMonthSelect }) => {

  // memoised selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);
  const tz = selectedDate.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const days = getMonthDays(year, month, tz);
  const isSelectedMonth = selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

  const hasEvent = (day: number): boolean => {
    const dateKey = `${year}-${month}-${day}`;
    return eventDates.has(dateKey);
  };

  return (
    <div
      onClick={() => onMonthSelect(month)}
      className={`p-2 rounded-lg cursor-pointer transition-colors
        ${isSelectedMonth
          ? 'bg-light-accent dark:bg-dark-accent'
          : 'hover:bg-light-accent/50 dark:hover:bg-dark-accent/50'
        }`}
    >
      <h3 className="text-sm font-semibold mb-1 text-center text-light-primary-text dark:text-dark-primary-text">
        {monthNames[month].substring(0, 3)}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0">
        {weekDayHeaders.map((day, i) => (
          <div
            key={i}
            className="text-[10px] text-center text-light-secondary-text dark:text-dark-secondary-text"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className="text-[10px] p-0.5" />;
          }

          const cellDate = new TZDate(year, month, day, tz);
          const isToday = isSameDay(cellDate, currentDate);
          const isSelected = isSameDay(cellDate, selectedDate);
          const dayHasEvent = hasEvent(day);

          return (
            <div
              key={i}
              className={`text-[10px] text-center p-0.5 rounded-sm relative
                ${isToday
                  ? 'bg-blue-500 text-white font-bold'
                  : isSelected
                    ? 'bg-light-highlight dark:bg-dark-highlight font-semibold'
                    : 'text-light-primary-text dark:text-dark-primary-text'
                }`}
            >
              {day}
              {dayHasEvent && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const YearGrid: React.FC<YearGridProps> = ({ onMonthSelect }) => {

  // memoised selectors
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);

  const year = selectedDate.getFullYear();

  // Get events to show indicators
  const { selectProcessedEvents } = useMemo(
    () => makeEventSelectors(),
    []
  );
  const events = ourUseSelector(selectProcessedEvents);

  // Build a set of dates that have events for quick lookup
  const tz = selectedDate.timeZone;
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach(event => {
      // event.start and event.end are already TZDate
      let current = new TZDate(event.start.getFullYear(), event.start.getMonth(), event.start.getDate(), tz);
      const endDate = new TZDate(event.end.getFullYear(), event.end.getMonth(), event.end.getDate(), tz);

      // Add all dates the event spans
      while (current <= endDate) {
        if (current.getFullYear() === year) {
          dates.add(`${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`);
        }
        current = new TZDate(current.getFullYear(), current.getMonth(), current.getDate() + 1, tz);
      }
    });
    return dates;
  }, [events, year, tz]);

  return (
    <div id="year-grid-container" className="w-full h-full flex flex-col p-4 box-border">
      <h1 className="text-2xl font-bold mb-4 text-light-primary-text dark:text-dark-primary-text">
        {year}
      </h1>

      <div className="grid grid-cols-4 gap-4 flex-1">
        {Array.from({ length: 12 }).map((_, month) => (
          <MiniMonth
            key={month}
            year={year}
            month={month}
            eventDates={eventDates}
            onMonthSelect={onMonthSelect}
          />
        ))}
      </div>
    </div>
  );
};

export { YearGrid };
export type { YearGridProps };
