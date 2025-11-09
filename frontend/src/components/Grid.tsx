//react
import React, { useEffect, useRef, useState } from "react";

// components
import { Cell } from "./Cell";
import { Event, type EventStyle } from './Event'

// types
import type { EventModel } from "../types/EventModel";
import type { CellStyle } from "./Cell";

// utils
import { getDateFromCellIndex, getCellIndexFromDate } from "../utils/eventGridUtils";

// css
import '../../index.css';
import type { TimeSpan } from "../types/TimeSpan";

/*

*/

type GridStyle = {
  eventStyle: EventStyle;
  cellStyle: CellStyle
}
type GridProps = {
  colCount: number;
  cellCount: number;
  events: EventModel[];
  egStyle: GridStyle;
  start: Date;
  cellStep: TimeSpan
};
const Grid: React.FC<GridProps> = ({ colCount, cellCount, events, egStyle, start, cellStep }) => {

  // we don't currently allow rows to be definable.
  const rows = Math.ceil(cellCount / colCount);

  // Track which event occupies which lane in each cell
  // Map<cellIndex, Map<lane, eventId>>
  const cellLaneEvents = useRef(new Map<number, Map<number, string>>())

  // Get all events in a specific cell
  function getEventsInCell(cellIndex: number): EventModel[] {
    const laneMap = cellLaneEvents.current.get(cellIndex); // gets lanes and the event ids which are in those lanes
    const evArr: EventModel[] = [];
    laneMap?.forEach((evId, lane) => {
      const evObj = events.find(ev => ev.id === evId)
      if (evObj) {
        evObj.lane = lane
        evArr.push(evObj)
      }
    });
    return evArr
  }

  // use to calculate width of event bars
  const gridRowWidthRef = useRef<HTMLDivElement>(null);
  const [gridRowWidth, setGridRowWidth] = useState(0);

  // track processed events
  const [processedEvents, setProcessedEvents] = useState<EventModel[][]>([]);
  useEffect(() => {
    if (!gridRowWidth || !cellCount || !colCount || !events) return;
    const result = calculateEventPositions(events, gridRowWidth);
    setProcessedEvents(result);
  }, [events, cellCount, colCount, gridRowWidth]);

  // on page load
  useEffect(() => {
    if (!gridRowWidthRef.current) return;
    const updateWidth = () => {
      if (gridRowWidthRef.current) {
        setGridRowWidth(gridRowWidthRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(gridRowWidthRef.current);
    return () => observer.disconnect();
  }, []);

  // position the elements within the grid
  function calculateEventPositions(
    events: EventModel[],
    gridRowWidth: number,
  ): EventModel[][] {

    // init the lane event cell map thing
    for (let i = 1; i <= cellCount; i++) {
      cellLaneEvents.current.set(i, new Map<number, string>())
    }

    // Constants
    const numOfRows = Math.ceil(cellCount / colCount);
    const rows: EventModel[][] = Array.from({ length: numOfRows }, () => []);
    const cellWidth = gridRowWidth / colCount;

    // Sort events so earliest events are always rendered on top of later ones
    events.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Iterate through events
    events.forEach((ev) => {
      const cellStartIndex = getCellIndexFromDate(cellStep, start, ev.start);
      const cellEndIndex = getCellIndexFromDate(cellStep, start, ev.end);

      // Find the lowest available lane across ALL cells this event spans
      let lane = 0;

      // Check if this lane is available across the entire cell range
      while (true) {
        let laneAvailable = true;
        for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
          const laneMap = cellLaneEvents.current.get(cellIndex);
          if (laneMap?.has(lane)) {
            // Lane is occupied by another event
            laneAvailable = false;
            break;
          }
        }
        if (laneAvailable) break;
        lane++;
      }

      // Mark this lane as occupied by this event for all cells it spans
      for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
        console.log(lane, ev.id)
        const laneMap = cellLaneEvents.current.get(cellIndex);
        laneMap?.set(lane, ev.id);
      }

      // Pre-compute rounded class modifications once
      const baseClasses = ev.extraClasses.replace(/rounded-[lr]-md/g, '');

      // Distribute the event across rows
      // Calculate which rows this event appears in
      const firstRow = Math.floor((cellStartIndex - 1) / colCount);
      const lastRow = Math.floor((cellEndIndex - 1) / colCount);

      for (let r = firstRow; r <= lastRow && r < numOfRows; r++) {

        const rowStart = r * colCount + 1;
        const rowEnd = Math.min(rowStart + colCount - 1, cellCount);

        // Calculate event boundaries within this row
        const eventStartInRow = Math.max(cellStartIndex, rowStart);
        const eventEndInRow = Math.min(cellEndIndex, rowEnd);
        const span = eventEndInRow - eventStartInRow + 1;

        // Calculate positioning
        const left = (eventStartInRow - rowStart) * cellWidth;
        const width = span * cellWidth;

        // Build classes for this segment
        let classes = baseClasses;
        if (eventStartInRow === cellStartIndex) classes += " rounded-l-4xl";
        if (eventEndInRow === cellEndIndex) classes += " rounded-r-4xl";

        // Create segment
        const segment: EventModel = {
          id: ev.id,
          start: ev.start,
          end: ev.end,
          title: ev.title,
          extraClasses: classes.trim(),
          left: left,
          width: width,
          lane: lane
        };

        rows[r].push(segment);
      }
    });
    return rows;
  }

  return (
    <div
      id="calendar-grid-container"
      className="flex flex-col gap-4 p-4 max-w-5xl mx-auto overflow-x-hidden"
    >
      {/* Iterate to create cells for each row */}
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const rowStart = rowIndex * colCount + 1;
        const rowEnd = Math.min(rowStart + colCount - 1, cellCount);
        return (
          <div ref={gridRowWidthRef} key={`row-${rowIndex}`} className="relative w-full">
            <div
              className="grid gap-0 border-b border-gray-200"
              style={{
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`
              }}
            >
              {/* Iterate to create cells for this row */}
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
            {/* iterate to show events for this row */}
            {processedEvents && gridRowWidth && (
              <div className="absolute top-8 left-0 w-full">
                {processedEvents[rowIndex]?.map((ev) => {
                  return (
                    <Event ev={ev} evStyle={egStyle.eventStyle} />
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