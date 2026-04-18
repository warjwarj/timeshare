import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TZDate } from "@date-fns/tz";
import type { DayGridStyle } from '../components/calendar/DayGrid.tsx';
import { DayGrid } from '../components/calendar/DayGrid.tsx';
import type { EventBarStyle } from '../components/calendar/EventBar.tsx';
import type { GridStyle } from '../components/calendar/MonthGrid.tsx';
import { MonthGrid } from '../components/calendar/MonthGrid.tsx';
import { YearGrid } from '../components/calendar/YearGrid.tsx';
import GenericDropdown from '../components/utils/GenericDropdown.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate, selectSelectedIsPhone, selectSelectedMonthAsTzDate, setSelectedMonth } from '../store/slices/appSlice.ts';
import { TimeSpanEnum, WeekDayEnum } from "../types/dateTypes.ts";
import { getDayGridConfig, type DayGridConfig } from '../utils/dayGridUtils.ts';
import { getMonthGridConfig, type MonthGridConfig } from '../utils/monthGridUtils.ts';
import { isValidDate } from '../utils/utils.ts';
import { Calendar, Settings } from 'lucide-react';
import { DateSelector } from '../components/utils/DateSelector.tsx';

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
  const isPhone = ourUseSelector(selectSelectedIsPhone);

  // state
  const [calendarViewState, setCalendarViewState] = useState({
    dayViewOn: false,
    monthViewOn: true,
    yearViewOn: false
  })
  const [viewPickerOpen, setViewPickerOpen] = useState(false)

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
    () => isValidDate(dateForDayGrid) ? getDayGridConfig(dateForDayGrid, 0, 24, TimeSpanEnum.Hour, dayGridConfigRef.current) : null,
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

  const getCalendarViewOptions = () => {
    const buttonClass = "px-3 py-1 rounded text-sm transition-colors w-5 h-5 border border-light-border dark:border-dark-border mr-2"
    const buttonClassTicked = "bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text"
    const buttonClassNotTicked = "bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent"

    const onYearClick = () => {
      if (isPhone) {
        setCalendarViewState({ yearViewOn: true, monthViewOn: false, dayViewOn: false, })
        setViewPickerOpen(false)
      } else {
        setCalendarViewState({ ...calendarViewState, yearViewOn: !calendarViewState.yearViewOn })
      }
    }
    const onMonthClick = () => {
      if (isPhone) {
        setCalendarViewState({ yearViewOn: false, monthViewOn: true, dayViewOn: false, })
        setViewPickerOpen(false)
      } else {
        setCalendarViewState({ ...calendarViewState, monthViewOn: !calendarViewState.monthViewOn })
      }
    }
    const onDayClick = () => {
      if (isPhone) {
        setCalendarViewState({ yearViewOn: false, monthViewOn: false, dayViewOn: true })
        setViewPickerOpen(false)
      } else {
        setCalendarViewState({ ...calendarViewState, dayViewOn: !calendarViewState.dayViewOn })
      }
    }

    return (
      <div className="flex flex-col ml-auto p-2 border-light-border dark:border-dark-border">
        <div>
          <button
            onClick={() => onYearClick()}
            className={`${buttonClass}
            ${calendarViewState.yearViewOn
                ? buttonClassTicked
                : buttonClassNotTicked
              }`}
          />
          <span>Year</span>
        </div>
        <div>
          <button
            onClick={() => onMonthClick()}
            className={`${buttonClass}
            ${calendarViewState.monthViewOn
                ? buttonClassTicked
                : buttonClassNotTicked
              }`}
          />
          <span>Month</span>
        </div>
        <div>
          <button
            onClick={() => onDayClick()}
            className={`${buttonClass}
              ${calendarViewState.dayViewOn
                ? buttonClassTicked
                : buttonClassNotTicked
              }`}
          />
          <span>Day</span>
        </div>
      </div>
    )
  }

  return (
    <ViewBody id={"CalendarView"}>
      <ViewHeader>
        {/* events view controls. */}
        <div className="flex gap-3 items-center ml-auto mt-4 mb-4 border-light-border dark:border-dark-border">
          <DateSelector onlyMonthSelector={false} startDate={currentDate} />
          <GenericDropdown iconChildren={<><Calendar /><Settings /></>} bodyChildren={getCalendarViewOptions()} isOpen={viewPickerOpen} setIsOpen={setViewPickerOpen} />
        </div>
      </ViewHeader>

      {/* Events views. */}
      {currentDate && <div className={`flex flex-1 overflow-hidden`}>
        {calendarViewState.yearViewOn && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <YearGrid
              onMonthSelect={handleMonthSelect}
            />
          </div>
        )}
        {calendarViewState.monthViewOn && monthGridConfig && (
          <div className="w-full max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <MonthGrid
              gridStyle={monthGridStyle}
              gridConfig={monthGridConfig}
              colHeaders={weekdayNames.map(x => x.substring(0, 3))}
            />
          </div>
        )}
        {calendarViewState.dayViewOn && dayGridConfig && (
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

export { CalendarView };
