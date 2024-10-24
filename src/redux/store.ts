import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlide";
import infoListReducer from "./slices/infoListSlide";

const store = configureStore({
  reducer: {
    bookingInfo: bookingReducer,
    infoList: infoListReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
