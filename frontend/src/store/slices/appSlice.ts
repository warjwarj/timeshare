import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'

import { apiClient } from "../../utils/apiClient";
import { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';

const getCurrentDate = createAsyncThunk(
  'common/current-datetime',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/common/current-datetime", {
        headers: {
          "X-Timezone": "UTC"
        },
        validateStatus: status => status <= 500
      })
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't get current datetime", res.data["detail"][0]["msg"])
      }
      return res.data
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toastService.showError("Couldn't reach server", err)
      return rejectWithValue("Couldn't reach server" + err);
    }
  }
);

interface AppState {
  currentDatetime: string
  selectedDate: string
  selectedMonth: string
}

export const appSlice = createSlice({
  name: "app",
  initialState: {} as AppState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<{ monthIsoStr: string }>) => {
      state.selectedMonth = action.payload.monthIsoStr
    },
    setSelectedDate: (state, action: PayloadAction<{ dateIsoStr: string }>) => {
      state.selectedDate = action.payload.dateIsoStr
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

// selectors
export const selectCurrentDatetimeAsDate = createSelector(
  [selectCurrentDatetime],
  (currentDatetime) => new Date(currentDatetime)
)

export const selectSelectedDateAsDate = createSelector(
  [selectSelectedDate],
  (selectedDate) => new Date(selectedDate)
)

export const selectSelectedMonthAsDate = createSelector(
  [selectSelectedMonth],
  (selectedMonth) => new Date(selectedMonth)
)

// reducers
export const { setSelectedDate, setSelectedMonth } = appSlice.actions;

// thunks
export { getCurrentDate };

export default appSlice.reducer;