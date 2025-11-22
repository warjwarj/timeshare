//react
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";

// components
import { Cell } from "./Cell";
import { Event } from './Event';

// types
import type { EventDTO } from "../types/EventDTO";
import type { EventStyle } from "./Event"
import type { EventProps } from './Event';
import type { CellStyle } from "./Cell";
import type { TimeSpan } from "../types/TimeSpan";
import type { ModifyEventsAction } from "../actions/ModifyEventsAction";

// utils
import { getDateFromCellIndex, setEventPositions } from "../utils/utils";

// css
import '../../index.css';

/*

*/

type GridStyle = {
  eventStyle: EventStyle;
  cellStyle: CellStyle
}
type GridProps = {
  colCount: number;
  cellCount: number;
  events: EventDTO[];
  egStyle: GridStyle;
  start: Date;
  cellStep: TimeSpan
};
const Grid: React.FC<GridProps> = ({ colCount, cellCount, events, egStyle, start, cellStep }) => {

  // refs
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>()) // Map<cellIndex, Map<lane, eventId>> SURELY we don't need to use a ref for this? Just save it in the event?
  const gridRowWidthRef = useRef<HTMLDivElement>(null);

  const [eventProps, setEventProps] = useState<EventProps[][]>()
  const [_, eventDtosDispatch] = useReducer(ModifyEventsReducer, [])

  // events
  function ModifyEventsReducer(
    state: EventDTO[],
    action: ModifyEventsAction
  ) {
    let newEvents = state;
    switch (action.type) {
      case 'SET_ALL_EVENTS':
        newEvents = action.payload.evs;
        break;
      case 'UPDATE_EVENT':
        newEvents = state.map(ev => {
          return ev.id == action.payload.ev.id ?
            action.payload.ev :
            ev
        })
        break;
      case 'DELETE_EVENT':
        newEvents = newEvents.filter(ev => ev.id === action.payload.ev.id)
        break;
      default:
        break;
    }
    
    // set event styles
    setEventProps(setEventPositions(
      newEvents,
      cellLaneEvents.current,
      gridRowWidthRef.current?.getBoundingClientRect().width ?? 0,
      start,
      cellCount,
      cellStep,
      colCount,
      egStyle.eventStyle
    ))

    return newEvents
  }

  // show events on page load
  useEffect(() => {
    eventDtosDispatch({
      type: "SET_ALL_EVENTS",
      payload: { evs: events }
    })
  }, [])

  // callback update single event
  const updateEventCallback = useCallback((moddedev: EventDTO) => {
    eventDtosDispatch({
      type: "UPDATE_EVENT",
      payload: { ev: moddedev }
    })
  }, [])

  // helper get all events in a specific cell
  const getEventsInCell = (cellIndex: number): EventProps[] => {
    const laneMap = cellLaneEvents.current.get(cellIndex); // gets lanes and the event ids which are in those lanes
    const evArr: EventProps[] = [];
    laneMap?.forEach((id, lane) => {
      const evObj = eventProps?.flat().find(ev => ev?.eventDTO.id === id)
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
      className="flex flex-col gap-4 p-4 max-w-5xl mx-auto overflow-x-hidden"
    >
      {/* iterate to create rows */}
      {Array.from({ length: Math.ceil(cellCount / colCount) }).map((_, rowIndex) => {
        const rowStart = rowIndex * colCount + 1;
        const rowEnd = Math.min(rowStart + colCount - 1, cellCount);
        return (
          <div
            ref={gridRowWidthRef}
            key={rowIndex}
            className="relative w-full"
          >
            <div
              className="grid gap-0 border-b border-gray-200"
              style={{
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`
              }}
            >
              {/* iterate to create cells */}
              {Array.from({ length: rowEnd - rowStart + 1 }).map((_, i) => {
                return (
                  <Cell
                    label={getDateFromCellIndex(cellStep, start, rowStart + i)?.toDateString()}
                    rowStartIndex={rowStart}
                    rowEndIndex={rowEnd}
                    cellIndex={rowStart + i}
                    egcStyle={{ heightStyle: egStyle.cellStyle.heightStyle }}
                    getEvents={getEventsInCell}
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
export type { GridStyle }