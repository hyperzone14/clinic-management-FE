// redux/slices/scheduleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

export type StatusType = 'pending' | 'confirmed' | 'checked-in' | 'cancelled' | 'success';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS'
}

export interface Appointment {
  id: number;
  appointmentDate: string;
  doctorName: string;
  patientName: string;
  appointmentStatus: string;
  timeSlot: string;
  payId: number | null;
  // Frontend specific fields
  appointmentType: string;
  status: StatusType;
}

interface ScheduleState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  currentDoctor: string;
}

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface AppointmentResponse {
  result: {
    content: Array<{
      id: number;
      appointmentDate: string;
      doctorName: string;
      patientName: string;
      appointmentStatus: string;
      timeSlot: string;
      payId: number | null;
    }>;
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: Sort;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
  code: number;
  message: string;
}

const initialState: ScheduleState = {
  appointments: [],
  loading: false,
  error: null,
  currentDoctor: "",
};

// Helper function to map backend status to frontend status
const mapStatus = (backendStatus: string): StatusType => {
  const statusMap: Record<string, StatusType> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'CHECKED_IN': 'checked-in',
    'CANCELLED': 'cancelled',
    'SUCCESS': 'success'
  };
  const normalizedStatus = backendStatus?.toUpperCase() || 'PENDING';
  return statusMap[normalizedStatus] || 'pending';
};

// Helper function to transform appointment data
const transformAppointmentData = (apt: AppointmentResponse['result']['content'][0]): Appointment => ({
  ...apt,
  appointmentType: apt.timeSlot,
  status: mapStatus(apt.appointmentStatus),
});

// Async thunk to fetch appointments
export const fetchAppointments = createAsyncThunk(
  "schedule/fetchAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<AppointmentResponse>("/appointment");
      return response.result.content.map(transformAppointmentData);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An error occurred while fetching appointments');
    }
  }
);

// Async thunk to update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  "schedule/updateStatus",
  async ({ id, status }: { id: number; status: StatusType }, { rejectWithValue }) => {
    try {
      // Convert frontend status to backend format
      // Ensure proper enum format matching your backend
      const backendStatus = status.toUpperCase().replace('-', '_') as AppointmentStatus;
      
      const response = await apiService.put<{ result: Appointment }>(
        `/appointment/status/${id}`, // Changed URL format to match your backend
        { appointmentStatus: backendStatus } // Changed request body format
      );
      
      return {
        ...response.result, 
        appointmentType: response.result.timeSlot,
        status: mapStatus(response.result.appointmentStatus),
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An error occurred while updating appointment status');
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setCurrentDoctor(state, action: PayloadAction<string>) {
      state.currentDoctor = action.payload;
    },
    setAppointmentStatus(state, action: PayloadAction<{ id: number; status: StatusType }>) {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index].status = action.payload.status;
        state.appointments[index].appointmentStatus = action.payload.status.toUpperCase().replace('-', '_');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAppointments.fulfilled,
        (state, action: PayloadAction<Appointment[]>) => {
          state.loading = false;
          state.appointments = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch appointments";
        state.appointments = []; // Clear appointments on error
      })
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateAppointmentStatus.fulfilled,
        (state, action: PayloadAction<Appointment>) => {
          state.loading = false;
          state.error = null;
          const index = state.appointments.findIndex(
            (apt) => apt.id === action.payload.id
          );
          if (index !== -1) {
            state.appointments[index] = action.payload;
          }
        }
      )
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update appointment status";
      });
  },
});

export const { setCurrentDoctor, setAppointmentStatus } = scheduleSlice.actions;
export default scheduleSlice.reducer;