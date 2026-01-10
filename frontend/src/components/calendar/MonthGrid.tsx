import React, { useEffect, useMemo, useRef, useState } from "react";
import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { selectCurrentDatetimeAsDate, selectSelectedDateAsDate, selectSelectedMonthAsDate, setSelectedMonth } from '../../store/slices/appSlice';
import { addEvent, deleteEvent, getEvents, makeEventSelectors, updateEvent } from '../../store/slices/eventsSlice';
import type { MonthGridConfig } from "../../utils/monthGridUtils";
import { setEventPositions } from "../../utils/monthGridUtils";
import { getDateFromCellIndex, isSameDay, isValidDate } from "../../utils/utils";
import { ChevronLeft, ChevronRight } from '../svgs/Chevrons';
import type { CellStyle } from "./Cell";
import { Cell } from "./Cell";
import type { EventProps, EventStyle } from "./Event";
import { Event } from './Event';

import '../../../index.css';
import { TimeSpanEnum } from "../../types/dateTypes";

type GridStyle = {
  eventStyle: EventStyle;
  cellStyle: CellStyle;
  colCount: number;
}

type GridProps = {
  gridStyle: GridStyle;
  gridConfig: MonthGridConfig;
  colHeaders: string[];
};

const MonthGrid: React.FC<GridProps> = ({ gridStyle, gridConfig, colHeaders }) => {
  const { startDate, endDate, cellCount, gridLabel } = gridConfig;
  const { colCount, eventStyle, cellStyle } = gridStyle;
  const dispatch = ourUseDispatch();

  // selectors
  const { selectEventsBetweenDates } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(state => selectEventsBetweenDates(state, startDate, endDate));
  const currentDate = ourUseSelector(selectCurrentDatetimeAsDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsDate);
  const selectedMonth = ourUseSelector(selectSelectedMonthAsDate);

  // fetch events when date range changes
  useEffect(() => {
    const startDateISO = new Date(new Date(startDate).setMonth(startDate.getMonth() - 1)).toISOString();
    const endDateISO = new Date(new Date(endDate).setMonth(endDate.getMonth() + 1)).toISOString();
    const timeoutId = setTimeout(() => {
      dispatch(getEvents({ start: startDateISO, end: endDateISO }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [dispatch, startDate, endDate]);

  // refs and state for grid measurement
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>());
  const gridRowWidthRef = useRef<HTMLDivElement>(null);
  const [gridRowWidth, setGridRowWidth] = useState(0);
  const [eventProps, setEventProps] = useState<EventProps[][]>();

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
  }, [events, startDate, gridRowWidth, cellCount, colCount, eventStyle]);

  // month navigation handler
  const navigateMonth = (delta: number) => {
    if (!isValidDate(selectedMonth)) {
      return;
    }
    const date = new Date(selectedMonth);
    date.setMonth(date.getMonth() + delta);
    dispatch(setSelectedMonth({ monthIsoStr: date.toISOString() }));
  };

  // Get events for a specific cell
  const getEventsInCell = (cellIndex: number): EventProps[] => {
    const laneMap = cellLaneEvents.current.get(cellIndex);
    if (!laneMap) return [];
    const allEvents = eventProps?.flat() ?? [];
    const result: EventProps[] = [];
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
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
        {colHeaders.map((header, i) => (
          <div
            key={i}
            className="text-center text-xl py-2 border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text"
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
          <div ref={gridRowWidthRef} key={rowIndex} className="relative">
            <div
              className="grid gap-0 border-light-border dark:border-dark-border"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cellsInRow }, (_, i) => {
                const cellIndex = rowStart + i;
                const cellDate = getDateFromCellIndex(TimeSpanEnum.Day, startDate, cellIndex) ?? new Date();
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
                  />
                );
              })}
            </div>

            {/* Events overlay */}
            {eventProps && gridRowWidth > 0 && (
              <div className="absolute top-8 left-0 w-full">
                {eventProps[rowIndex]?.map((evp) => evp && (
                  <Event
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
export type { GridProps, GridStyle };

