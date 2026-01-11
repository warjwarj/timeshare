import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import { MonthGrid } from '../components/calendar/MonthGrid.tsx';
import type { GridStyle } from '../components/calendar/MonthGrid.tsx';
import { TimeSpanEnum, WeekDayEnum } from "../types/dateTypes";
import { DayGrid } from '../components/calendar/DayGrid';
import { YearGrid } from '../components/calendar/YearGrid';
import type { EventStyle } from '../components/calendar/Event';
import { DateSelector } from "../components/DateSelector.tsx";
import { CollapseButton } from "../components/CollapseButton.tsx";
import { isValidDate } from '../utils/utils.ts';
import { getMonthGridConfig, type MonthGridConfig } from '../utils/monthGridUtils.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks';
import { selectCurrentDatetimeAsDate, selectSelectedMonthAsDate, setSelectedMonth } from '../store/slices/appSlice';
import { useLayoutContext } from '../utils/utils.ts';

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

const EventsView: React.FC = () => {
  const dispatch = ourUseDispatch();
  const { isCollapsed, setIsCollapsed } = useLayoutContext();
  const weekdayNames = Object.values(WeekDayEnum)

  // memoised selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsDate);
  const selectedMonth = ourUseSelector(selectSelectedMonthAsDate);

  useEffect(() => {
    if (!isValidDate(currentDate)) {
      return;
    }
    dispatch(setSelectedMonth({ monthIsoStr: currentDate.toISOString() }))
  }, [currentDate])

  const [dayViewOn, setDayViewOn] = useState<boolean>(false);
  const [monthViewOn, setMonthViewOn] = useState<boolean>(true);
  const [yearViewOn, setYearViewOn] = useState<boolean>(false);

  // grid config - ref for prev val so can skip recalc if viable
  const dateForGrid = isValidDate(selectedMonth) ? selectedMonth : currentDate;
  const gridConfigRef = useRef<MonthGridConfig | null>(null)
  const gridConfig = useMemo<MonthGridConfig | null>(
    () => isValidDate(dateForGrid) ? getMonthGridConfig(dateForGrid, gridConfigRef.current) : null,
    [dateForGrid]
  );
  gridConfigRef.current = gridConfig;
  
  // Handler for when a month is clicked in year view
  const handleMonthSelect = useCallback((month: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      month,
      1
    );
    dispatch(setSelectedMonth({ monthIsoStr: date.toISOString() }));
  }, [dispatch, currentDate]);

  return (
    <div id="EventsView" className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* View Mode Selector */}
      <div className="flex h-[5rem] gap-1 p-2 border-b border-light-border dark:border-dark-border">

        {/* Collapse button on the left of the header area. */}
        <div className="flex justify-start border-light-border dark:border-dark-border">
          <div className="h-16 w-16">
            <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
          </div>
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
          <DateSelector onlyMonthSelector={false} startDate={currentDate} />
        </div>
      </div>

      {/* Events views. */}
      {currentDate && <div className={`flex flex-1 overflow-hidden`}>
        {yearViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <YearGrid
              onMonthSelect={handleMonthSelect}
            />
          </div>
        )}
        {monthViewOn && gridConfig && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <MonthGrid
              gridStyle={gridStyle}
              gridConfig={gridConfig}
              colHeaders={weekdayNames.map(x => x.substring(0, 3))}
            />
          </div>
        )}
        {dayViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-hidden">
            <DayGrid
              timeStart={0}
              timeEnd={24}
              timeStep={TimeSpanEnum.Mins30}
              snapToStep={false}
              style={{
                eventStyle: dayGridEventStyle,
              }}
            />
          </div>
        )}
      </div>}
    </div>
  );
}

export { EventsView }