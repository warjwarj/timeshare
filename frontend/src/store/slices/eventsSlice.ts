import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import type { EventDTO } from '../../types/EventDTO';
import { apiClient } from "../../utils/apiClient";
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';
import { tryParseAxiosErrorMessage, tryParseAxiosMessage } from '../../utils/utils';
import { TZDate } from '@date-fns/tz';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const getEvents = createAsyncThunk(
  'getEvents',
  async ({ start, end }: { start: string, end: string }, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.get("/events/", {
        params: {
          start: start,
          end: end
        },
        signal,
        validateStatus: status => status < 500,
      })

      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't get events", errMsg);
        return rejectWithValue(errMsg);
      }

      return res.data as EventDTO[];
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't get events", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't get events", err);
      return rejectWithValue(err);
    }
  }
);

const updateEvent = createAsyncThunk(
  'updateEvent',
  async (event: EventDTO, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      if (event.iana_timezone && event.start && event.end) {
        event.start = fromZonedTime(event.start, event.iana_timezone).toISOString()
        event.end = fromZonedTime(event.end, event.iana_timezone).toISOString()
      }

      const res = await apiClient.put(
        `/events/${event.uuid}`,
        event,
        { signal, validateStatus: status => status < 500 }
      )
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't update event", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as EventDTO;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't update event", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't update event", err);
      return rejectWithValue(err);
    }
  }
);

const addEvent = createAsyncThunk(
  'addEvent',
  async (event: Omit<EventDTO, 'uuid'>, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      if (event.iana_timezone && event.start && event.end) {
        event.start = fromZonedTime(event.start, event.iana_timezone).toISOString()
        event.end = fromZonedTime(event.end, event.iana_timezone).toISOString()
      }

      const res = await apiClient.post(
        "/events",
        event,
        { signal, validateStatus: status => status < 500 }
      )
      if (res.status !== HttpStatusCode.Created) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't add event", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as EventDTO;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't add event", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't add event", err);
      return rejectWithValue(err);
    }
  }
);

const deleteEvent = createAsyncThunk(
  'deleteEvent',
  async (uuid: string, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.delete(
        `/events/${uuid}`,
        { signal, validateStatus: status => status < 500 }
      )
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't delete event", errMsg);
        return rejectWithValue(errMsg);
      }
      return uuid;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't delete event", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't delete event", err);
      return rejectWithValue(err);
    }
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


// selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events

// function which returns event selectors
export const makeEventSelectors = () => {

  // select all events with start and end dates as date objects
  const selectProcessedEventsAsDate = createSelector(
    [
      selectEvents
    ],
    (events: EventDTO[]): (EventDTO & { uuid: string, start: Date, end: Date, iana_timezone: string })[] => {
      return [...events]
        .map(ev => ({
          ...ev,
          start: ev.start && ev.iana_timezone ? toZonedTime(ev.start, ev.iana_timezone) : null,
          end: ev.end && ev.iana_timezone ? toZonedTime(ev.end, ev.iana_timezone) : null
        }))
        .filter((ev): ev is typeof ev & { uuid: string, start: Date, end: Date, iana_timezone: string } =>
          ev.start !== null && ev.end !== null
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime())
    }
  );

  // select all events with start and end dates as strings
  const selectProcessedEventsAsString = createSelector(
    [
      selectProcessedEventsAsDate
    ],
    (events: (EventDTO & { uuid: string, start: Date, end: Date, iana_timezone: string })[]): (EventDTO & { uuid: string, start: string, end: string, iana_timezone: string })[] => {
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
    (events, date): (EventDTO & { uuid: string, start: Date, end: Date, iana_timezone: string })[] => {
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
    (events, { start, end }): (EventDTO & { uuid: string, start: Date, end: Date, iana_timezone: string })[] => {
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
export { getEvents, updateEvent, addEvent, deleteEvent }

// reducer
export default eventsSlice.reducer;