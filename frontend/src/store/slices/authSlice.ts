import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStrErrorMessage } from '../../utils/utils'

import { apiClient } from "../../utils/apiClient";
import { toastService } from '../../toastService';
import { HttpStatusCode } from 'axios';

const login = createAsyncThunk(
  'auth/login',
  async (
    { name, email, password, role }: { name: string, email: string, password: string, role: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(
        "/auth/login", {
        name,
        email,
        password,
        role
      },
        { validateStatus: status => status <= 500 }
      );
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't login", res.data["detail"][0]["msg"])
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(getStrErrorMessage(error));
    }
  }
);

const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, role }: { name: string, email: string, password: string, role: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/auth/register", {
        name,
        email,
        password,
        role
      },
        { validateStatus: status => status <= 500 }
      );
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't register", res.data["detail"][0]["msg"])
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(getStrErrorMessage(error));
    }
  }
);

const updateAccount = createAsyncThunk(
  'auth/updateAccount',
  async (
    { name, email }: { name?: string, email?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.put("/auth/account", {
        name,
        email
      },
        { validateStatus: status => status <= 500 }
      );
      if (res.status != HttpStatusCode.Ok) {
        toastService.showError("Couldn't update account", res.data["detail"][0]["msg"])
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(getStrErrorMessage(error));
    }
  }
);

interface Auth {
  name: string
  email: string
  token: string
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...JSON.parse(localStorage.getItem("auth_state") || '{"name":"","email":"","token":""}')
  } as Auth,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth_state");
      state.token = state.email = state.name = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { success, name, email, access_token } = action.payload;
        if (!success || !name || !email || !access_token) {
          toastService.showError("Couldn't log in", action.payload.detail as string)
          return;
        }
        state.token = access_token
        state.name = name
        state.email = email
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const { success, name, email } = action.payload;
        if (!success) {
          toastService.showError("Couldn't update account", action.payload.detail as string)
          return;
        }
        state.name = name
        state.email = email
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
        toastService.showSuccess("Account updated successfully")
      })
  }
})

export const { logout } = authSlice.actions;
export { login, register, updateAccount }

export const selectToken = (state: { auth: Auth }) => state.auth.token;
export const selectEmail = (state: { auth: Auth }) => state.auth.email;
export const selectName = (state: { auth: Auth }) => state.auth.name;

export default authSlice.reducer;