import { TimeSpanEnum, type TimeSpan } from "../types/dateTypes";
import type { EventDTO } from "../types/EventDTO";
import type { EventProps, EventStyle } from "../components/events/Event";

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Day Grid Utilities
  Positioning functions for day view calendar
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

// Configuration for the day grid
interface DayGridConfig {
  selectedDate: Date;              // The day being displayed
  timeStart: number;       // Start hour (e.g., 8 for 8:00 AM)
  timeEnd: number;         // End hour (e.g., 18 for 6:00 PM)
  timeStep: TimeSpan;      // Granularity (Hour, Mins30, etc.)
  snapToStep?: boolean;    // Snap event times to nearest step
  gridHeight: number;      // Total pixel height of the grid
  gridWidth: number;       // Total pixel width of the grid
  defaultEventStyle: EventStyle;
}

// Overlap group - events that share time and must be displayed side-by-side
interface OverlapGroup {
  events: EventDTO[];
  columnAssignments: Map<string, number>; // eventUuid -> column index
  maxColumns: number;
}

// Get TimeSpan duration in minutes
function getTimeSpanInMinutes(timeSpan: TimeSpan): number {
  switch (timeSpan) {
    case TimeSpanEnum.Mins5: return 5;
    case TimeSpanEnum.Mins10: return 10;
    case TimeSpanEnum.Mins15: return 15;
    case TimeSpanEnum.Mins30: return 30;
    case TimeSpanEnum.Hour: return 60;
    case TimeSpanEnum.Day: return 1440;
    default: return 60;
  }
}

// Get minutes since midnight for a given date
function getMinutesSinceMidnight(dt: Date): number {
  return dt.getHours() * 60 + dt.getMinutes();
}

// Filter events that overlap with the given day
function filterEventsForDay(events: EventDTO[], date: Date): EventDTO[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter(ev => {
    // Event overlaps with day if: event.start < dayEnd AND event.end > dayStart
    return ev.start < dayEnd && ev.end > dayStart;
  });
}

// Snap a time to the nearest step
function snapTimeToStep(time: Date, step: TimeSpan): Date {
  const stepMinutes = getTimeSpanInMinutes(step);
  const minutes = getMinutesSinceMidnight(time);
  const snappedMinutes = Math.round(minutes / stepMinutes) * stepMinutes;

  const result = new Date(time);
  result.setHours(Math.floor(snappedMinutes / 60), snappedMinutes % 60, 0, 0);
  return result;
}

// Check if two events overlap in time
function eventsOverlap(ev1: EventDTO, ev2: EventDTO): boolean {
  return ev1.start < ev2.end && ev2.start < ev1.end;
}

// Find groups of overlapping events
function findOverlapGroups(events: EventDTO[]): OverlapGroup[] {
  if (events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  const groups: OverlapGroup[] = [];
  const assignedEvents = new Set<string>();

  for (const event of sortedEvents) {
    if (assignedEvents.has(event.uuid)) continue;

    // Start a new group with this event
    const group: OverlapGroup = {
      events: [event],
      columnAssignments: new Map(),
      maxColumns: 1
    };
    assignedEvents.add(event.uuid);

    // Find all events that overlap with any event in this group
    let groupChanged = true;
    while (groupChanged) {
      groupChanged = false;
      for (const candidate of sortedEvents) {
        if (assignedEvents.has(candidate.uuid)) continue;

        // Check if candidate overlaps with any event in the group
        const overlapsWithGroup = group.events.some(groupEvent =>
          eventsOverlap(groupEvent, candidate)
        );

        if (overlapsWithGroup) {
          group.events.push(candidate);
          assignedEvents.add(candidate.uuid);
          groupChanged = true;
        }
      }
    }

    // Assign columns within the group
    assignColumns(group);
    groups.push(group);
  }

  return groups;
}

// Assign columns to events within an overlap group
function assignColumns(group: OverlapGroup): void {
  // Sort by start time, then by duration (longest first for better visual)
  const sortedEvents = [...group.events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    // Longer events first
    const durationA = a.end.getTime() - a.start.getTime();
    const durationB = b.end.getTime() - b.start.getTime();
    return durationB - durationA;
  });

  // Track which time ranges each column covers
  const columnEndTimes: Date[] = [];

  for (const event of sortedEvents) {
    // Find first column where this event fits (no overlap)
    let assignedColumn = -1;
    for (let col = 0; col < columnEndTimes.length; col++) {
      if (event.start >= columnEndTimes[col]) {
        // This column is free
        assignedColumn = col;
        columnEndTimes[col] = event.end;
        break;
      }
    }

    if (assignedColumn === -1) {
      // Need a new column
      assignedColumn = columnEndTimes.length;
      columnEndTimes.push(event.end);
    }

    group.columnAssignments.set(event.uuid, assignedColumn);
  }

  group.maxColumns = columnEndTimes.length;
}

// Main function: calculate positions for day view events
function setDayEventPositions(
  events: EventDTO[],
  config: DayGridConfig
): EventProps[] {
  const { selectedDate, timeStart, timeEnd, timeStep, snapToStep, gridHeight, gridWidth, defaultEventStyle } = config;

  // Filter events for this day
  const dayEvents = filterEventsForDay(events, selectedDate);
  if (dayEvents.length === 0) return [];

  // Calculate time boundaries
  const dayStart = new Date(selectedDate);
  dayStart.setHours(timeStart, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(timeEnd, 0, 0, 0);
  const totalMinutes = (timeEnd - timeStart) * 60;

  // Find overlap groups
  const overlapGroups = findOverlapGroups(dayEvents);

  const eventPropsArray: EventProps[] = [];

  for (const group of overlapGroups) {
    for (const event of group.events) {
      // Get event times, optionally snapped
      let eventStart = event.start;
      let eventEnd = event.end;

      if (snapToStep) {
        eventStart = snapTimeToStep(eventStart, timeStep);
        eventEnd = snapTimeToStep(eventEnd, timeStep);
      }

      // Clip to visible range
      if (eventStart < dayStart) eventStart = dayStart;
      if (eventEnd > dayEnd) eventEnd = dayEnd;

      // Skip if event is entirely outside visible range
      if (eventStart >= dayEnd || eventEnd <= dayStart) continue;

      // Calculate vertical position (time-based)
      const eventStartMinutes = getMinutesSinceMidnight(eventStart) - (timeStart * 60);
      const eventDurationMinutes = (eventEnd.getTime() - eventStart.getTime()) / 60000;

      // Calculate slot height and offset to align with labels
      const stepMinutes = getTimeSpanInMinutes(timeStep);
      const slotHeight = (stepMinutes / totalMinutes) * gridHeight;
      const halfSlotHeight = slotHeight / 2;

      const top = (eventStartMinutes / totalMinutes) * gridHeight + halfSlotHeight;
      const height = (eventDurationMinutes / totalMinutes) * gridHeight;

      // Calculate horizontal position (column-based for overlaps)
      const column = group.columnAssignments.get(event.uuid) ?? 0;
      const columnWidth = gridWidth / group.maxColumns;
      const left = column * columnWidth;
      const width = columnWidth;

      // Build event style
      const evStyle: EventStyle = {
        eventHeightStyle: String(height),
        defaultEventStyle: defaultEventStyle.defaultEventStyle,
        extraClasses: "absolute rounded",
        colour: event.colour,
        left: left,
        width: width,
        lane: 0, // Not used in day view, but required by EventStyle
        top: top, // Direct top position for day view
      };

      // Generate unique key
      const key = `day-${event.uuid}-${selectedDate.toISOString().split('T')[0]}`;

      eventPropsArray.push({
        key,
        evStyle,
        eventDTO: event
      });
    }
  }

  return eventPropsArray;
}

// Generate time labels for the grid
function generateTimeLabels(timeStart: number, timeEnd: number, timeStep: TimeSpan): string[] {
  const labels: string[] = [];
  const stepMinutes = getTimeSpanInMinutes(timeStep);
  const totalMinutes = (timeEnd - timeStart) * 60;

  for (let mins = 0; mins < totalMinutes; mins += stepMinutes) {
    const totalMins = timeStart * 60 + mins;
    const hour = Math.floor(totalMins / 60) % 24;
    const minute = totalMins % 60;
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'am' : 'pm';
    const m = minute.toString().padStart(2, '0');
    labels.push(`${h}:${m}${ampm}`);
  }

  return labels;
}

// Calculate total number of slots
function calculateTotalSlots(timeStart: number, timeEnd: number, timeStep: TimeSpan): number {
  const totalMinutes = (timeEnd - timeStart) * 60;
  const stepMinutes = getTimeSpanInMinutes(timeStep);
  return Math.ceil(totalMinutes / stepMinutes);
}

export {
  setDayEventPositions,
  filterEventsForDay,
  findOverlapGroups,
  getTimeSpanInMinutes,
  snapTimeToStep,
  generateTimeLabels,
  calculateTotalSlots,
  getMinutesSinceMidnight
};

export type { DayGridConfig, OverlapGroup };
