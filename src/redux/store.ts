import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";
import scheduleReducer from "./slices/scheduleSlice"


const store = configureStore({
  reducer: {
    bookingInfo: bookingReducer,
    infoList: infoListReducer,
    schedule: scheduleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
