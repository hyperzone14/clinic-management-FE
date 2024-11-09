import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
  bookingId?: number;
  patientName?: string;
  patientGender?: string;
  patientDoB?: string | null;
  patientCitizenId?: string;
  patientPhoneNumber?: string;
  patientAddress?: string;
  service?: string;
  type?: string;
  date?: string | null;
  time?: string;
  price?: string;
  note?: string;
}

const initialState: BookingState = {
  bookingId: 0,
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
  note: "",
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
