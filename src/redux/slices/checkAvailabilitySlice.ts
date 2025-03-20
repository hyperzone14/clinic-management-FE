// checkAvailabilitySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

interface Timeslot {
  id: number;
  timeSlot: string;
  maxPatients: number;
  currentPatients: number;
}

interface ScheduleResponse {
  id: number;
  date: string;
  doctorId: number;
  doctorTimeslotCapacityResponseDTOS: Timeslot[];
}

interface APIResponse {
  code: number;
  message: string;
  result: ScheduleResponse | null;
}

// interface CheckAvailabilityState {
//   doctorTimeslotCapacityResponseDTO: Timeslot[];
//   loading: boolean;
//   error: string | null;
// }

interface CheckAvailabilityState {
  availabilityByDate: {
    [date: string]: Timeslot[];
  };
  loading: boolean;
  error: string | null;
}

// const initialState: CheckAvailabilityState = {
//   doctorTimeslotCapacityResponseDTO: [],
//   loading: false,
//   error: null,
// };

const initialState: CheckAvailabilityState = {
  availabilityByDate: {},
  loading: false,
  error: null,
};

// export const fetchSchedule = createAsyncThunk(
//   "checkAvailability/fetchSchedule",
//   async ({ doctorId, date }: { doctorId: number; date: string }) => {
//     const response = await apiService.get<APIResponse>(
//       `/schedules/doctor/${doctorId}/date/${date}`
//     );

//     // If result is null, return an empty array
//     if (!response.result) {
//       return [];
//     }
//     // console.log(response.result);
//     const scheduleData = response.result.doctorTimeslotCapacityResponseDTOS;
//     return scheduleData;
//   }
// );
export const fetchSchedule = createAsyncThunk(
  "checkAvailability/fetchSchedule",
  async ({ doctorId, date }: { doctorId: number; date: string }) => {
    const response = await apiService.get<APIResponse>(
      `/schedules/doctor/${doctorId}/date/${date}`
    );

    // Return both the date and schedule data
    return {
      date,
      timeslots: response.result?.doctorTimeslotCapacityResponseDTOS || [],
    };
  }
);

const checkAvailabilitySlice = createSlice({
  name: "checkAvailability",
  initialState,
  reducers: {
    clearSchedule: (state) => {
      // state.doctorTimeslotCapacityResponseDTO = [];
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
        (
          state,
          action: PayloadAction<{ date: string; timeslots: Timeslot[] }>
        ) => {
          state.loading = false;
          // Store the timeslots by date
          state.availabilityByDate[action.payload.date] =
            action.payload.timeslots;
          state.error = null;
        }
      )
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        // state.doctorTimeslotCapacityResponseDTO = [];
        state.error = action.error.message ?? "Failed to fetch schedule";
      });
  },
});

export const { clearSchedule } = checkAvailabilitySlice.actions;
export default checkAvailabilitySlice.reducer;
