import React, { useState } from 'react';

import { TZDate } from '@date-fns/tz';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate, selectSelectedIanaTimezone, setSelectedDate } from '../../store/slices/appSlice';
import { MonthEnum, WeekDayEnum } from '../../types/dateTypes';
import { isSameDay } from '../../utils/utils';
import GenericDropdown from './GenericDropdown';


type DateSelectorProps = {
  startDate: Date;
  onlyMonthSelector: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onlyMonthSelector }) => {
  const dispatch = ourUseDispatch()

  const monthNames = Object.values(MonthEnum).map(m => m.substring(0, 3))
  const dayNames = Object.values(WeekDayEnum).map(m => m.substring(0, 3))

  // selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);
  const ianaTimezone = ourUseSelector(selectSelectedIanaTimezone);

  // helper states and refs
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelection = (d: TZDate) => {
    dispatch(setSelectedDate({ dateIsoStr: d.toISOString() }))
  }

  const getDaysInMonth = (date: TZDate) => {
    const tz = date.timeZone;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new TZDate(year, month, 1, tz);
    const lastDay = new TZDate(year, month + 1, 0, tz);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (TZDate | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new TZDate(year, month, i, tz));
    }
    return days;
  };

  const [visibleMonth, setVisibleMonth] = useState(TZDate.tz(ianaTimezone));
  const navigateMonth = (direction: number) => {
    const m = new TZDate(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1, ianaTimezone);
    setVisibleMonth(m);
  };

  const selectPreset = (days: number) => {
    const now = TZDate.tz(ianaTimezone);
    const date = new TZDate(now.getFullYear(), now.getMonth(), now.getDate() + days, ianaTimezone);
    handleDateSelection(date);
    setVisibleMonth(date);
  };

  const displayDate = () => {
    return selectedDate.toLocaleDateString() || currentDate.toDateString()
  }

  const days = getDaysInMonth(visibleMonth);

  const getIcon = () => {
    return (
      <span>
        {displayDate()}
      </span>
    )
  }

  const getBody = () => {
    return (
      <div className="w-full h-full p-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
          >
            <ChevronLeft />
          </button>
          <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
            {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
          >
            <ChevronRight />
          </button>
        </div>

        {!onlyMonthSelector && (
          <>
            {/* Quick Presets */}
            <div className="flex justify-evenly mb-4">
              <button
                onClick={() => selectPreset(0)}
                className="text-sm pt-1 pb-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >Today </button>
              <button
                onClick={() => selectPreset(1)}
                className="text-sm pt-1 pb-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >Tomorrow </button>
            </div>

            {/* Weekday names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold py-2 text-light-secondary-text dark:text-dark-secondary-text">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (day) {
                      handleDateSelection(day);
                    }
                  }}
                  disabled={!day}
                  className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                        ${!day ? 'invisible' : ''}                                          
                        ${isSameDay(day, selectedDate) ? 'bg-light-accent dark:bg-dark-accent text-light-background dark:text-dark-background font-bold font-bold font-bold text-l' : ''}
                        ${day && isSameDay(day, currentDate) && !isSameDay(day, selectedDate) ? 'font-bold text-l' : ''}
                        ${day && !isSameDay(day, selectedDate) && !isSameDay(day, currentDate) ? 'hover:bg-v-light-accent hover:dark:v-dark-accent text-light-primary-text dark:text-dark-primary-text' : ''}
                      `}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <GenericDropdown
      iconChildren={getIcon()}
      bodyChildren={getBody()}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialHeightPx={400}
      initialWidthPx={300}
    />
  );
}

export { DateSelector };

