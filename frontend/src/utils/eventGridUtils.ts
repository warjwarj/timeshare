import type { CalendarEvent } from "../types/CalendarEvent";

const calculateEventPositions = (
  events: CalendarEvent[],
  columns: number,
  daysInMonth: number,
  gridRowWidth: number
): CalendarEvent[][] => {

  // consts
  const numOfRows = Math.ceil(daysInMonth / columns);
  const rows: CalendarEvent[][] = Array.from({ length: numOfRows }, () => []);
  const cellWidth = gridRowWidth / columns;

  // sort the array so start index relates to the event's lane positioning
  // if we want to start positioning events within the cells according to time within day etc this will need more thought
  events.sort((a, b) => a.start - b.start)

  // calc the event starts / ends
  events.forEach((ev) => {
    for (let r = 0; r < numOfRows; r++) {
      const rowStart = r * columns + 1;
      const rowEnd = Math.min(rowStart + columns - 1, daysInMonth);

      if (ev.end >= rowStart && ev.start <= rowEnd) {
        const eventStartInRow = Math.max(ev.start, rowStart);
        const eventEndInRow = Math.min(ev.end, rowEnd);
        const span = eventEndInRow - eventStartInRow + 1;

        const left = (eventStartInRow - rowStart) * cellWidth;
        const width = span * cellWidth;

        let classes = ev.extraClasses.replace(/rounded-[lr]-md/g, '');
        if (eventStartInRow === ev.start) classes += " rounded-l-4xl";
        if (eventEndInRow === ev.end) classes += " rounded-r-4xl";

        // Create completely new object
        const segment: CalendarEvent = {
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

  // thoughts
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

  // hmmm

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

  return rows;
};

export { calculateEventPositions };