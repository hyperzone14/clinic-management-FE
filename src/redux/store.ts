import { combineReducers, configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlice";
import infoListReducer from "./slices/infoListSlice";
import profileReducer from "./slices/profileSlice";
import scheduleReducer from "./slices/scheduleSlice";
import predrugReducer from "./slices/predrugSlice";
import userManageReducer from "./slices/userManageSlice";
import tableReducer from "./slices/tableSlice";
import medicHistoryReducer from "./slices/medicHistorySlice";
import treatmentReducer from "./slices/treatmentSlice";
import doctorReducer from "./slices/doctorSlice";
import departmentReducer from "./slices/departmentSlice";
import appointmentReducer from "./slices/appointmentSlice";
import drugManageReducer from "./slices/drugManageSlice";
import examinationReducer from "./slices/examinationSlice";
import medicalBillReducer from "./slices/medicalBillSlice";
import checkAvailabilityReducer from "./slices/checkAvailabilitySlice";
import chatReducer from "./slices/chatbotSlice";
import auth from "./slices/authSlice";
import signinProfileReducer from "./slices/signinProfileSlice";
import doctorManageReducer from "./slices/doctorManageSlice";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { thunk } from "redux-thunk";

import dashboardReducer from "./slices/dashboardSlice";

const rootReducer = combineReducers({
  bookingInfo: bookingReducer,
  infoList: infoListReducer,
  profile: profileReducer,
  predrug: predrugReducer,
  medicHistory: medicHistoryReducer,
  userManage: userManageReducer,
  schedule: scheduleReducer,
  treatment: treatmentReducer,
  table: tableReducer,
  doctor: doctorReducer,
  department: departmentReducer,
  appointment: appointmentReducer,
  drugManage: drugManageReducer,
  examination: examinationReducer,
  medicalBill: medicalBillReducer,
  checkAvailability: checkAvailabilityReducer,
  chat: chatReducer,
  auth: auth,
  signinProfile: signinProfileReducer,
  dashboard: dashboardReducer,
  doctorManage: doctorManageReducer,
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
