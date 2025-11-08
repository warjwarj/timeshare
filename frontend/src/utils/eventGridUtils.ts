// fake enum
import { TimeSpan } from "../types/TimeSpan";

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

export {  
  getCellIndexFromDate,
  getDateFromCellIndex
};

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