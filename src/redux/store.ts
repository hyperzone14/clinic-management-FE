import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";
import profileReducer from "./slices/profileSlide";
import predrugReducer from './slices/predrugSlide';

const store = configureStore({
  reducer: {
    bookingInfo: bookingReducer,
    infoList: infoListReducer,
    profile: profileReducer,
    predrug: predrugReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
