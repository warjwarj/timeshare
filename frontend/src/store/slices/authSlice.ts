import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { OurRootState } from '../store';

interface Auth {
  token: string
  email: string
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || "",
    email: ""
  } as Auth,
  reducers: {
    login: (state, action: PayloadAction<{ token: string, email: string }>) => {
      localStorage.setItem("token", action.payload.token);
      state.token = action.payload.token;
      state.email = action.payload.email;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      state.token = "";
    }
  }
})

export const { login, logout } = authSlice.actions;

export const selectToken = (state: OurRootState) => state.auth.token;

export default authSlice.reducer;