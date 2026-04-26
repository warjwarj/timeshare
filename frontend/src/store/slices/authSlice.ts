import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { LoginRequest } from '../../actions/auth/loginAction';
import loginAction from '../../actions/auth/loginAction';
import type { RegisterRequest } from '../../actions/auth/registerAction';
import registerAction from '../../actions/auth/registerAction';
import type { UpdateAccountRequest } from '../../actions/auth/updateAccountAction';
import updateAccountAction from '../../actions/auth/updateAccountAction';
import { toastService } from '../../toastService';
import type { UserDTO } from '../../types/UserDTO';

const login = createAsyncThunk(
  'auth/login',
  async (
    req: LoginRequest,
    { signal, rejectWithValue }
  ) => {
    const errMsg = "Couldn't login"
    const res = await loginAction(req, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

const register = createAsyncThunk(
  'auth/register',
  async (
    req: RegisterRequest,
    { signal, rejectWithValue }
  ) => {
    const errMsg = "Couldn't register"
    const res = await registerAction(req, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

const updateAccount = createAsyncThunk(
  'auth/updateAccount',
  async (
    req: UpdateAccountRequest,
    { signal, rejectWithValue }
  ) => {
    const errMsg = "Couldn't login"
    const res = await updateAccountAction(req, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
      return rejectWithValue(res.error);
    }
    return res.data;
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
        const { uuid, name, email, colour, access_token } = action.payload;
        state.token = access_token
        state.user = { uuid, name, email, colour } as UserDTO;
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const { name, email, colour } = action.payload;
        state.user = { ...state.user, name, email, colour } as UserDTO;
        localStorage.setItem("auth_state", JSON.stringify({ ...state }))
      })
  }
})

export const { logout } = authSlice.actions;

export { login, register, updateAccount };

export const selectToken = (state: { auth: Auth }) => state.auth.token;
export const selectLoggedInUser = (state: { auth: Auth }) => state.auth.user;

export default authSlice.reducer;