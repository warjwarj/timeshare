import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import type { EventDTO } from '../../types/EventDTO';
import { apiClient } from "../../utils/apiClient";
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';

const getEvents = createAsyncThunk(
  'events/getEvents',
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
  'events/update',
  async (modifiedEvent: EventDTO, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        "/events/update",
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
  'events/add',
  async (newEvent: Omit<EventDTO, 'key' | 'uuid'>, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        "/events/add",
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
  'events/delete',
  async (uuid: string, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.delete(
        `/events/delete/${uuid}`,
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

  // select all events, processing dates from strings into date objects
  const selectProcessedEvents = createSelector(
    [selectEvents],
    (events): EventDTO[] =>
      [...events]
        .map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
  );

  // select all events which partially overlap with a given date
  const selectEventsSpanningDate = createSelector(
    [
      selectProcessedEvents,
      (_: unknown, date: Date) => date,
    ],
    (events, date): EventDTO[] => {

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return events.filter(e => e.start <= dayEnd && e.end >= dayStart)
    }
  );

  // select all events which exist between two dates
  // (includes events that start, end, or span entirely across the range)
  const selectEventsBetweenDates = createSelector(
    [
      selectProcessedEvents,
      (_: unknown, start: Date, end: Date) => ({ start, end }),
    ],
    (events, { start, end }): EventDTO[] => {

      const rangeStart = new Date(start);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(end);
      rangeEnd.setHours(23, 59, 59, 999);

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