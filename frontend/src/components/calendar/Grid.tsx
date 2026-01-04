import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventDTO } from "../../types/EventDTO";
import type { TimeSpan } from "../../types/dateTypes";
import { getDateFromCellIndex, isValidDate, isSameDay } from "../../utils/utils";
import { setEventPositions } from "../../utils/gridUtils";
import type { CellStyle } from "./Cell";
import { Cell } from "./Cell";
import type { EventProps, EventStyle } from "./Event";
import { Event } from './Event';

import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { updateEvent, addEvent, deleteEvent, makeEventSelectors } from '../../store/slices/eventsSlice';

import '../../../index.css';

/*
  Calendar grid component
*/

type GridStyle = {
  eventStyle: EventStyle;
  cellStyle: CellStyle
  colCount: number;
  cellCount: number;
}
type GridProps = {
  currentDate: Date;
  selectedDate: Date;
  egStyle: GridStyle;
  start: Date;
  cellStep: TimeSpan;
  colHeaders: string[];
  gridLabel: string
};
const Grid: React.FC<GridProps> = ({ egStyle, start, cellStep, colHeaders, gridLabel, currentDate, selectedDate }) => {
  const dispatch = ourUseDispatch()

  // memoised events selector
  const { selectProcessedEvents } = useMemo(
    () => makeEventSelectors(),
    []
  )
  const events = ourUseSelector(selectProcessedEvents);

  // refs
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>()) // Map<cellIndex, Map<lane, eventId>> SURELY we don't need to use a ref for this? Just save it in the event?
  const gridRowWidthRef = useRef<HTMLDivElement>(null);
  const [gridRowWidth, setGridRowWidth] = useState(0)

  // event props state
  const [eventProps, setEventProps] = useState<EventProps[][]>()

  // measure container height on mount and resize
  useEffect(() => {
    const container = gridRowWidthRef.current;
    if (!container) return;
    const updateWidth = () => {
      const height = container.getBoundingClientRect().width ?? 0;
      setGridRowWidth(height);
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // update event styles
  useEffect(() => {
    if (events.length === 0 || !isValidDate(start)) {
      return;
    }
    setEventProps(setEventPositions(
      events,
      cellLaneEvents.current,
      gridRowWidth,
      start,
      egStyle.cellCount,
      cellStep,
      egStyle.colCount,
      egStyle.eventStyle
    ))
  }, [events, start, gridRowWidth, egStyle.cellCount, cellStep, egStyle.colCount, egStyle.eventStyle])

  // callback update single event
  const updateEventCallback = useCallback((moddedev: EventDTO) => {
    dispatch(updateEvent(moddedev))
  }, [dispatch])

  // callback add new event
  const addEventCallback = useCallback((newEvent: Omit<EventDTO, 'key' | 'uuid'>) => {
    dispatch(addEvent(newEvent))
  }, [dispatch])

  // callback delete event
  const deleteEventCallback = useCallback((uuid: string) => {
    dispatch(deleteEvent(uuid))
  }, [dispatch])

  // helper get all events in a specific cell
  const getEventsInCell = (cellIndex: number): EventProps[] => {
    const laneMap = cellLaneEvents.current.get(cellIndex); // gets lanes and the event ids which are in those lanes
    const evArr: EventProps[] = [];
    laneMap?.forEach((id, lane) => {
      const evObj = eventProps?.flat().find(ev => ev?.eventDTO.uuid === id)
      if (evObj) {
        evObj.evStyle.lane = lane
        evArr.push(evObj)
      }
    });
    return evArr
  }

  return (
    <div
      id="calendar-grid-container"
      className="w-full h-full flex flex-col gap-4 p-4 w-full box-border"
    >
      <h1 className="text-2xl font-bold">{gridLabel}</h1>

      {/* Column headers */}
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${egStyle.colCount}, minmax(0, 1fr))`,
        }}
      >
        {colHeaders.map((header, i) => (
          <div
            key={i}
            className="text-center text-xl py-2 border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text"
          >
            {header}
          </div>
        ))}
      </div>

      {/* iterate to create rows */}
      {Array.from({ length: Math.ceil(egStyle.cellCount / egStyle.colCount) }).map((_, rowIndex) => {
        const rowStart = rowIndex * egStyle.colCount + 1;
        const rowEnd = Math.min(rowStart + egStyle.colCount - 1, egStyle.cellCount);
        return (
          <div
            ref={gridRowWidthRef}
            key={rowIndex}
            className="relative w-auto"
          >
            <div
              className="grid gap-0 border-light-border dark:border-dark-border"
              style={{
                gridTemplateColumns: `repeat(${egStyle.colCount}, minmax(0, 1fr))`
              }}
            >
              {/* iterate to create cells */}
              {Array.from({ length: rowEnd - rowStart + 1 }).map((_, i) => {
                const cellIndex = rowStart + i;
                const cellDate = getDateFromCellIndex(cellStep, start, cellIndex) ?? new Date();
                const isOutsideMonth = cellDate.getMonth() !== selectedDate.getMonth();
                const isSelected = isSameDay(cellDate, selectedDate);
                const isHighlighted = isSameDay(cellDate, currentDate);
                return (
                  <Cell
                    key={cellIndex}
                    label={cellDate.getDate().toString()}
                    rowStartIndex={rowStart}
                    rowEndIndex={rowEnd}
                    cellIndex={cellIndex}
                    egcStyle={{ heightStyle: egStyle.cellStyle.heightStyle }}
                    cellDate={cellDate}
                    getEvents={getEventsInCell}
                    onAddEvent={addEventCallback}
                    isOutsideMonth={isOutsideMonth}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                  />
                );
              })}
            </div>
            {/* iterate to create events */}
            {eventProps && gridRowWidthRef.current && (
              <div className="absolute top-8 left-0 w-full">
                {eventProps[rowIndex]?.map((evp: EventProps) => {
                  return (
                    evp == null ?
                      null :
                      <Event
                        key={evp.key}
                        eventProps={evp}
                        updateEvent={updateEventCallback}
                        deleteEvent={deleteEventCallback}
                      />
                  )
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Grid };
export type { GridProps, GridStyle };

