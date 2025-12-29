import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import type { EventDTO } from '../../types/EventDTO';
import { apiClient } from "../../utils/apiClient";
import { HttpStatusCode } from 'axios';

const getEvents = createAsyncThunk(
  'events/all',
  async ({ start, end }: { start: Date, end: Date }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/events/all", {
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      })
      if (res.status != HttpStatusCode.Ok) {
        return rejectWithValue(`Failed to update event, received response other than ok: ${res.status}`);
      }
      return res.data as EventDTO[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const updateEvent = createAsyncThunk(
  'events/update',
  async (moddedev: EventDTO, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/events/update", moddedev)
      if (res.status != HttpStatusCode.Ok) {
        rejectWithValue(`Failed to retreive events, received response other than ok: ${res.status}`);
      }
      return res.data as EventDTO;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
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
  reducers: { 
    // here we would have optimistic state updates - where we in the frontend update our state immidiately
    // instead of sending the action off to the backend and updating our state after receiving the response.
    // have none currently but may want to add
  },
  extraReducers: (builder) => {
    builder
      // get events
      .addCase(getEvents.pending, (state) => {
        state.error = null;
        state.pending = true;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.pending = false
        state.events = action.payload
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // update events
      .addCase(updateEvent.pending, (state) => {
        state.error = null;
        state.pending = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.pending = false
        state.events.find((ev) => ev.uuid === action.payload.uuid)
        const index = state.events.findIndex(ev => ev.uuid === action.payload.uuid);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      });
    }
});


// selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events
export const selectProcessedEvents = createSelector(
  [selectEvents],
  (events) => [...events]
    .map(ev => ({
      ...ev,
      start: new Date(ev.start),
      end: new Date(ev.end)
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
)

// api calls
export { getEvents, updateEvent }

// reducer
export default eventsSlice.reducer;