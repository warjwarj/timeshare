import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { OurRootState } from '../store';
import { apiClient } from "../../utils/apiClient";
import type { Month } from '../../types/dateTypes';

const getCurrentDate = createAsyncThunk(
  'events/all',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/events/all", {
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      })
      if (res.status != HttpStatusCode.Ok) {
        throw new Error(`Failed to update event, received response other than created: ${res.status}`);
      }
      const data = await res.data
      return data as EventDTO[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

interface AppState {
  currentDate: Date
  selectedMonth: Month
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    
  } as AppState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<{ currentDate: string }>) => {
      state.currentDate = new Date(action.payload.currentDate);
    },
    setSelectedMonth: (state) => {
      state      
    }
  }
})

export const { login, logout } = authSlice.actions;

export const selectToken = (state: OurRootState) => state.auth.token;

export default authSlice.reducer;