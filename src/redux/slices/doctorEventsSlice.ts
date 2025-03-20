import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Events {
  id: string;
  title: string;
  patientName: string;
  timeSlot: string;
  // appointmentStatus: string;
  day: string;
  color: string;
}

interface DoctorEventsState {
  doctorEvents: Events[];
}

const initialState: DoctorEventsState = {
  doctorEvents: [],
};

const doctorEventsSlice = createSlice({
  name: "doctorEvents",
  initialState,
  reducers: {
    setDoctorEvents(state, action: PayloadAction<Events[]>) {
      return { ...state, doctorEvents: action.payload };
    },
  },
});

export const { setDoctorEvents } = doctorEventsSlice.actions;
export default doctorEventsSlice.reducer;
