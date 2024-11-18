import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define the initial state
interface Timeslot {
  id: number;
  timeSlot: string;
  maxPatients: number;
  currentPatients: number;
}

interface CheckAvailabilityState {
  schedule: {
    id: number;
    date: string;
    doctorId: number;
    doctorTimeslotCapacityResponseDTO: Timeslot[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckAvailabilityState = {
  schedule: null,
  loading: false,
  error: null,
};

// Async thunk to fetch schedule data
export const fetchSchedule = createAsyncThunk(
  "schedule/fetchSchedule",
  async ({ doctorId, date }: { doctorId: number; date: string }) => {
    const response = await axios.get(
      `/schedules/doctor/${doctorId}/date/${date}`
    );
    return response.data.result;
  }
);

// Create the slice
const CheckAvailabilityState = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setCheckAvailability(state) {
      state.schedule = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSchedule.fulfilled,
        (state, action: PayloadAction<CheckAvailabilityState["schedule"]>) => {
          state.loading = false;
          state.schedule = action.payload;
        }
      )
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch schedule";
      });
  },
});

// Export actions and reducer
export const { setCheckAvailability } = CheckAvailabilityState.actions;
export default CheckAvailabilityState.reducer;
