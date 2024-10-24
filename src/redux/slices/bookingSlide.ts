import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
  patientName: string;
  patientGender: string;
  patientDoB: Date | null;
  patientCitizenId: string;
  patientPhoneNumber: string;
  patientAddress: string;
  service: string;
  type: string;
  date: Date | null;
  time: string;
  price: string;
}

const initialState: BookingState = {
  patientName: "",
  patientGender: "",
  patientDoB: null,
  patientCitizenId: "",
  patientPhoneNumber: "",
  patientAddress: "",
  service: "",
  type: "",
  date: null,
  time: "",
  price: "",
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBooking(state, action: PayloadAction<BookingState>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
