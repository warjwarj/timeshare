import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import type { EventDTO } from '../../types/EventDTO';
import { apiClient } from "../../utils/apiClient";
import { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';

const getEvents = createAsyncThunk(
  'events/all',
  async ({ start, end }: { start: Date, end: Date }) => {
    try {
      const res = await apiClient.get("/events/all", {
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        validateStatus: status => status <= 500
      })
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't get events", res.data["detail"][0]["msg"])
      }
      return res.data as EventDTO[];
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toastService.showError("Couldn't get events", err.toString())
    }
  }
);

const updateEvent = createAsyncThunk(
  'events/update',
  async (moddedev: EventDTO) => {
    try {
      const res = await apiClient.post(
        "/events/update",
        moddedev,
        { validateStatus: status => status <= 500 }
      )
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't update event", res.data["detail"][0]["msg"])
      }
      return res.data as EventDTO;
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toastService.showError("Couldn't update event", err.toString())
    }
  }
);

const addEvent = createAsyncThunk(
  'events/add',
  async (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => {
    try {
      const res = await apiClient.post(
        "/events/add",
        newEvent,
        { validateStatus: status => status <= 500 }
      )
      if (res.status != HttpStatusCode.Created) {
        toastService.showError("Couldn't add event", res.data["detail"][0]["msg"])
      }
      return res.data as EventDTO;
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toastService.showError("Couldn't add event", err.toString())
    }
  }
);

const deleteEvent = createAsyncThunk(
  'events/delete',
  async (uuid: string) => {
    try {
      const res = await apiClient.delete(
        `/events/delete/${uuid}`,
        { validateStatus: status => status <= 500 }
      )
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't delete event", res.data["detail"][0]["msg"])
      }
      return uuid;
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toastService.showError("Couldn't delete event", err.toString())
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

// factory function to create a selector that returns processed events
export const makeSelectProcessedEvents = () =>
  createSelector(
    [selectEvents],
    (events) =>
      [...events]
        .map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
  );

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

      return events.filter(e => e.start < dayEnd && e.end > dayStart)
    }
  );

  return {
    selectProcessedEvents,
    selectEventsSpanningDate,
  };
};

// api calls
export { getEvents, updateEvent, addEvent, deleteEvent }

// reducer
export default eventsSlice.reducer;