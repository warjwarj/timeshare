import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import type { EventDTO } from '../../types/EventDTO';
import { apiClient } from "../../utils/apiClient";
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';
import { TZDate } from '@date-fns/tz';
import { getUserTimezone } from '../../utils/utils';

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
        const errorMsg = res.data?.["detail"]?.[0]?.["msg"] || "Unknown error";
        toastService.showError("Couldn't get events", errorMsg);
        return rejectWithValue(errorMsg);
      }
      
      return res.data as EventDTO[];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't get events", err);
      return rejectWithValue(err);
    }
  }
);

const updateEvent = createAsyncThunk(
  'updateEvent',
  async (modifiedEvent: EventDTO, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/events/${modifiedEvent.uuid}`,
        modifiedEvent,
        { signal, validateStatus: status => status < 500 }
      )
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = res.data?.["detail"]?.[0]?.["msg"] || "Unknown error";
        toastService.showError("Couldn't update event", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as EventDTO;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't update event", err);
      return rejectWithValue(err);
    }
  }
);

const addEvent = createAsyncThunk(
  'addEvent',
  async (newEvent: Omit<EventDTO, 'key' | 'uuid'>, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        "/events",
        newEvent,
        { signal, validateStatus: status => status < 500 }
      )
      if (res.status !== HttpStatusCode.Created) {
        const errMsg = res.data?.["detail"]?.[0]?.["msg"] || "Unknown error";
        toastService.showError("Couldn't add event", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as EventDTO;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
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
        const errMsg = res.data?.["detail"]?.[0]?.["msg"] || "Unknown error";
        toastService.showError("Couldn't delete event", errMsg);
        return rejectWithValue(errMsg);
      }
      return uuid;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
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

  // select all events, processing dates from strings into TZDate objects
  const selectProcessedEvents = createSelector(
    [selectEvents],
    (events): EventDTO[] => {
      const tz = getUserTimezone();
      return [...events]
        .map(ev => ({
          ...ev,
          start: new TZDate(ev.start as unknown as string, tz),
          end: new TZDate(ev.end as unknown as string, tz),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    }
  );

  // select all events which partially overlap with a given date
  const selectEventsSpanningDate = createSelector(
    [
      selectProcessedEvents,
      (_: unknown, date: TZDate) => date,
    ],
    (events, date): EventDTO[] => {
      const tz = date.timeZone;
      const dayStart = new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0, tz);
      const dayEnd = new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999, tz);

      return events.filter(e => e.start <= dayEnd && e.end >= dayStart)
    }
  );

  // select all events which exist between two dates
  // (includes events that start, end, or span entirely across the range)
  const selectEventsBetweenDates = createSelector(
    [
      selectProcessedEvents,
      (_: unknown, start: TZDate, end: TZDate) => ({ start, end }),
    ],
    (events, { start, end }): EventDTO[] => {
      const tz = start.timeZone;
      const rangeStart = new TZDate(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0, tz);
      const rangeEnd = new TZDate(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999, tz);

      return events.filter(e => e.start <= rangeEnd && e.end >= rangeStart)
    }
  );

  return {
    selectProcessedEvents,
    selectEventsSpanningDate,
    selectEventsBetweenDates
  };
};

// api calls
export { getEvents, updateEvent, addEvent, deleteEvent }

// reducer
export default eventsSlice.reducer;