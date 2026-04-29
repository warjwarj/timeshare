import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { TZDate } from '@date-fns/tz';
import addEventAction from '../../actions/events/addEventAction';
import deleteEventAction from '../../actions/events/deleteEventAction';
import getEventsAction from '../../actions/events/getEventsAction';
import updateEventAction from '../../actions/events/updateEventAction';
import { toastService } from '../../toastService';
import type { EventDTO, ProcessedEventDTO } from '../../types/EventDTO';
import { definitelyUtcButNaiveIsoStrToTzDate, tzdateToUtcString } from '../../utils/utils';

const getEvents = createAsyncThunk(
  'getEvents',
  async ({ start, end }: { start: string, end: string }, { signal, rejectWithValue }) => {
    const errMsg = "Couldn't get events"
    const res = await getEventsAction({ start, end }, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

const addEvent = createAsyncThunk(
  'addEvent',
  async (event: Omit<ProcessedEventDTO, "uuid">, { signal, rejectWithValue }) => {
    const normalisedEventDTO: Omit<EventDTO, 'uuid'> = {
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    }
    const errMsg = "Couldn't add event"
    const res = await addEventAction(normalisedEventDTO, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

const updateEvent = createAsyncThunk(
  'updateEvent',
  async (event: ProcessedEventDTO, { signal, rejectWithValue }) => {
    const normalisedEventDTO: EventDTO = {
      ...event,
      start: tzdateToUtcString(event.start),
      end: tzdateToUtcString(event.end)
    }
    const errMsg = "Couldn't update event"
    const res = await updateEventAction(normalisedEventDTO, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

const deleteEvent = createAsyncThunk(
  'deleteEvent',
  async (uuid: string, { signal, rejectWithValue }) => {
    const errMsg = "Couldn't delete event"
    const res = await deleteEventAction(uuid, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return uuid;
  }
);

// Events state object
interface EventsState {
  events: EventDTO[];
  pending: boolean;
  error: string | null;
}

// slice for handling event state
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    pending: false,
    error: null
  } as EventsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get events
      .addCase(getEvents.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.pending = false
        state.events = action.payload
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // update events
      .addCase(updateEvent.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.pending = false;
        const payload = action.payload;
        if (!payload) return;
        const index = state.events.findIndex(
          ev => ev.uuid === payload.uuid
        );
        if (index !== -1) {
          state.events[index] = payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // add event
      .addCase(addEvent.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.pending = false;
        const payload = action.payload;
        if (!payload) return;
        state.events.push(payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // delete event
      .addCase(deleteEvent.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.pending = false;
        const uuid = action.payload;
        if (!uuid) return;
        state.events = state.events.filter(ev => ev.uuid !== uuid);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      });
  }
});


export const selectEvents = (state: { events: EventsState }) => state.events.events

/*
  An input selector returned a different result when passed same arguments.
  This means your output selector will likely run more frequently than intended.
  Avoid returning a new reference inside your input selector, e.g.`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`

  ^^^ This is caused by our first memoised selector below mapping the events array.
  However I think this is necessary since we need to make the events timezone aware.
  Does this mean we shouldn't bother memoising the selector?
*/

export const makeEventSelectors = () => {

  // select all events with start and end dates as date objects
  const selectProcessedEventsAsDate = createSelector(
    [
      selectEvents
    ],
    (events: EventDTO[]): ProcessedEventDTO[] => {
      return [...events]
        .map(ev => ({
          ...ev,
          start: definitelyUtcButNaiveIsoStrToTzDate(ev.start, ev.iana_timezone),
          end: definitelyUtcButNaiveIsoStrToTzDate(ev.end, ev.iana_timezone),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
    }
  );

  // select all events with start and end dates as strings
  const selectProcessedEventsAsString = createSelector(
    [
      selectProcessedEventsAsDate
    ],
    (events: ProcessedEventDTO[]): EventDTO[] => {
      return [...events]
        .map(ev => ({
          ...ev,
          start: ev.start.toISOString(),
          end: ev.end.toISOString()
        }))
    }
  );

  // select all events which partially overlap with a given date
  const selectEventsSpanningDate = createSelector(
    [
      selectProcessedEventsAsDate,
      (_: unknown, date: TZDate) => date,
    ],
    (events, date): ProcessedEventDTO[] => {
      const tz = date.timeZone;
      const dayStart = new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0, tz);
      const dayEnd = new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999, tz);

      return events.filter(e => e.start && e.start <= dayEnd && e.end && e.end >= dayStart)
    }
  );

  // select all events which exist between two dates
  // (includes events that start, end, or span entirely across the range)
  const selectEventsBetweenDates = createSelector(
    [
      selectProcessedEventsAsDate,
      (_: unknown, start: TZDate, end: TZDate) => ({ start, end }),
    ],
    (events, { start, end }): ProcessedEventDTO[] => {
      const tz = start.timeZone;
      const rangeStart = new TZDate(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0, tz);
      const rangeEnd = new TZDate(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999, tz);

      return events.filter(e => e.start && e.start <= rangeEnd && e.end && e.end >= rangeStart)
    }
  );

  return {
    selectProcessedEventsAsDate,
    selectProcessedEventsAsString,
    selectEventsSpanningDate,
    selectEventsBetweenDates
  };
};

// api calls
export { addEvent, deleteEvent, getEvents, updateEvent };

// reducer
export default eventsSlice.reducer;
