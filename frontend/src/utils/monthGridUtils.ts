import { TZDate } from "@date-fns/tz";
import { differenceInMilliseconds } from "date-fns";
import type { EventBarProps, EventBarStyle } from "../components/calendar/EventBar";
import { MonthEnum } from "../types/dateTypes";
import type { ProcessedEventDTO } from "../types/EventDTO";
import { getPreviousMonday, tzdateToTzdate } from "./utils";

const msPerDay = 24 * 60 * 60 * 1000;

/**
 * Get the 1 based cell index of a date within the grid.
 * We want to display each event in it's local time.
 * This means we need to do the index calculation with each event in the same tiemzone.
 * 
 * @param gridStart   start date of the grid
 * @param dt          event's date
 * @param tz          event's timezone
 * @returns           1 based index of the cell within the grid.
 */
function getCellIndexFromDate(gridStart: TZDate, evTzDate: TZDate): number {
  const evDT = tzdateToTzdate(evTzDate, gridStart.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  const diffMs = differenceInMilliseconds(evDT, gridStart);
  return Math.floor(diffMs / msPerDay) + 1;
}

/**
 * Do the calculations needed to set each event bar's style such that it accurately represents the event's timespan.
 *
 * @param evDtos                The event dto objects.
 * @param cellLaneEvents        Map for vertically ordering events within cells. Map<cellIndex, Map<lane, eventId>>.
 * @param gridRowWidth          Grid width.
 * @param start                 Grid start date.
 * @param cellCount             Number of cells in the grid .
 * @param colCount              Number of columns in the grid.
 * @param defaultEventStyle     Default event style tailwind string.
 * @returns 
 */
export function setEventPositions(
  evDtos: ProcessedEventDTO[],
  cellLaneEvents: Map<number, Map<number, string>>,
  gridRowWidth: number,
  start: TZDate,
  cellCount: number,
  colCount: number,
  defaultEventStyle: EventBarStyle
): EventBarProps[][] {

  // 1. Init the lane event cell map (1-based to match Grid cell numbering)
  cellLaneEvents.clear();
  for (let i = 1; i <= cellCount; i++) {
    cellLaneEvents.set(i, new Map<number, string>());
  }

  // Constants
  const numOfRows = Math.ceil(cellCount / colCount);
  const rows: EventBarProps[][] = Array.from({ length: numOfRows }, () => []);
  const cellWidth = gridRowWidth / colCount;

  // 2. Sort events by start time (Essential for correct lane stacking)
  const sortedEvents = [...evDtos].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Iterate through sorted events
  sortedEvents.forEach((ev) => {

    let cellStartIndex = getCellIndexFromDate(start, ev.start);
    let cellEndIndex = getCellIndexFromDate(start, ev.end);

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

      const evStyle: EventBarStyle = {
        eventHeightStyle: defaultEventStyle.eventHeightStyle,
        defaultEventStyle: defaultEventStyle.defaultEventStyle,
        extraClasses: classes.trim(),
        colour: ev.colour ?? "#525252",
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

export type MonthGridConfig = {
  monthStart: TZDate
  startDate: TZDate;
  endDate: TZDate;
  cellCount: number;
  gridLabel: string;
};

const monthNames = Object.values(MonthEnum)

/**
 * Generates grid configuration for displaying a calendar month.
 * The grid starts on the Monday before (or on) the 1st of the month
 * and ends on the Sunday after (or on) the last day of the month.
 * 
 * newMonth is the first of the
 */
export function getMonthGridConfig(newMonth: TZDate, prevCfg: MonthGridConfig | null): MonthGridConfig | null {

  // skip rerender if not needed
  if (prevCfg != null && newMonth === prevCfg.monthStart) {
    return prevCfg;
  }

  const tz = newMonth.timeZone;
  const year = newMonth.getFullYear();
  const month = newMonth.getMonth();

  // First day of the month
  const firstOfMonth = new TZDate(year, month, 1, tz);
  // Last day of the month
  const lastOfMonth = new TZDate(year, month + 1, 0, tz);

  // Grid starts on Monday before (or on) the 1st
  const startDate = getPreviousMonday(firstOfMonth);

  // Grid ends on Sunday after (or on) the last day
  const lastDayOfWeek = lastOfMonth.getDay();
  const daysUntilSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  const endDate = new TZDate(
    lastOfMonth.getFullYear(),
    lastOfMonth.getMonth(),
    lastOfMonth.getDate() + daysUntilSunday,
    tz
  );

  // Calculate cell count (number of days between start and end, inclusive)
  const msPerDay = 24 * 60 * 60 * 1000;
  const cellCount = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

  const gridLabel = `${monthNames[month]} ${year}`;

  return {
    monthStart: newMonth,
    startDate,
    endDate,
    cellCount,
    gridLabel
  };
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