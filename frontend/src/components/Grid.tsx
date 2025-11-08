//react
import React, { useEffect, useRef, useState } from "react";

// components
import { Cell } from "./Cell";
import { EventHolder } from "./EventHolder";

// types
import type { EventModel } from "../types/EventModel";
import type { CellStyle } from "./Cell";
import type { EventHolderStyle } from "./EventHolder";

// utils
import { getDateFromCellIndex, getCellIndexFromDate } from "../utils/eventGridUtils";

// css
import '../../index.css';
import type { TimeSpan } from "../types/TimeSpan";

/*
Mostly using tailwind where I can.
However tailwind classes need to be known at compile
So use regular css for bits that need to be dynamic. 

Bits using manual styling:
  - gridTemplateColumns on the grid rows
  - grid row height
  - event height

  Need to think through how events are positioned 
*/

type GridStyle = {
  eventHolderStyle: EventHolderStyle;
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

    // reduce this for performance
    let iterationCounter = 0

    // consts
    const numOfRows = Math.ceil(cellCount / colCount);
    const rows: EventModel[][] = Array.from({ length: numOfRows }, () => []);
    const cellWidth = gridRowWidth / colCount;

    // Track which lanes are occupied in each cell
    const cellLanes = new Map<number, Set<number>>();

    // sort events so earliest events are always rendered on top of later ones
    events.sort((a, b) => a.start.getTime() - b.start.getTime());

    // iter our events
    events.forEach((ev) => {

      // cell start index of event
      const cellStartIndex = getCellIndexFromDate(cellStep, start, ev.start);
      const cellEndIndex = getCellIndexFromDate(cellStep, start, ev.end);

      // Find the (lowest index, highest literal position) available lane across ALL cells this event spans
      let lane = 0;
      while (true) {
        let laneAvailable = true;
        for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
          iterationCounter++
          const occupiedLanes = cellLanes.get(cellIndex);
          if (occupiedLanes && occupiedLanes.has(lane)) {
            laneAvailable = false;
            break;
          }
        }
        if (laneAvailable) break;
        lane++;
      }

      // Mark this lane as occupied for all cells this event spans
      for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
        if (!cellLanes.has(cellIndex)) {
          cellLanes.set(cellIndex, new Set());
        }
        cellLanes.get(cellIndex)!.add(lane);
      }
      // Now distribute the event across rows
      for (let r = 0; r < numOfRows; r++) {
        iterationCounter++
        const rowStart = r * colCount + 1;
        const rowEnd = Math.min(rowStart + colCount - 1, cellCount);
        if (cellStartIndex <= rowEnd && cellEndIndex >= rowStart) {
          const eventStartInRow = Math.max(cellStartIndex, rowStart);
          const eventEndInRow = Math.min(cellEndIndex, rowEnd);
          const span = eventEndInRow - eventStartInRow + 1;
          const left = (eventStartInRow - rowStart) * cellWidth;
          const width = span * cellWidth;
          let classes = ev.extraClasses.replace(/rounded-[lr]-md/g, '');
          if (eventStartInRow === cellStartIndex) classes += " rounded-l-4xl";
          if (eventEndInRow === cellEndIndex) classes += " rounded-r-4xl";
          const segment: EventModel = {
            start: ev.start,
            end: ev.end,
            title: ev.title,
            extraClasses: classes.trim(),
            left: left,
            width: width,
            lane: lane
          };
          rows[r].push(segment);
          if (eventEndInRow === cellEndIndex) { return; }
        }
      }
    });
    console.log("REDUCE THIS NUMBER: " + iterationCounter)
    return rows;
  }

  return (
    <div      
      id="calendar-grid-container"
      className="flex flex-col gap-4 p-4 max-w-5xl mx-auto"
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
                    cellIndex={i}
                    egcStyle={{ heightStyle: egStyle.cellStyle.heightStyle }}
                  />
                );
              })}
            </div>
            {/* Create events for this row */}
            {processedEvents && gridRowWidth && (
              // processedEvents[rowIndex]
              <EventHolder
                events={processedEvents[rowIndex]}
                ehStyle={{
                  defaultEventStyle: egStyle.eventHolderStyle.defaultEventStyle,
                  eventHeightStyle: egStyle.eventHolderStyle.eventHeightStyle
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Grid };
export type { GridStyle }