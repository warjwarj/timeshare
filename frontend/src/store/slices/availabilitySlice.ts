import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import { apiClient } from "../../utils/apiClient";
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';
import { tryParseAxiosErrorMessage, tryParseAxiosMessage } from '../../utils/utils';
import { type AvailabilityRuleDTO } from '../../types/AvailabilityRuleDTO';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const getAvailabilityRules = createAsyncThunk(
  'getAvailabilityRules',
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.get("/availability", {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't get availability rules", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as AvailabilityRuleDTO[];
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't get availability rules", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't get availability rules", err);
      return rejectWithValue(err);
    }
  }
);

const getAvailabilityRule = createAsyncThunk(
  'getAvailabilityRule',
  async (uuid: string, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/availability/${uuid}`, {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't get availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as AvailabilityRuleDTO;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't get availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't get availability rule", err);
      return rejectWithValue(err);
    }
  }
);

const createAvailabilityRule = createAsyncThunk(
  'createAvailabilityRule',
  async (rule: AvailabilityRuleDTO, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      if (rule.iana_timezone && rule.start_datetime && rule.end_datetime) {
        rule.start_datetime = fromZonedTime(rule.start_datetime, rule.iana_timezone).toISOString()
        rule.end_datetime = fromZonedTime(rule.end_datetime, rule.iana_timezone).toISOString()
      }

      const res = await apiClient.post("/availability", rule, {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Created) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't create availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as AvailabilityRuleDTO;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't create availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't create availability rule", err);
      return rejectWithValue(err);
    }
  }
);

const updateAvailabilityRule = createAsyncThunk(
  'updateAvailabilityRule',
  async (rule: AvailabilityRuleDTO, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      if (rule.iana_timezone && rule.start_datetime && rule.end_datetime) {
        rule.start_datetime = fromZonedTime(rule.start_datetime, rule.iana_timezone).toISOString()
        rule.end_datetime = fromZonedTime(rule.end_datetime, rule.iana_timezone).toISOString()
      }

      const res = await apiClient.put(
        `/availability/${rule.uuid}`,
        rule, {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't update availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as AvailabilityRuleDTO;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't update availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't update availability rule", err);
      return rejectWithValue(err);
    }
  }
);

const deleteAvailabilityRule = createAsyncThunk(
  'deleteAvailabilityRule',
  async (uuid: string, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/availability/${uuid}`, {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't delete availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      return uuid;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't delete availability rule", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't delete availability rule", err);
      return rejectWithValue(err);
    }
  }
);

interface AvailabilityState {
  availabilityRules: AvailabilityRuleDTO[];
  pending: boolean;
  error: string | null;
}

export const availabilitySlice = createSlice({
  name: "availability",
  initialState: {
    availabilityRules: [],
    pending: false,
    error: null
  } as AvailabilityState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get all rules
      .addCase(getAvailabilityRules.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(getAvailabilityRules.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.pending = false;
        state.availabilityRules = action.payload;
      })
      .addCase(getAvailabilityRules.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // get single rule
      .addCase(getAvailabilityRule.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(getAvailabilityRule.fulfilled, (state, action) => {
        state.pending = false;
        if (!action.payload) return;
        const index = state.availabilityRules.findIndex(r => r.uuid === action.payload.uuid);
        if (index !== -1) {
          state.availabilityRules[index] = action.payload;
        } else {
          state.availabilityRules.push(action.payload);
        }
      })
      .addCase(getAvailabilityRule.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // create rule
      .addCase(createAvailabilityRule.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(createAvailabilityRule.fulfilled, (state, action) => {
        state.pending = false;
        if (!action.payload) return;
        state.availabilityRules.push(action.payload);
      })
      .addCase(createAvailabilityRule.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // update rule
      .addCase(updateAvailabilityRule.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(updateAvailabilityRule.fulfilled, (state, action) => {
        state.pending = false;
        if (!action.payload) return;
        const index = state.availabilityRules.findIndex(r => r.uuid === action.payload.uuid);
        if (index !== -1) {
          state.availabilityRules[index] = action.payload;
        }
      })
      .addCase(updateAvailabilityRule.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      })
      // delete rule
      .addCase(deleteAvailabilityRule.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(deleteAvailabilityRule.fulfilled, (state, action) => {
        state.pending = false;
        if (!action.payload) return;
        state.availabilityRules = state.availabilityRules.filter(r => r.uuid !== action.payload);
      })
      .addCase(deleteAvailabilityRule.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      });
  }
});

// internal selector
const selectAvailabilityRules = (state: { availability: AvailabilityState }) => state.availability.availabilityRules;

// export selector for processed availability rules
export const selectProcessedAvailabilityRules = createSelector(
  [
    selectAvailabilityRules,
  ],
  (rules): AvailabilityRuleDTO[] => {
    return rules.map(r => ({
      ...r,
      start_datetime: r.start_datetime && r.iana_timezone ? toZonedTime(r.start_datetime, r.iana_timezone).toISOString() : null,
      end_datetime: r.end_datetime && r.iana_timezone ? toZonedTime(r.end_datetime, r.iana_timezone).toISOString() : null
    }))
  }
);

// // export selector for processed availability rules
// export const selectProcessedAvailabilityRulesAsDate = createSelector(
//   [
//     selectAvailabilityRules,
//   ],
//   (rules): AvailabilityRuleDTO[] => {
//     return rules.map(r => ({
//       ...r,
//       start_datetime: r.start_datetime && r.iana_timezone ? toZonedTime(r.start_datetime, r.iana_timezone) : null,
//       end_datetime: r.end_datetime && r.iana_timezone ? toZonedTime(r.end_datetime, r.iana_timezone) : null
//     }))
//   }
// );

// thunks
export {
  getAvailabilityRules,
  getAvailabilityRule,
  createAvailabilityRule,
  updateAvailabilityRule,
  deleteAvailabilityRule
};

export default availabilitySlice.reducer;
