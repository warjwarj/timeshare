import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'

import { apiClient } from "../../utils/apiClient";
import type { Month } from '../../types/dateTypes';
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
  selectedMonth: Month
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {

  } as AppState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<{ month: Month }>) => {
      state.selectedMonth = action.payload.month
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentDate.fulfilled, (state, action: PayloadAction<{ datetime: string, timezone: string }>) => {
        state.currentDatetime = action.payload.datetime;
      })
  }
})

export const selectCurrentDatetime = (state: { app: AppState }) => state.app.currentDatetime

export { getCurrentDate }

export default authSlice.reducer;