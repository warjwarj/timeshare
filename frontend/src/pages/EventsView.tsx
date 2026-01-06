import { useState, useCallback, useMemo, type ReactNode } from 'react';

import { MonthGrid } from '../components/calendar/MonthGrid.tsx';
import type { GridStyle } from '../components/calendar/MonthGrid.tsx';
import { TimeSpanEnum, WeekDayEnum } from "../types/dateTypes";
import { DayGrid } from '../components/calendar/DayGrid';
import { YearGrid } from '../components/calendar/YearGrid';
import type { EventStyle } from '../components/calendar/Event';
import { DateSelector } from "../components/DateSelector.tsx";
import { isValidDate } from '../utils/utils.ts';
import { getMonthGridConfig } from '../utils/monthGridUtils.ts';
import { ourUseDispatch } from '../store/hooks';
import { setSelectedDate } from '../store/slices/appSlice';

// event style for 
const monthGridEventStyle: EventStyle = {
  eventHeightStyle: "1.6em",
  defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm items-center justify-left text-nowrap",
  extraClasses: "",
  colour: "",
  lane: 0,
  left: 0,
  width: 0
};

// event style
const dayGridEventStyle: EventStyle = {
  eventHeightStyle: "",
  defaultEventStyle: "text-white text-center w-fit",
  extraClasses: "",
  colour: "",
  lane: 0,
  left: 0,
  width: 0
};

// grid style
const gridStyle: GridStyle = {
  eventStyle: monthGridEventStyle,
  cellStyle: {
    heightStyle: "150px",
  },
  colCount: 7
}

type EventsViewProps = {
  currentDate: Date;
  selectedDate: Date;
  children: ReactNode;
}

const EventsView: React.FC<EventsViewProps> = ({ currentDate, selectedDate, children }) => {
  const dispatch = ourUseDispatch();
  const weekdayNames = Object.values(WeekDayEnum)

  const [dayViewOn, setDayViewOn] = useState<boolean>(false);
  const [monthViewOn, setMonthViewOn] = useState<boolean>(true);
  const [yearViewOn, setYearViewOn] = useState<boolean>(false);


  // memoize grid config to prevent re-renders
  const dateForGrid = isValidDate(selectedDate) ? selectedDate : currentDate;
  const gridConfig = useMemo(
    () => isValidDate(dateForGrid) ? getMonthGridConfig(dateForGrid) : null,
    [dateForGrid]
  );

  // Handler for when a month is clicked in year view
  const handleMonthSelect = useCallback((month: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      month,
      1
    );
    dispatch(setSelectedDate({ dateISOStr: date.toISOString() }));
  }, [dispatch, currentDate]);

  return (
    <div id="EventsView" className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* View Mode Selector */}
      <div className="flex h-[5rem] gap-1 p-2 border-b border-light-border dark:border-dark-border">

        {/* children rendered on the left of the header area. */}
        <div className="flex justify-start border-light-border dark:border-dark-border">
          {children}
        </div>

        {/* events view controls. */}
        <div className="flex ml-auto border-light-border dark:border-dark-border">
          <button
            onClick={() => setYearViewOn(!yearViewOn)}
            className={`px-3 py-1 rounded text-sm transition-colors
            ${yearViewOn
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Year
          </button>
          <button
            onClick={() => setMonthViewOn(!monthViewOn)}
            className={`px-3 py-1 rounded text-sm transition-colors
            ${monthViewOn
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setDayViewOn(!dayViewOn)}
            className={`px-3 py-1 rounded text-sm transition-colors
              ${dayViewOn
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Day
          </button>
          {/* Date Selector */}
          <DateSelector onlyMonthSelector={false} startDate={new Date(2024, 11, 30)} />
        </div>
      </div>

      {/* Events views. */}
      <div className={`flex flex-1 overflow-hidden`}>
        {yearViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <YearGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onMonthSelect={handleMonthSelect}
            />
          </div>
        )}
        {monthViewOn && gridConfig && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <MonthGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              gridStyle={gridStyle}
              gridConfig={gridConfig}
              colHeaders={weekdayNames.map(x => x.substring(0, 3))}
            />
          </div>
        )}
        {dayViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-hidden">
            <DayGrid
              date={selectedDate}
              timeStart={0}
              timeEnd={24}
              timeStep={TimeSpanEnum.Mins30}
              snapToStep={true}
              style={{
                eventStyle: dayGridEventStyle,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { EventsView }