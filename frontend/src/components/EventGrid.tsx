//react
import React, { useEffect, useRef, useState } from "react";

// types
import type { StandardEvent } from "../types/StandardEvent";
import type { EventGridStyle } from "../types/EventGridStyle";

// utils
import { calculateEventPositions, getDateFromCellIndex } from "../utils/eventGridUtils";

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


type EventGrid = {
  columns: number;
  cells: number;
  events: StandardEvent[];
  egStyle: EventGridStyle;
  start: Date;
  cellStep: TimeSpan
};
const EventGrid: React.FC<EventGrid> = ({ columns, cells, events, egStyle, start, cellStep }) => {

  // we don't currently allow rows to be definable.
  const rows = Math.ceil(cells / columns);

  // use to calculate width of event bars
  const gridRowWidthRef = useRef<HTMLDivElement>(null);
  const [gridRowWidth, setGridRowWidth] = useState(0);

  // track processed events
  const [processedEvents, setProcessedEvents] = useState<StandardEvent[][]>([]);
  useEffect(() => {
    if (!gridRowWidth || !cells || !columns || !events) return;
    const result = calculateEventPositions(events, columns, cells, gridRowWidth, start, cellStep);
    setProcessedEvents(result);
  }, [events, cells, columns, gridRowWidth]);

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

  return (
    <div
      id="calendar-grid-container"
      className="flex flex-col gap-4 p-4 max-w-5xl mx-auto"
    >
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const rowStart = rowIndex * columns + 1;
        const rowEnd = Math.min(rowStart + columns - 1, cells);
        return (
          // ROWS
          <div key={`row-${rowIndex}`} className="relative w-full" ref={gridRowWidthRef}>
            <div 
              className="grid gap-0 border-b border-gray-200"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
              }}
            >
              {/* CELLS */}
              {Array.from({ length: rowEnd - rowStart + 1 }).map((_, i) => {
                return (
                  <div
                    key={`cell-${rowStart + i}`}
                    className="border border-gray-300 flex justify-center"
                    style={{
                      height: egStyle.RowHeight
                    }}
                  >
                    <span className="top-4">{getDateFromCellIndex(cellStep, start, rowStart + i)?.toDateString()}</span>
                  </div>
                );
              })}
            </div>

            {/* EVENTS */}
            {processedEvents && gridRowWidth && (
              <div className="absolute top-8 left-0 w-full pointer-events-none">
                {processedEvents[rowIndex]?.map((re, i) => {
                  return (
                    <span
                      key={`event-${i}`}
                      className={
                        `${egStyle.DefaultEventStyle}
                        ${re.extraClasses}`
                      }
                      style={{
                        height: egStyle.EventHeight,
                        left: `${re.left}px`,
                        width: `${re.width}px`,
                        top: `${re.top}px`
                      }}
                    >
                      <span>Start: {re.start.toDateString()}  | End:  {re.end.toDateString()}</span>
                    </span>
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

export { EventGrid };