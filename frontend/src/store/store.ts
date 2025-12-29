import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer
  }
})

export type OurRootState = ReturnType<typeof store.getState>;
export type OurAppDispatch = typeof store.dispatch;

export default store