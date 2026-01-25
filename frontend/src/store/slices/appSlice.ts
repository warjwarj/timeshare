import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'

import { apiClient } from "../../utils/apiClient";
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';
import { TZDate } from '@date-fns/tz';

const getCurrentDate = createAsyncThunk(
  'common/current-datetime',
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.get("/common/current-datetime", {
        headers: {
          "X-Timezone": "UTC"
        },
        signal,
        validateStatus: status => status < 500
      })      
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = res.data?.["detail"]?.[0]?.["msg"] || "Unknown error";
        toastService.showError("Couldn't get current datetime", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't reach server", err);
      return rejectWithValue(err);
    }
  }
);

interface AppState {
  ianaTimezone: string
  currentDatetime: string
  selectedDate: string
  selectedMonth: string
}

export const appSlice = createSlice({
  name: "app",
  initialState: {
    ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    // ianaTimezone: "America/Los_Angeles"
  } as AppState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<{ monthIsoStr: string }>) => {
      state.selectedMonth = action.payload.monthIsoStr
    },
    setSelectedDate: (state, action: PayloadAction<{ dateIsoStr: string }>) => {
      state.selectedDate = action.payload.dateIsoStr
    },
    setSelectedTimezone: (state, action: PayloadAction<{ newTz: string }>) => {
      state.ianaTimezone = action.payload.newTz
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentDate.fulfilled, (state, action: PayloadAction<{ datetime: string, timezone: string }>) => {
        state.currentDatetime = action.payload.datetime;
        if (!state.selectedDate) {
          state.selectedDate = action.payload.datetime
        }
      })
  }
})

// selectors
export const selectCurrentDatetime = (state: { app: AppState }) => state.app.currentDatetime
export const selectSelectedDate = (state: { app: AppState }) => state.app.selectedDate
export const selectSelectedMonth = (state: { app: AppState }) => state.app.selectedMonth
export const selectSelectedIanaTimezone = (state: { app: AppState }) => state.app.ianaTimezone

// selectors
export const selectCurrentDatetimeAsTzDate = createSelector(
  [selectCurrentDatetime, selectSelectedIanaTimezone],
  (currentDatetime, ianaTimezone) => new TZDate(currentDatetime, ianaTimezone)
)

export const selectSelectedDateAsTzDate = createSelector(
  [selectSelectedDate, selectSelectedIanaTimezone],
  (selectedDate, ianaTimezone) => new TZDate(selectedDate, ianaTimezone)
)

export const selectSelectedMonthAsTzDate = createSelector(
  [selectSelectedMonth, selectSelectedIanaTimezone],
  (selectedMonth, ianaTimezone) => new TZDate(selectedMonth, ianaTimezone)
)

// reducers
export const { setSelectedDate, setSelectedMonth, setSelectedTimezone } = appSlice.actions;

// thunks
export { getCurrentDate };

export default appSlice.reducer;