import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from './svgs/Chevrons';
import { Calendar } from './svgs/Calendar';

import { MonthEnum, type Month, WeekDayEnum, type WeekDay} from '../types/dateTypes'


type DateSelectorProps = {
  startDate: Date;
  onlyMonthSelector: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ startDate, onlyMonthSelector }) => {

  const [selectedDate, setSelectedDate] = useState<Date | null>(startDate);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const monthNames = Object.values(MonthEnum) as readonly Month[];
  const dayNames = Object.values(WeekDayEnum) as readonly WeekDay[];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select a date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const selectPreset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setSelectedDate(date);
    setCurrentMonth(date);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <>
      <div className="w-full h-auto">

        {/* calendar icon selected date */}
        <div className="h-full flex items-center justify-end gap-5 p-2">

          {/* selected date */}
          <div className="rounded-lg">
            <p className="text-sm font-medium">Selected Date:</p>
            <p className="text-lg font-semibold">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Show/hide drop down */}
          <div className="flex justify-center">
            <button
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
        {isOpen && (
          <div className="justify-between border-light-border dark:border-dark-border pr-2 pl-2 bg-light-background dark:bg-dark-background">

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
              >
                <ChevronLeft classes={"w-5 h-5 text-light-primary-text dark:text-dark-primary-text"} />
              </button>
              <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-v-light-accent dark:hover:bg-dark-accent rounded-full"
              >
                <ChevronRight classes={"w-5 h-5 text-light-primary-text dark:text-dark-primary-text"} />
              </button>
            </div>

            { !onlyMonthSelector && (
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
                        setSelectedDate(day);
                      }
                    }}
                    disabled={!day}
                    className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                        ${!day ? 'invisible' : ''}                                          
                        ${isSameDay(day, selectedDate) ? 'bg-light-accent dark:bg-dark-accent text-light-background dark:text-dark-background font-bold font-bold text-xl font-bold text-xl' : ''}
                        ${day && isToday(day) && !isSameDay(day, selectedDate) ? 'font-bold text-xl' : ''}
                        ${day && !isSameDay(day, selectedDate) && !isToday(day) ? 'hover:bg-v-light-accent hover:dark:v-dark-accent text-light-primary-text dark:text-dark-primary-text' : ''}
                      `}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export { DateSelector }