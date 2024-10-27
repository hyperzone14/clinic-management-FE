import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";
import scheduleReducer from "./slices/scheduleSlice"
import treatmentReducer from "./slices/treatmentSlice";


const store = configureStore({
  reducer: {
    bookingInfo: bookingReducer,
    infoList: infoListReducer,
    schedule: scheduleReducer,
    treatment: treatmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
