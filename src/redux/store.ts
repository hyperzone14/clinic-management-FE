import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";
import profileReducer from "./slices/profileSlide";
import predrugReducer from "./slices/predrugSlide";
import medicHistoryReducer from "./slices/medicHistorySlide";
import scheduleReducer from './slices/scheduleSlice'; // Add this import
import treatmentReducer from './slices/treatmentSlice';

const store = configureStore({
  reducer: {
    bookingInfo: bookingReducer,
    infoList: infoListReducer,
    profile: profileReducer,
    predrug: predrugReducer,
    medicHistory: medicHistoryReducer,
    schedule: scheduleReducer,     // Add this line
    treatment: treatmentReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
