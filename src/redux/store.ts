import { combineReducers, configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";
import profileReducer from "./slices/profileSlide";
import scheduleReducer from "./slices/scheduleSlice";
import predrugReducer from "./slices/predrugSlide";
import userManageReducer from "./slices/userManageSlide";
import tableReducer from "./slices/tableSlide";
import medicHistoryReducer from "./slices/medicHistorySlide";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { thunk } from "redux-thunk";

const rootReducer = combineReducers({
  bookingInfo: bookingReducer,
  infoList: infoListReducer,
  profile: profileReducer,
  predrug: predrugReducer,
  medicHistory: medicHistoryReducer,
  userManage: userManageReducer,
  schedule: scheduleReducer,
  table: tableReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
