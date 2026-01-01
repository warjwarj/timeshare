import React, { useCallback, useEffect, useRef, useState } from "react";
import type { EventDTO } from "../../types/EventDTO";
import type { TimeSpan } from "../../types/dateTypes";
import { getDateFromCellIndex, isValidDate, setEventPositions } from "../../utils/utils";
import type { CellStyle } from "./Cell";
import { Cell } from "./Cell";
import type { EventProps, EventStyle } from "./Event";
import { Event } from './Event';

import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { getEvents, selectProcessedEvents, updateEvent, addEvent } from '../../store/slices/eventsSlice';

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
  egStyle: GridStyle;
  start: Date;
  cellStep: TimeSpan
};
const Grid: React.FC<GridProps> = ({ egStyle, start, cellStep }) => {
  const events = ourUseSelector(selectProcessedEvents)
  const dispatch = ourUseDispatch()

  // refs
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>()) // Map<cellIndex, Map<lane, eventId>> SURELY we don't need to use a ref for this? Just save it in the event?
  const gridRowWidthRef = useRef<HTMLDivElement>(null);

  // event props state
  const [eventProps, setEventProps] = useState<EventProps[][]>()

  // get events on page load
  useEffect(() => {
    if (!isValidDate(start)) {
      return;
    }
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + 1);
    const prm = dispatch(getEvents({ start: start, end: endDate }))
    return () => {
      prm.abort()
    };
  }, [dispatch, start]);

  // update event styles
  useEffect(() => {
    if (events.length === 0 || !isValidDate(start)) {
      return;
    }
    setEventProps(setEventPositions(
      events,
      cellLaneEvents.current,
      gridRowWidthRef.current?.getBoundingClientRect().width ?? 0,
      start,
      egStyle.cellCount,
      cellStep,
      egStyle.colCount,
      egStyle.eventStyle
    ))
  }, [events, start, egStyle.cellCount, cellStep, egStyle.colCount, egStyle.eventStyle])

  // callback update single event
  const updateEventCallback = useCallback((moddedev: EventDTO) => {
    dispatch(updateEvent(moddedev))
  }, [dispatch])

  // callback add new event
  const addEventCallback = useCallback((newEvent: Omit<EventDTO, 'key' | 'uuid'>) => {
    dispatch(addEvent(newEvent))
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
                return (
                  <Cell
                    key={cellIndex}
                    label={cellDate.toDateString()}
                    rowStartIndex={rowStart}
                    rowEndIndex={rowEnd}
                    cellIndex={cellIndex}
                    egcStyle={{ heightStyle: egStyle.cellStyle.heightStyle }}
                    cellDate={cellDate}
                    getEvents={getEventsInCell}
                    onAddEvent={addEventCallback}
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

