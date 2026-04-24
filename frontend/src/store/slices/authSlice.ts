import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apiClient } from "../../utils/apiClient";
import { toastService } from '../../toastService';
import axios, { HttpStatusCode } from 'axios';
import { tryParseAxiosErrorMessage, tryParseAxiosMessage } from '../../utils/utils';
import type { UserDTO } from '../../types/UserDTO';

const login = createAsyncThunk(
  'auth/login',
  async (
    { name, email, password }: { name: string | null, email: string, password: string },
    { signal, rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/auth/login", {
        name,
        email,
        password
      },
        { signal, validateStatus: status => status < 500 }
      );
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res)
        toastService.showError("Couldn't login", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data;
    } catch (error: unknown) {
      // don't show message if cancel
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      // try and parse the error from server
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error)
        toastService.showError("Couldn't login", errMsg);
        return rejectWithValue(errMsg);
      }
      // fallback to exception message or unknown
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't login", err);
      return rejectWithValue(err);
    }
  }
);

const register = createAsyncThunk(
  'auth/register',
  async (
    { org_name, name, email, password }: { org_name: string, name: string | null, email: string, password: string },
    { signal, rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/auth/register", {
        org_name,
        name,
        email,
        password
      },
        { signal, validateStatus: status => status < 500 }
      );
      if (res.status !== HttpStatusCode.Created) {
        const errMsg = tryParseAxiosMessage(res)
        toastService.showError("Couldn't register", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data;
    } catch (error: unknown) {
      // cancel error, don't show message
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      // try and parse the error
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error)
        toastService.showError("Couldn't register", errMsg);
        return rejectWithValue(errMsg);
      }
      // fallback to exception message or unknown
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't register", err);
      return rejectWithValue(err);
    }
  }
);

const updateAccount = createAsyncThunk(
  'auth/updateAccount',
  async (
    { name, email, colour }: { name: string | null, email: string, colour: string },
    { signal, rejectWithValue }
  ) => {
    try {
      const res = await apiClient.put("/auth/account", {
        name,
        email,
        colour
      },
        { signal, validateStatus: status => status < 500 }
      );
      if (res.status !== HttpStatusCode.Ok) {
        const errMsg = tryParseAxiosMessage(res)
        toastService.showError("Couldn't update account", errMsg);
        return rejectWithValue(errMsg);
      }
      return res.data;
    } catch (error: unknown) {
      // cancel error, don't show message
      if (axios.isCancel(error)) {
        return rejectWithValue('Request cancelled');
      }
      // try and parse the error
      if (axios.isAxiosError(error)) {
        const errMsg = tryParseAxiosErrorMessage(error)
        toastService.showError("Couldn't register", errMsg);
        return rejectWithValue(errMsg);
      }
      // fallback to exception message or unknown
      const err = error instanceof Error ? error.message : 'Unknown error';
      toastService.showError("Couldn't register", err);
      return rejectWithValue(err);
    }
  }
);

interface Auth {
  user: UserDTO;
  token: string
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...JSON.parse(localStorage.getItem("auth_state") || '{"token":"", "user": {"uuid": "","name":"","email":"","colour":""}}')
  } as Auth,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth_state");
      state.token = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { success, uuid, name, email, colour, access_token } = action.payload;
        if (!success || !access_token) {
          toastService.showError("Couldn't log in", action.payload.detail as string)
          return;
        }
        state.token = access_token
        state.user = { uuid, name, email, colour } as UserDTO;
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const { success, name, email, colour } = action.payload;
        if (!success) {
          toastService.showError("Couldn't update account", action.payload.detail as string)
          return;
        }
        state.user = { ...state.user, name, email, colour } as UserDTO;
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
        toastService.showSuccess("Account updated successfully")
      })
  }
})

export const { logout } = authSlice.actions;

export { login, register, updateAccount }

export const selectToken = (state: { auth: Auth }) => state.auth.token;
export const selectLoggedInUser = (state: { auth: Auth }) => state.auth.user;

export default authSlice.reducer;