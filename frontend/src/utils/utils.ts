// fake enum
import { TimeSpanEnum, type TimeSpan} from "../types/dateTypes";
import axios from 'axios'

import type { EventProps, EventStyle } from "../components/calendar/Event";
import type { EventDTO } from "../types/EventDTO";

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Generic utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

// to make sure the error is of type string
function getStrErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message 
      || error.response?.data?.detail
      || error.message 
      || 'Request failed';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Date utils
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

function isValidDate(d: Date) {
  return (Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime()));
}

function getCalendarDaysInMonth(year: number, month: number) {
  const monthIndex = month - 1; // 0..11 instead of 1..12
  const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const date = new Date(year, monthIndex, 1);
  const result = [];
  while (date.getMonth() == monthIndex) {
    result.push(date.getDate() + '-' + names[date.getDay()]);
    date.setDate(date.getDate() + 1);
  }
  return result;
}

// get cell index from the date (1-based to match Grid cell numbering)
function getCellIndexFromDate(cellStep: TimeSpan, gridStart: Date, dt: Date): number {
  switch (cellStep) {
    case TimeSpanEnum.Day:
      return Math.floor((dt.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  return 1;
}

// get date from cell index. Date will always be rounded down to the nearest timeSpan.
function getDateFromCellIndex(cellStep: TimeSpan, gridStart: Date, cellIndex: number): Date {
  const ret = new Date(gridStart)
  switch (cellStep) {
    case TimeSpanEnum.Day:
      ret.setDate(gridStart.getDate() + cellIndex - 1)
      return ret
  }
  return gridStart;
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  SET EVENT POSITIONS
  create event style objects

  This function is a beast that needs to be tamed
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

function setEventPositions(
  evDtos: EventDTO[],
  cellLaneEvents: Map<number, Map<number, string>>,
  gridRowWidth: number,
  start: Date,
  cellCount: number,
  cellStep: string,
  colCount: number,
  defaultEventStyle: EventStyle
): EventProps[][] {

  // 1. Init the lane event cell map (1-based to match Grid cell numbering)
  cellLaneEvents.clear();
  for (let i = 1; i <= cellCount; i++) {
    cellLaneEvents.set(i, new Map<number, string>());
  }

  // Constants
  const numOfRows = Math.ceil(cellCount / colCount);
  const rows: EventProps[][] = Array.from({ length: numOfRows }, () => []);
  const cellWidth = gridRowWidth / colCount;

  // 2. Sort events by start time (Essential for correct lane stacking)
  const sortedEvents = [...evDtos].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Iterate through sorted events
  sortedEvents.forEach((ev) => {

    let cellStartIndex = getCellIndexFromDate(cellStep, start, ev.start) + 1;
    let cellEndIndex = getCellIndexFromDate(cellStep, start, ev.end) + 1;

    // Safety checks for grid boundaries (1-based: valid range is 1 to cellCount)
    if (cellStartIndex < 1) cellStartIndex = 1;
    if (cellEndIndex > cellCount) cellEndIndex = cellCount;
    if (cellStartIndex > cellEndIndex) return;

    // Find the highest available lane across ALL cells this event spans
    let lane = 0;

    // Check if this lane is available across the entire cell range
    while (true) {
      let laneAvailable = true;
      for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
        const laneMap = cellLaneEvents.get(cellIndex);
        // We check if the lane is taken by a DIFFERENT event
        if (laneMap?.has(lane) && laneMap.get(lane) !== ev.uuid) {
          laneAvailable = false;
          break;
        }
      }
      if (laneAvailable) break;
      lane++;
    }

    // Mark this lane as occupied by this event for all cells it spans
    for (let cellIndex = cellStartIndex; cellIndex <= cellEndIndex; cellIndex++) {
      const laneMap = cellLaneEvents.get(cellIndex);
      laneMap?.set(lane, ev.uuid);
    }

    // Distribute the event across rows
    // Use Math.floor to strictly determine which row the cell belongs to (adjusted for 1-based indexing)
    const firstRow = Math.floor((cellStartIndex - 1) / colCount);
    const lastRow = Math.floor((cellEndIndex - 1) / colCount);

    for (let r = firstRow; r <= lastRow && r < numOfRows; r++) {
      if (!rows[r]) continue;

      const rowStart = r * colCount + 1; // 1-based row start
      const rowEnd = Math.min(rowStart + colCount - 1, cellCount);

      // Calculate event boundaries within this row
      const eventStartInRow = Math.max(cellStartIndex, rowStart);
      const eventEndInRow = Math.min(cellEndIndex, rowEnd);
      
      // Span calculation (Inclusive math: End - Start + 1)
      const span = eventEndInRow - eventStartInRow + 1;

      // Calculate positioning
      const left = (eventStartInRow - rowStart) * cellWidth;
      const width = span * cellWidth;

      // Unique identifier for event segment
      const key = `${ev.uuid}-${r}-${eventStartInRow}`;

      // Add rounded corners where needed
      let classes = "";
      if (eventStartInRow === cellStartIndex) {
        classes += " rounded-l-4xl";
      }
      if (eventEndInRow === cellEndIndex) {
        classes += " rounded-r-4xl";
      }

      const evStyle: EventStyle = {
        eventHeightStyle: defaultEventStyle.eventHeightStyle,
        defaultEventStyle: defaultEventStyle.defaultEventStyle,
        extraClasses: classes.trim(),
        colour: ev.colour,
        left: left,
        width: width,
        lane: lane,
      };

      rows[r].push({
        key: key,
        evStyle: evStyle,
        eventDTO: ev
      });
    }
  });
  
  return rows;
}

export {
  getStrErrorMessage,
  getCalendarDaysInMonth,
  getCellIndexFromDate,
  getDateFromCellIndex,
  isValidDate,
  setEventPositions
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// IF WE WANT TO MAXIMISE GRID SPACE:
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// for each event we wish to position it as far up in that row as we can, without it overlapping another row.
// this means that we have to calculate, for each cell that an event may span, how many other events are also rendered across this cell.
// since we've absolutely positioned the event, we'll need to manually position it by spacing it down from the top.
// so if there is one event above the one we're spacing, we space it down from the top by one events worth pixels.
// if there is none, no spacing, if there is four, space it down by four elements worth of pixels.
// ya get me?

// we'll call one event's worth of spacing a lane, across the row.
// So a row with an event spanning from cell 2 to 6. another spanning from 1 to 4, and one only on 3, would have
// three lanes, and only in cell three would they all be populated. 2 - 4 would have lanes one and two populated,
// 1 and 5 - 6 one, and 7 would have none.

// this is maybe not the best? Might be clearer to have one lane dedicated for one event. Although this might insinuate that
// the order of the events, in respect to their lane number, isn't arbitrary, which at the moment it is.

// IF WE DON'T REALLY CARE ABOUT MAXIMISING GRID SPACE:
// then we can let the events sit as normal, where one event takes up a whole lane for an entire row.