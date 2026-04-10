import React, { useEffect, useMemo, useRef, useState } from "react";
import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { selectCurrentDatetimeAsTzDate, selectSelectedDateAsTzDate, selectSelectedIanaTimezone, selectSelectedMonthAsTzDate, setSelectedMonth } from '../../store/slices/appSlice';
import { addEvent, deleteEvent, getEvents, makeEventSelectors, updateEvent } from '../../store/slices/eventsSlice';
import type { MonthGridConfig } from "../../utils/monthGridUtils";
import { setEventPositions } from "../../utils/monthGridUtils";
import { getDateFromCellIndex, isSameDay, isValidDate, toDateNum } from "../../utils/utils";
import { ChevronLeft, ChevronRight } from '../svgs/Chevrons';
import type { CellStyle } from "./Cell";
import { Cell } from "./Cell";
import type { EventBarProps, EventBarStyle } from "./EventBar";
import { EventBar } from './EventBar';

import { TZDate } from "@date-fns/tz";
import '../../../index.css';
import { getDayAvailabilitys, makeDayAvailabilitySelectors } from "../../store/slices/availabilitySlice";
import { TimeSpanEnum } from "../../types/dateTypes";

type MonthGridStyle = {
  eventStyle: EventBarStyle;
  cellStyle: CellStyle;
  colCount: number;
}

type MonthGridProps = {
  gridStyle: MonthGridStyle;
  gridConfig: MonthGridConfig;
  colHeaders: string[];
};

const MonthGrid: React.FC<MonthGridProps> = ({ gridStyle, gridConfig, colHeaders }) => {
  const { startDate, endDate, cellCount, gridLabel } = gridConfig;
  const { colCount, eventStyle, cellStyle } = gridStyle;
  const dispatch = ourUseDispatch();

  // common selectors
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsTzDate);
  const selectedMonth = ourUseSelector(selectSelectedMonthAsTzDate);
  const selectedTz = ourUseSelector(selectSelectedIanaTimezone);

  // event selectors
  const { selectEventsBetweenDates } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(state => selectEventsBetweenDates(state, startDate, endDate));

  // availability selectors
  const { selectProcessedDayAvailabilitysBetweenDates } = useMemo(() => makeDayAvailabilitySelectors(), []);
  const dayAvailabilitites = ourUseSelector(state => selectProcessedDayAvailabilitysBetweenDates(state, startDate, endDate));

  // event bar props state
  const [eventProps, setEventProps] = useState<EventBarProps[][]>();

  // fetch events and availability when date range changes
  useEffect(() => {
    const tz = startDate.timeZone;
    const startDateISO = new TZDate(startDate.getFullYear(), startDate.getMonth() - 1, startDate.getDate(), tz).toISOString();
    const endDateISO = new TZDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), tz).toISOString();
    const timeoutId1 = setTimeout(() => {
      dispatch(getEvents({ start: startDateISO, end: endDateISO }));
    }, 300);
    const timeoutId2 = setTimeout(() => {
      dispatch(getDayAvailabilitys({ iana_timezone: selectedTz, start_datetime: startDateISO, end_datetime: endDateISO }));
    }, 300);
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    }
  }, [dispatch, startDate, endDate, selectedTz]);

  // refs and state for grid measurement
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>());
  const gridRowWidthRef = useRef<HTMLDivElement>(null);
  const [gridRowWidth, setGridRowWidth] = useState(0);

  // measure container width on mount and resize
  useEffect(() => {
    const container = gridRowWidthRef.current;
    if (!container) return;
    const updateWidth = () => setGridRowWidth(container.getBoundingClientRect().width);
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // calculate event positions when events or grid dimensions change
  useEffect(() => {
    if (!isValidDate(startDate) || events.length === 0 || gridRowWidth === 0) {
      setEventProps([]);
      return;
    }
    setEventProps(setEventPositions(
      events, cellLaneEvents.current, gridRowWidth, startDate,
      cellCount, colCount, eventStyle
    ));
  }, [events, selectedTz, startDate, endDate, gridRowWidth, cellCount, colCount, eventStyle]);

  // month navigation handler
  const navigateMonth = (delta: number) => {
    if (!isValidDate(selectedMonth)) {
      return;
    }
    const tz = selectedMonth.timeZone;
    const date = new TZDate(selectedMonth.getFullYear(), selectedMonth.getMonth() + delta, 1, tz);
    dispatch(setSelectedMonth({ monthIsoStr: date.toISOString() }));
  };

  // Get events for a specific cell
  const getEventsInCell = (cellIndex: number): EventBarProps[] => {
    const laneMap = cellLaneEvents.current.get(cellIndex);
    if (!laneMap) return [];
    const allEvents = eventProps?.flat() ?? [];
    const result: EventBarProps[] = [];
    laneMap.forEach((id, lane) => {
      const evObj = allEvents.find(ev => ev?.eventDTO.uuid === id);
      if (evObj) {
        evObj.evStyle.lane = lane;
        result.push(evObj);
      }
    });
    return result;
  };

  const numRows = Math.ceil(cellCount / colCount);

  return (
    <div id="calendar-grid-container" className="w-full h-full flex flex-col gap-4 p-4 box-border">
      {/* Month navigation */}
      <div className="flex items-center justify-center w-full h-10 mt-3">
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft classes="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
          </button>
        </div>
        <div className="px-4 py-1 text-center text-2xl font-bold text-light-primary-text dark:text-dark-primary-text rounded transition-colors">
          {gridLabel}
        </div>
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Next day"
          >
            <ChevronRight classes="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div ref={gridRowWidthRef} className="grid gap-0" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
        {colHeaders.map((header, i) => (
          <div
            key={i}
            className="text-center text-xl py-2 border border-light-border dark:border-less-dark-border text-light-primary-text dark:text-dark-primary-text"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {Array.from({ length: numRows }, (_, rowIndex) => {
        const rowStart = rowIndex * colCount + 1;
        const rowEnd = Math.min(rowStart + colCount - 1, cellCount);
        const cellsInRow = rowEnd - rowStart + 1;

        return (
          <div key={rowIndex} className="relative">
            <div
              className="grid gap-0"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cellsInRow }, (_, i) => {
                const cellIndex = rowStart + i;
                const cellDate = getDateFromCellIndex(TimeSpanEnum.Day, startDate, cellIndex) ?? new Date();
                const availabilityForDate = dayAvailabilitites.find(dav => toDateNum(dav.date) == toDateNum(cellDate))
                return (
                  <Cell
                    key={cellIndex}
                    label={cellDate.getDate().toString()}
                    rowStartIndex={rowStart}
                    rowEndIndex={rowEnd}
                    cellIndex={cellIndex}
                    egcStyle={{ heightStyle: cellStyle.heightStyle }}
                    cellDate={cellDate}
                    getEvents={getEventsInCell}
                    onAddEvent={(ev) => dispatch(addEvent(ev))}
                    isOutsideMonth={cellDate.getMonth() !== selectedMonth.getMonth()}
                    isSelected={isSameDay(cellDate, selectedDate)}
                    isHighlighted={isSameDay(cellDate, currentDate)}
                    availability={availabilityForDate}
                  />
                );
              })}
            </div>

            {/* Events overlay */}
            {eventProps && gridRowWidth > 0 && (
              <div className="absolute top-8 left-0 w-full">
                {eventProps[rowIndex]?.map((evp) => evp && (
                  <EventBar
                    key={evp.key}
                    eventProps={evp}
                    updateEvent={(ev) => dispatch(updateEvent(ev))}
                    deleteEvent={(uuid) => dispatch(deleteEvent(uuid))}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { MonthGrid };
export type { MonthGridProps as GridProps, MonthGridStyle as GridStyle };

