// fake enum
import { TimeSpan } from "../types/TimeSpan";
import type { EventDTO } from "../types/EventDTO";

function isValidDate(d: Date) {
  return ( Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime()) );
}

function getCalendarDaysInMonth(year: number, month: number) {
  const monthIndex = month - 1; // 0..11 instead of 1..12
  const names = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
  const date = new Date(year, monthIndex, 1);
  const result = [];
  while (date.getMonth() == monthIndex) {
    result.push(date.getDate() + '-' + names[date.getDay()]);
    date.setDate(date.getDate() + 1);
  }
  return result;
}

// get cell index from the date. Could also return a lane index.
function getCellIndexFromDate(cellStep: TimeSpan, gridStart: Date, dt: Date): number {
  switch (cellStep) {
    case TimeSpan.Day:
      return Math.floor((dt.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  return 0;
}

// get date from cell index. Date will always be rounded down to the nearest timeSpan.
function getDateFromCellIndex(cellStep: TimeSpan, gridStart: Date, cellIndex: number): Date {
  const ret = new Date(gridStart)
  switch (cellStep) {
    case TimeSpan.Day:
      ret.setDate(gridStart.getDate() + cellIndex - 1)
      return ret
  }
  return gridStart;
}

  // position the elements within the grid cellCount, cellStep, colCount, start
  function calculateEventPositions (
    events: EventDTO[],
    cellLaneEvents: Map<number, Map<number, string>>,
    gridRowWidth: number,
    start: Date,
    cellCount: number,
    cellStep: string,
    colCount: number
  ): EventDTO[][] {

    // init the lane event cell map thing
    for (let i = 1; i <= cellCount; i++) {
      cellLaneEvents.set(i, new Map<number, string>())
    }

    // Constants
    const numOfRows = Math.ceil(cellCount / colCount);
    const rows: EventDTO[][] = Array.from({ length: numOfRows }, () => []);
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
          const laneMap = cellLaneEvents.get(cellIndex);
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
        const laneMap = cellLaneEvents.get(cellIndex);
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
        const segment: EventDTO = {
          id: ev.id,
          start: ev.start,
          end: ev.end,
          title: ev.title,
          extraClasses: classes.trim(),
          colour: ev.colour,
          left: left,
          width: width,
          lane: lane
        };

        rows[r].push(segment);
      }
    });
    return rows;
  }

export { 
  getCalendarDaysInMonth, 
  getCellIndexFromDate, 
  getDateFromCellIndex, 
  isValidDate, 
  calculateEventPositions 
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