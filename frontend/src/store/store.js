// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import companyReducer from './companySlice';
import employeeReducer from './employeeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    employees: employeeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;