import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from './svgs/Chevrons';
import { Calendar } from './svgs/Calendar';

import { MonthEnum, WeekDayEnum } from '../types/dateTypes'
import { formatDate, isSameDay, getUserTimezone } from '../utils/utils';
import { ourUseDispatch, ourUseSelector } from '../store/hooks';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate, setSelectedDate } from '../store/slices/appSlice';
import { TZDate } from '@date-fns/tz';


type DateSelectorProps = {
  startDate: TZDate;
  onlyMonthSelector: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onlyMonthSelector }) => {
  const dispatch = ourUseDispatch()

  const monthNames = Object.values(MonthEnum).map(m => m.substring(0, 3))
  const dayNames = Object.values(WeekDayEnum).map(m => m.substring(0, 3))

  // selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);

  // helper states and refs
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const tz = getUserTimezone();
  const [visibleMonth, setVisibleMonth] = useState(TZDate.tz(tz));
  const navigateMonth = (direction: number) => {
    const m = new TZDate(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1, tz);
    setVisibleMonth(m);
  };

  const selectPreset = (days: number) => {
    const now = TZDate.tz(tz);
    const date = new TZDate(now.getFullYear(), now.getMonth(), now.getDate() + days, tz);
    handleDateSelection(date);
    setVisibleMonth(date);
  };

  const days = getDaysInMonth(visibleMonth);

  return (
    <>
      <div className="w-full h-auto">

        {/* calendar icon selected date */}
        <div className="h-full flex items-center justify-end gap-5 p-2">

          {/* selected date */}
          <div className="rounded-lg hidden sm:block">
            <p className="text-sm font-medium">Selected Date:</p>
            <p className="text-lg font-semibold">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Show/hide drop down */}
          <div className="flex justify-center">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center"
            >
              <Calendar classes={`w-14 h-14
                rounded-lg
                flex justify-center font-bold
                bg-light-background
                dark:bg-dark-background
                text-light-primary-text
                dark:text-dark-primary-text
                hover:bg-v-light-accent
                hover:dark:bg-v-dark-accent`} />
            </button>
          </div>

        </div>

        {/*  dropdown calendar */}
        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-50 w-60 border rounded-lg px-2 bg-light-background dark:bg-dark-background shadow-lg"
            style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
          >

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
              >
                <ChevronLeft classes={"w-5 h-5 text-light-primary-text dark:text-dark-primary-text"} />
              </button>
              <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
              >
                <ChevronRight classes={"w-5 h-5 text-light-primary-text dark:text-dark-primary-text"} />
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
          </div>,
          document.body
        )}
      </div>
    </>
  );
}

export { DateSelector }