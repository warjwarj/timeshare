import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { TZDate } from '@date-fns/tz';
import axios, { HttpStatusCode } from 'axios';
import { toastService } from '../../toastService';
import { type AvailabilityRuleDTO, type ProcessedAvailabilityRuleDTO } from '../../types/AvailabilityRuleDTO';
import type { DayAvailabilityDTO, ProcessedDayAvailabilityDTO } from '../../types/DayAvailabilityDTO';
import { apiClient } from "../../utils/apiClient";
import { definitelyUtcButNaiveIsoStrToTzDate, tryParseAxiosErrorMessage, tryParseAxiosMessage, tzdateToUtcString } from '../../utils/utils';

const getDayAvailabilitys = createAsyncThunk(
  'getDayAvailabilitys',
  async ({ iana_timezone, start_datetime, end_datetime }: { iana_timezone: string, start_datetime: string, end_datetime: string }, { signal, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/availability/getAvailability", {
        iana_timezone,
        start_datetime,
        end_datetime
      }, {
        signal,
        validateStatus: status => status < 500,
      });
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res);
        toastService.showError("Couldn't get availability", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data as DayAvailabilityDTO[];
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error);
        toastService.showError("Couldn't get availability", errMsg);
        return rejectWithValue(errMsg);
      }
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't get availability", err);
      return rejectWithValue(err);
    }
  }
);

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
  async (rule: Omit<ProcessedAvailabilityRuleDTO, "uuid">, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      const normalisedRuleDTO: Omit<AvailabilityRuleDTO, 'uuid'> = {
        ...rule,
        start_datetime: rule.start_datetime?.toISOString(),
        end_datetime: rule.end_datetime?.toISOString(),
      }
      const res = await apiClient.post("/availability", normalisedRuleDTO, {
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
  async (rule: ProcessedAvailabilityRuleDTO, { signal, rejectWithValue }) => {
    try {
      // format to utc+0 time on outbound
      const normalisedRuleDTO: AvailabilityRuleDTO = {
        ...rule,
        start_datetime: rule.start_datetime ? tzdateToUtcString(rule.start_datetime) : undefined,
        end_datetime: rule.end_datetime ? tzdateToUtcString(rule.end_datetime) : undefined
      }
      const res = await apiClient.put(`/availability/${rule.uuid}`, normalisedRuleDTO, {
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
  dayAvailabilities: DayAvailabilityDTO[];
  pending: boolean;
  error: string | null;
}

export const availabilitySlice = createSlice({
  name: "availability",
  initialState: {
    availabilityRules: [],
    dayAvailabilities: [],
    pending: false,
    error: null
  } as AvailabilityState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET ALL RULES
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
      // GET SINGLE RULE
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
      // CREATE RULE
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
      // UPDATE RULE
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
      // DELETE RULE
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
      })
      // GET DAY AVAILABILITYS
      .addCase(getDayAvailabilitys.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(getDayAvailabilitys.fulfilled, (state, action) => {
        state.pending = false;
        if (!action.payload) return;
        state.dayAvailabilities = action.payload;
      })
      .addCase(getDayAvailabilitys.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload as string;
      });
  }
});

// internal selector
const selectAvailabilityRules = (state: { availability: AvailabilityState }) => state.availability.availabilityRules;
const selectDayAvailabilitys = (state: { availability: AvailabilityState }) => state.availability.dayAvailabilities;

// function which returns availability rule selectors
export const makeAvailabilityRuleSelectors = () => {

  // select all rules with start/end datetimes as Date objects
  const selectProcessedRulesAsDate = createSelector(
    [selectAvailabilityRules],
    (rules): ProcessedAvailabilityRuleDTO[] => {
      return rules.map(r => ({
        ...r,
        start_datetime: r.start_datetime ? definitelyUtcButNaiveIsoStrToTzDate(r.start_datetime, r.iana_timezone) : undefined,
        end_datetime: r.end_datetime ? definitelyUtcButNaiveIsoStrToTzDate(r.end_datetime, r.iana_timezone) : undefined,
      }));
    }
  );

  return { selectProcessedRulesAsDate };
};

// function which returns availability rule selectors
export const makeDayAvailabilitySelectors = () => {

  // when we send the request to the backend for day availabilities
  // we specify the timezone of the req + res dates.
  // this should mean that the day availabilities returned are in our timezone. 
  const selectProcessedDayAvailabilitys = createSelector(
    [
      selectDayAvailabilitys,
    ],
    (dayAvailabilitys: DayAvailabilityDTO[]): ProcessedDayAvailabilityDTO[] => {
      return [...dayAvailabilitys]
        .map(dav => ({
          ...dav,
          date: new TZDate(dav.date, dav.iana_timezone)
        }))
    },
  );

  // day availabilities between dates
  const selectProcessedDayAvailabilitysBetweenDates = createSelector(
    [
      selectProcessedDayAvailabilitys,
      (_: unknown, start: TZDate, end: TZDate) => ({ start, end }),
    ],
    (dayAvailabilitys, { start, end }): ProcessedDayAvailabilityDTO[] => {
      const tz = start.timeZone;
      const rangeStart = new TZDate(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0, tz);
      const rangeEnd = new TZDate(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999, tz);
      return dayAvailabilitys
        .filter(dav => dav.date >= rangeStart && dav.date <= rangeEnd)
        .sort((a, b) => a.date.getUTCDate() - b.date.getUTCDate())
    },
  );

  return {
    selectProcessedDayAvailabilitys,
    selectProcessedDayAvailabilitysBetweenDates
  };
};

// thunks
export {
  createAvailabilityRule, deleteAvailabilityRule, getAvailabilityRule, getAvailabilityRules, getDayAvailabilitys, updateAvailabilityRule
};

export default availabilitySlice.reducer;
