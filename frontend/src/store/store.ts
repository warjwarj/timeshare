import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import eventsReducer from './slices/eventsSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    app: appReducer,
  }
})

export type OurRootState = ReturnType<typeof store.getState>;
export type OurAppDispatch = typeof store.dispatch;

export default store