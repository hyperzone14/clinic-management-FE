import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InfoListState {
  name?: string;
  service?: string;
  type?: string;
  date?: string | null;
  time?: string;
  price?: string;
}

const initialState: InfoListState = {
  name: "",
  service: "",
  type: "",
  date: "",
  time: "",
  price: "",
};

const infoListSlice = createSlice({
  name: "infoList",
  initialState,
  reducers: {
    setInfoList(state, action: PayloadAction<InfoListState>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setInfoList } = infoListSlice.actions;
export default infoListSlice.reducer;
