import { TZDate } from "@date-fns/tz";
import { type TimeSpan, WeekDayEnum, MonthEnum } from "../types/dateTypes";
import type { ProcessedEventDTO } from "../types/EventDTO";
import type { EventBarProps, EventBarStyle } from "../components/calendar/EventBar";
import { getTimeSpanInMinutes } from "./utils";

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Day Grid Utilities
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

export type DayGridConfig = {
  selectedDate: TZDate;
  timeStart: number;
  timeEnd: number;
  timeStep: TimeSpan;
  totalSlots: number;
  timeLabels: string[];
  gridLabel: string;
};

const weekdayNames = Object.values(WeekDayEnum);
const monthNames = Object.values(MonthEnum);

/**
 * Generates grid configuration for displaying a day view.
 */
export function getDayGridConfig(
  selectedDate: TZDate,
  timeStart: number,
  timeEnd: number,
  timeStep: TimeSpan,
  prevCfg: DayGridConfig | null
): DayGridConfig | null {
  // Skip rerender if not needed
  if (
    prevCfg != null &&
    selectedDate.getTime() === prevCfg.selectedDate.getTime() &&
    timeStart === prevCfg.timeStart &&
    timeEnd === prevCfg.timeEnd &&
    timeStep === prevCfg.timeStep
  ) {
    return prevCfg;
  }

  const stepMinutes = getTimeSpanInMinutes(timeStep);
  const totalMinutes = (timeEnd - timeStart) * 60;
  const totalSlots = Math.ceil(totalMinutes / stepMinutes);

  // Generate time labels
  const timeLabels: string[] = [];
  for (let mins = 0; mins < totalMinutes; mins += stepMinutes) {
    const totalMins = timeStart * 60 + mins;
    const hour = Math.floor(totalMins / 60) % 24;
    const minute = totalMins % 60;
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'am' : 'pm';
    const m = minute.toString().padStart(2, '0');
    timeLabels.push(`${h}:${m}${ampm}`);
  }

  // Generate grid label
  const dayIndex = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
  const gridLabel = `${weekdayNames[dayIndex]}, ${monthNames[selectedDate.getMonth()].substring(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  return {
    selectedDate,
    timeStart,
    timeEnd,
    timeStep,
    totalSlots,
    timeLabels,
    gridLabel,
  };
}

// Get minutes since midnight for a given date
function getMinutesSinceMidnight(dt: Date): number {
  return dt.getHours() * 60 + dt.getMinutes();
}

// Check if two events overlap in time
function eventsOverlap(ev1: ProcessedEventDTO, ev2: ProcessedEventDTO): boolean {
  return ev1.start < ev2.end && ev2.start < ev1.end;
}

type OverlapGroup = {
  events: ProcessedEventDTO[];
  columnAssignments: Map<string, number>;
  maxColumns: number;
};

// Assign columns to events within an overlap group
function assignColumns(group: OverlapGroup): void {
  const sortedEvents = [...group.events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime());
  });

  const columnEndTimes: Date[] = [];

  for (const event of sortedEvents) {
    let assignedColumn = -1;
    for (let col = 0; col < columnEndTimes.length; col++) {
      if (event.start >= columnEndTimes[col]) {
        assignedColumn = col;
        columnEndTimes[col] = event.end;
        break;
      }
    }

    if (assignedColumn === -1) {
      assignedColumn = columnEndTimes.length;
      columnEndTimes.push(event.end);
    }

    group.columnAssignments.set(event.uuid, assignedColumn);
  }

  group.maxColumns = columnEndTimes.length;
}

// Find groups of overlapping events
function findOverlapGroups(events: ProcessedEventDTO[]): OverlapGroup[] {
  if (events.length === 0) return [];

  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const groups: OverlapGroup[] = [];
  const assignedEvents = new Set<string>();

  for (const event of sortedEvents) {
    if (assignedEvents.has(event.uuid)) continue;

    const group: OverlapGroup = {
      events: [event],
      columnAssignments: new Map(),
      maxColumns: 1
    };
    assignedEvents.add(event.uuid);

    let groupChanged = true;
    while (groupChanged) {
      groupChanged = false;
      for (const candidate of sortedEvents) {
        if (assignedEvents.has(candidate.uuid)) continue;

        if (group.events.some(groupEvent => eventsOverlap(groupEvent, candidate))) {
          group.events.push(candidate);
          assignedEvents.add(candidate.uuid);
          groupChanged = true;
        }
      }
    }

    assignColumns(group);
    groups.push(group);
  }

  return groups;
}

/**
 * Calculate positions for day view events.
 */
export function setDayEventPositions(
  events: ProcessedEventDTO[],
  config: DayGridConfig,
  gridHeight: number,
  gridWidth: number,
  defaultEventStyle: EventBarStyle
): EventBarProps[] {
  const { selectedDate, timeStart, timeEnd, timeStep } = config;

  if (events.length === 0) return [];

  const tz = selectedDate.timeZone;
  const dayStart = new TZDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), timeStart, 0, 0, 0, tz);
  const dayEnd = new TZDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), timeEnd, 0, 0, 0, tz);
  const totalMinutes = (timeEnd - timeStart) * 60;
  const stepMinutes = getTimeSpanInMinutes(timeStep);
  const slotHeight = (stepMinutes / totalMinutes) * gridHeight;
  const halfSlotHeight = slotHeight / 2;

  const overlapGroups = findOverlapGroups(events);
  const eventPropsArray: EventBarProps[] = [];

  for (const group of overlapGroups) {
    for (const event of group.events) {
      let eventStart: Date = event.start;
      let eventEnd: Date = event.end;

      // Clip to visible range
      if (eventStart < dayStart) eventStart = dayStart;
      if (eventEnd > dayEnd) eventEnd = dayEnd;

      // Skip if event is entirely outside visible range
      if (eventStart >= dayEnd || eventEnd <= dayStart) continue;

      const eventStartMinutes = getMinutesSinceMidnight(eventStart) - (timeStart * 60);
      const eventDurationMinutes = (eventEnd.getTime() - eventStart.getTime()) / 60000;

      const top = (eventStartMinutes / totalMinutes) * gridHeight + halfSlotHeight;
      const height = (eventDurationMinutes / totalMinutes) * gridHeight;

      const column = group.columnAssignments.get(event.uuid) ?? 0;
      const columnWidth = gridWidth / group.maxColumns;
      const left = column * columnWidth;

      const evStyle: EventBarStyle = {
        eventHeightStyle: String(height),
        defaultEventStyle: defaultEventStyle.defaultEventStyle,
        extraClasses: "absolute rounded",
        colour: event.colour,
        left: left,
        width: columnWidth,
        lane: 0,
        top: top,
      };

      eventPropsArray.push({
        key: `day-${event.uuid}-${selectedDate.toISOString().split('T')[0]}`,
        evStyle,
        eventDTO: event
      });
    }
  }

  return eventPropsArray;
}
