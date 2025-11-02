
// fake enum
import { TimeSpan } from "../types/TimeSpan";

// event type
import type { StandardEvent } from "../types/StandardEvent";

// this function pre-calculates an event's positioning within the grid
function calculateEventPositions(
  events: StandardEvent[],
  columns: number,
  cells: number,
  gridRowWidth: number,
  gridStart: Date,
  cellStep: TimeSpan
): StandardEvent[][] {

  // consts
  const numOfRows = Math.ceil(cells / columns);
  const rows: StandardEvent[][] = Array.from({ length: numOfRows }, () => []);
  const cellWidth = gridRowWidth / columns;

  // sort the array so start index relates to the event's lane positioning
  // if we want to start positioning events within the cells according to time within day etc this will need more thought
  events.sort((a, b) => a.start.getTime() - b.start.getTime())

  // calc the event starts / ends
  events.forEach((ev) => {
    for (let r = 0; r < numOfRows; r++) {

      // get cellindex from date time
      const cellStartIndex = getCellIndexFromDate(cellStep, gridStart, ev.start)
      const cellEndIndex = getCellIndexFromDate(cellStep, gridStart, ev.end)

      const rowStart = r * columns + 1;
      const rowEnd = Math.min(rowStart + columns - 1, cells);

      if (cellStartIndex <= rowEnd && cellEndIndex >= rowStart) {
        const eventStartInRow = Math.max(cellStartIndex, rowStart);
        const eventEndInRow = Math.min(cellEndIndex, rowEnd);
        const span = eventEndInRow - eventStartInRow + 1;

        const left = (eventStartInRow - rowStart) * cellWidth;
        const width = span * cellWidth;

        let classes = ev.extraClasses.replace(/rounded-[lr]-md/g, '');
        if (eventStartInRow === cellStartIndex) classes += " rounded-l-4xl";
        if (eventEndInRow === cellEndIndex) classes += " rounded-r-4xl";

        // Create completely new object
        const segment: StandardEvent = {
          start: ev.start,
          end: ev.end,
          title: ev.title,
          extraClasses: classes.trim(),
          left: left,
          width: width,
          top: 0
        };

        rows[r].push(segment);
      }
    }
  });

  // IF WE WANT TO MAXIMISE GRID SPACE:
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

  // // loop over rows
  // rows.forEach(row => {
  //   // loop over each event in the row
  //   row.forEach(ev => {
  //     for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
  //       const lane = lanes[laneIndex];

  //       // Count the number of overlaps with events in this lane
  //       const overlapCount = lane.reduce((count, existing) => {
  //         const evStart = ev.left;
  //         const evEnd = ev.left + ev.width;
  //         const existingStart = existing.left;
  //         const existingEnd = existing.left + existing.width;

  //         const overlaps = !(evEnd <= existingStart || evStart >= existingEnd);

  //         return count + (overlaps ? 1 : 0);
  //       }, 0);

  //       debugger;

  //       for (let i = 0; i < overlapCount; i++) {
  //         lane.push(ev);
  //         ev.top = laneIndex * 32; // 32px per lane
  //       }
  //     }
  //   });
  // });

  debugger;
  return rows;
};

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
  switch(cellStep) {
    case TimeSpan.Day:
      ret.setDate(gridStart.getDate() + cellIndex - 1)
      return ret
  }
  return gridStart;
}

export { 
  calculateEventPositions, 
  getCellIndexFromDate, 
  getDateFromCellIndex 
};