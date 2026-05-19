import authReducer from "./reducer/auth";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import siteReducer from "./reducer/site";
import userReducer from "./reducer/user";

const reducers = combineReducers({
  auth: authReducer,
  site: siteReducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: reducers,
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
