// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import bookingReducer from "./slices/bookingSlice";
// import infoListReducer from "./slices/infoListSlice";
// import profileReducer from "./slices/profileSlice";
// import scheduleReducer from "./slices/scheduleSlice";
// import predrugReducer from "./slices/predrugSlice";
// import userManageReducer from "./slices/userManageSlice";
// import tableReducer from "./slices/tableSlice";
// import medicHistoryReducer from "./slices/medicHistorySlice";
// import treatmentReducer from "./slices/treatmentSlice";
// import doctorReducer from "./slices/doctorSlice";
// import departmentReducer from "./slices/departmentSlice";
// import appointmentReducer from "./slices/appointmentSlice";
// import drugManageReducer from "./slices/drugManageSlice";
// import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// import { thunk } from "redux-thunk";

// const rootReducer = combineReducers({
//   bookingInfo: bookingReducer,
//   infoList: infoListReducer,
//   profile: profileReducer,
//   predrug: predrugReducer,
//   medicHistory: medicHistoryReducer,
//   userManage: userManageReducer,
//   schedule: scheduleReducer,
//   treatment: treatmentReducer,
//   table: tableReducer,
//   doctor: doctorReducer,
//   department: departmentReducer,
//   appointment: appointmentReducer,
//   drugManage: drugManageReducer,
// });

// const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
// });

// export type RootState = ReturnType<typeof rootReducer>;
// export type AppDispatch = typeof store.dispatch;

// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// export default store;

import { combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { thunk } from "redux-thunk";

// Define interface for slice modules
interface SliceModule {
  default: Reducer;
}

// Automatically import all reducers from the slices directory
const sliceModules = import.meta.glob<SliceModule>("./slices/*Slice.ts", {
  eager: true,
});

// Build reducers object dynamically
const reducers = Object.entries(sliceModules).reduce<Record<string, Reducer>>(
  (acc, [path, module]) => {
    // Extract name from path, removing 'Slice' suffix
    const name = path
      .split("/")
      .pop()
      ?.replace(/Slice\.ts$/, "")
      .toLowerCase();
    if (name && module.default) {
      acc[name] = module.default;
    }
    return acc;
  },
  {}
);

const rootReducer = combineReducers(reducers);

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
