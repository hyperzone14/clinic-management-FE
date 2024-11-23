import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InfoListState {
  patientId?: number;
  doctorId?: number | null;
  departmentId?: number | null;
  name?: string;
  service?: string;
  type?: string;
  date?: string | null;
  time?: string;
  price?: string;
  workingDays?: string[] | null;
  timeSlot?: number;
  note?: string;
}

const initialState: InfoListState = {
  patientId: 0,
  doctorId: null,
  departmentId: null,
  name: "",
  service: "",
  type: "",
  date: null,
  time: "",
  price: "70000",
  workingDays: null,
  timeSlot: 0,
  note: "",
};

const infoListSlice = createSlice({
  name: "infoList",
  initialState,
  reducers: {
    setInfoList(state, action: PayloadAction<InfoListState>) {
      return { ...state, ...action.payload };
    },
    resetInfoList() {
      return initialState;
    },
  },
});

export const { setInfoList, resetInfoList } = infoListSlice.actions;
export default infoListSlice.reducer;
