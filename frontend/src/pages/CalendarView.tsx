import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import { MonthGrid } from '../components/calendar/MonthGrid.tsx';
import type { GridStyle } from '../components/calendar/MonthGrid.tsx';
import { DayGrid } from '../components/calendar/DayGrid.tsx';
import type { DayGridStyle } from '../components/calendar/DayGrid.tsx';
import { YearGrid } from '../components/calendar/YearGrid.tsx';
import type { EventBarStyle } from '../components/calendar/EventBar.tsx';
import { DateSelector } from "../components/DateSelector.tsx";
import { TimeSpanEnum, WeekDayEnum } from "../types/dateTypes.ts";
import { isValidDate } from '../utils/utils.ts';
import { getMonthGridConfig, type MonthGridConfig } from '../utils/monthGridUtils.ts';
import { getDayGridConfig, type DayGridConfig } from '../utils/dayGridUtils.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate, selectSelectedMonthAsTzDate, setSelectedMonth } from '../store/slices/appSlice.ts';
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { TZDate } from "@date-fns/tz";

const weekdayNames = Object.values(WeekDayEnum)

// event style for 
const monthGridEventStyle: EventBarStyle = {
  eventHeightStyle: "1.6em",
  defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm items-center justify-left text-nowrap",
  extraClasses: "",
  colour: "",
  lane: 0,
  left: 0,
  width: 0
};

// event style
const dayGridEventStyle: EventBarStyle = {
  eventHeightStyle: "",
  defaultEventStyle: "text-white text-center w-fit",
  extraClasses: "",
  colour: "",
  lane: 0,
  left: 0,
  width: 0
};

// month grid style
const monthGridStyle: GridStyle = {
  eventStyle: monthGridEventStyle,
  cellStyle: {
    heightStyle: "150px",
  },
  colCount: 7
}

// day grid style
const dayGridStyle: DayGridStyle = {
  eventStyle: dayGridEventStyle,
}

const CalendarView: React.FC = () => {
  const dispatch = ourUseDispatch();

  // selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);
  const selectedMonth = ourUseSelector(selectSelectedMonthAsTzDate);

  // state
  const [dayViewOn, setDayViewOn] = useState<boolean>(false);
  const [monthViewOn, setMonthViewOn] = useState<boolean>(true);
  const [yearViewOn, setYearViewOn] = useState<boolean>(false);

  // set default selected month
  useEffect(() => {
    if (!isValidDate(currentDate)) {
      return;
    }
    dispatch(setSelectedMonth({ monthIsoStr: currentDate.toISOString() }))
  }, [dispatch, currentDate])

  // month grid config
  const dateForMonthGrid = isValidDate(selectedMonth) ? selectedMonth : currentDate;
  const monthGridConfigRef = useRef<MonthGridConfig | null>(null)
  const monthGridConfig = useMemo<MonthGridConfig | null>(
    () => isValidDate(dateForMonthGrid) ? getMonthGridConfig(dateForMonthGrid, monthGridConfigRef.current) : null,
    [dateForMonthGrid]
  );
  monthGridConfigRef.current = monthGridConfig;

  // day grid config
  const dateForDayGrid = isValidDate(selectedDate) ? selectedDate : currentDate;
  const dayGridConfigRef = useRef<DayGridConfig | null>(null)
  const dayGridConfig = useMemo<DayGridConfig | null>(
    () => isValidDate(dateForDayGrid) ? getDayGridConfig(dateForDayGrid, 0, 23, TimeSpanEnum.Hour, dayGridConfigRef.current) : null,
    [dateForDayGrid]
  );
  dayGridConfigRef.current = dayGridConfig;

  // handler for when a month is clicked in year view
  const handleMonthSelect = useCallback((month: number) => {
    const tz = currentDate.timeZone;
    const date = new TZDate(
      currentDate.getFullYear(),
      month,
      1,
      tz
    );
    dispatch(setSelectedMonth({ monthIsoStr: date.toISOString() }));
  }, [dispatch, currentDate]);

  return (
    <ViewBody id={"CalendarView"}>
      <ViewHeader>
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
          <DateSelector onlyMonthSelector={false} startDate={currentDate} />
        </div>
      </ViewHeader>

      {/* Events views. */}
      {currentDate && <div className={`flex flex-1 overflow-hidden`}>
        {yearViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <YearGrid
              onMonthSelect={handleMonthSelect}
            />
          </div>
        )}
        {monthViewOn && monthGridConfig && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <MonthGrid
              gridStyle={monthGridStyle}
              gridConfig={monthGridConfig}
              colHeaders={weekdayNames.map(x => x.substring(0, 3))}
            />
          </div>
        )}
        {dayViewOn && dayGridConfig && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <DayGrid
              gridStyle={dayGridStyle}
              gridConfig={dayGridConfig}
            />
          </div>
        )}
      </div>}
    </ViewBody>
  );
}

export { CalendarView }