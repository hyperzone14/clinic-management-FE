import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

export type StatusType = 'pending' | 'confirmed' | 'checked-in' | 'cancelled' | 'success';

export type Gender = 'Male' | 'Female' |'Other';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS'
}

export interface PatientResponseDTO {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: Gender;  
  address: string;
  birthDate: string;
  role: string | null;
  status: string | null;
}

export interface Appointment {
  id: number;
  appointmentDate: string; // Changed from string to Date
  doctorName: string;
  doctorId: number;
  patientResponseDTO: PatientResponseDTO;
  appointmentStatus: string;
  timeSlot: string;
  payId: number | null;

  patientName: string;
  patientId: number;
  appointmentType: string;
  status: StatusType;
  gender: Gender;
  birthDate: string; // Changed from string to Date
}
const parseDateString = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
};

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
      doctorId: number;
      patientResponseDTO: PatientResponseDTO;
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
const mapGender = (backendGender: string): Gender => {
  const normalizedGender = backendGender?.toUpperCase() || 'MALE';
  return normalizedGender === 'MALE' ? 'Male' : 'Female';
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

const transformAppointmentData = (apt: AppointmentResponse['result']['content'][0]): Appointment => ({
  ...apt,
  patientName: apt.patientResponseDTO.fullName,
  patientId: apt.patientResponseDTO.id,
  gender: apt.patientResponseDTO.gender,
  birthDate: apt.patientResponseDTO.birthDate, // Just pass through the string
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
      // Convert the status to backend format
      const backendStatus = status.toUpperCase().replace('-', '_');
      
      const response = await apiService.put<{ result: AppointmentResponse['result']['content'][0] }>(
        `/appointment/${id}/status`,
        `"${backendStatus}"`
      );

      return transformAppointmentData(response.result);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update status');
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