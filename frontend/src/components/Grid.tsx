//react
import React, { useCallback, useEffect, useReducer, useRef } from "react";

// components
import { Cell } from "./Cell";
import { Event, type EventStyle } from './Event'

// types
import type { EventDTO } from "../types/EventDTO";
import type { CellStyle } from "./Cell";
import type { TimeSpan } from "../types/TimeSpan";
import type { ModifyEventsAction } from "../actions/ModifyEventsAction";

// utils
import { getDateFromCellIndex, calculateEventPositions } from "../utils/utils";

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

  // reduced state
  const [modifiedEvents, modifyEventsDispatch] = useReducer(ModifyEventsReducer, [[]])

  // reducer function (pointless atm)
  function ModifyEventsReducer(
    state: EventDTO[][],
    action: ModifyEventsAction
  ) {
    let newState = state.flat()
    switch (action.type) {
      case 'UPDATE_EVENT':
        newState = state.flatMap(eventRow =>
          eventRow.map(ev =>
            ev.id === action.payload.ev.id ? action.payload.ev : ev
          )
        );
        break;
      case 'UPDATE_ALL_EVENTS':
        newState = action.payload.evs;
        break;
      case 'DELETE_EVENT':
      default:
        newState = state.flat();
        break;
    }
    // Recalculate event positions before returning
    return calculateEventPositions(
      newState.flat(),
      cellLaneEvents.current,
      gridRowWidthRef.current?.getBoundingClientRect().width ?? 0,
      start,
      cellCount,
      cellStep,
      colCount
    );
  }

  // show events on page load
  useEffect(() => {
    modifyEventsDispatch({
      type: "UPDATE_ALL_EVENTS",
      payload: { evs: events }
    })
  }, [])

  // callback update single event
  const updateEventCallback = useCallback((ev: EventDTO) => {
    const newState = modifiedEvents.flatMap(eventRow =>
      eventRow.map(x =>
        x.id === ev.id ? ev : x
      )
    );
    modifyEventsDispatch({
      type: "UPDATE_ALL_EVENTS",
      payload: { evs: newState }
    })
  }, [modifiedEvents])

  // helper get all events in a specific cell
  const getEventsInCell = (cellIndex: number): EventDTO[] => {
    const laneMap = cellLaneEvents.current.get(cellIndex); // gets lanes and the event ids which are in those lanes
    const evArr: EventDTO[] = [];
    laneMap?.forEach((evId, lane) => {
      const evObj = events.find(ev => ev.id === evId)
      if (evObj) {
        evObj.lane = lane
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
            {modifiedEvents && gridRowWidthRef.current && (
              <div className="absolute top-8 left-0 w-full">
                {modifiedEvents[rowIndex]?.map((ev: EventDTO) => {
                  return (
                    <Event
                      key={ev.key}
                      eventDTO={ev}
                      evStyle={egStyle.eventStyle}
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