import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import logger from "redux-logger";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import authReducer from "./slices/authSlice";
import applicationsReducer from "./slices/applicationsSlice";
import rightsReducer from "./slices/rightsSlice";
import accountsReducer from "./slices/accountsSlice";
import usersReducer from "./slices/usersSlice";
import adminManagementReducer from "./slices/adminManagementSlice";
import inviteModalReducer from "./slices/inviteModalSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  applications: applicationsReducer,
  rights: rightsReducer,
  accounts: accountsReducer,
  users: usersReducer,
  adminManagement: adminManagementReducer,
  inviteModal: inviteModalReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(logger),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
