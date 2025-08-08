import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import applicationsReducer from "./slices/applicationsSlice";
import rightsReducer from "./slices/rightsSlice";
import accountsReducer from "./slices/accountsSlice";
import usersReducer from "./slices/usersSlice";
import adminManagementReducer from "./slices/adminManagementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer,
    rights: rightsReducer,
    accounts: accountsReducer,
    users: usersReducer,
    adminManagement: adminManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
