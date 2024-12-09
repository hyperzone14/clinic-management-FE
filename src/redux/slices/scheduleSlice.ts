import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";
import { toast } from "react-toastify";

// Types
export type StatusType = 
  | "success"
  | "checked-in"
  | "pending"
  | "cancelled"
  | "confirmed"
  | "lab_test_required"
  | "lab_test_completed";

export type Gender = 'Male' | 'Female' | 'Other';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS',
  LAB_TEST_REQUIRED = 'LAB_TEST_REQUIRED',
  LAB_TEST_COMPLETED = 'LAB_TEST_COMPLETED'
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
  appointmentDate: string;
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
  birthDate: string;
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


// State Interface
interface ScheduleState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  currentDoctor: string;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

// Helper Functions


const handleError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const mapStatus = (backendStatus: string): StatusType => {
  const statusMap: Record<string, StatusType> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'CHECKED_IN': 'checked-in',
    'CANCELLED': 'cancelled',
    'SUCCESS': 'success',
    'LAB_TEST_REQUIRED': 'lab_test_required',
    'LAB_TEST_COMPLETED': 'lab_test_completed'
  };
  const normalizedStatus = backendStatus?.toUpperCase() || 'PENDING';
  return statusMap[normalizedStatus] || 'pending';
};

const transformAppointmentData = (apt: AppointmentResponse['result']['content'][0]): Appointment => ({
  ...apt,
  patientName: apt.patientResponseDTO.fullName,
  patientId: apt.patientResponseDTO.id,
  gender: apt.patientResponseDTO.gender,
  birthDate: apt.patientResponseDTO.birthDate,
  appointmentType: apt.timeSlot,
  status: mapStatus(apt.appointmentStatus),
});

// Initial State
const initialState: ScheduleState = {
  appointments: [],
  loading: false,
  error: null,
  currentDoctor: "",
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  pageSize: 5,
};

// Thunks
export const fetchAppointments = createAsyncThunk(
  "schedule/fetchAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<AppointmentResponse>("/appointment");
      return response.result.content.map(transformAppointmentData);
    } catch (error) {
      const errorMessage = handleError(error);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  "schedule/fetchDoctorAppointments",
  async (params: {
    doctorId: number;
    appointmentDate: string;
    page?: number;
    size?: number;
    sort?: string;
  }, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        doctorId: params.doctorId.toString(),
        appointmentDate: params.appointmentDate,
        page: (params.page || 0).toString(),
        size: (params.size || 10).toString(),
        sort: params.sort || 'timeSlot,desc'
      });

      const response = await apiService.get<AppointmentResponse>(
        `/appointment/search?${queryParams.toString()}`
      );

      return {
        appointments: response.result.content.map(transformAppointmentData),
        totalPages: response.result.totalPages,
        totalElements: response.result.totalElements,
        currentPage: params.page || 0,
      };
    } catch (error) {
      const errorMessage = handleError(error);
      toast.error(`Failed to fetch doctor appointments: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAppointmentsWithPagination = createAsyncThunk(
  "schedule/fetchAppointmentsWithPagination",
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.get<AppointmentResponse>(
        `/appointment?page=${page}&size=${size}`
      );
      return {
        appointments: response.result.content.map(transformAppointmentData),
        totalPages: response.result.totalPages,
        totalElements: response.result.totalElements,
        currentPage: page,
      };
    } catch (error) {
      const errorMessage = handleError(error);
      toast.error(`Failed to fetch appointments: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLabTestAppointments = createAsyncThunk(
  "schedule/fetchLabTestAppointments",
  async (params: {
    appointmentDate: string;
    page?: number;
    size?: number;
    sort?: string;
  }, { rejectWithValue }) => {
    try {
      const baseUrl = `/appointment/search?appointmentDate=${params.appointmentDate}&page=${params.page || 0}&size=${params.size || 10}&sort=${params.sort || 'timeSlot,desc'}`;
      
      // Make separate API calls for each status
      const [requiredResponse, completedResponse] = await Promise.all([
        apiService.get<AppointmentResponse>(`${baseUrl}&appointmentStatus=LAB_TEST_REQUIRED`),
        apiService.get<AppointmentResponse>(`${baseUrl}&appointmentStatus=LAB_TEST_COMPLETED`)
      ]);

      // Combine and deduplicate appointments
      const allAppointments = [
        ...requiredResponse.result.content,
        ...completedResponse.result.content
      ];

      // Calculate combined totals
      const totalElements = requiredResponse.result.totalElements + completedResponse.result.totalElements;
      const totalPages = Math.ceil(totalElements / (params.size || 10));

      return {
        appointments: allAppointments.map(transformAppointmentData),
        totalPages,
        totalElements,
        currentPage: params.page || 0,
      };
    } catch (error) {
      const errorMessage = handleError(error);
      toast.error(`Failed to fetch lab test appointments: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  "schedule/updateStatus",
  async ({ id, status }: { id: number; status: StatusType }, { rejectWithValue }) => {
    try {
      const backendStatus = status === 'checked-in' 
        ? 'CHECKED_IN' 
        : status.toUpperCase().replace(/-/g, '_');
      
      const response = await apiService.put<{ result: AppointmentResponse['result']['content'][0] }>(
        `/appointment/${id}/status`,
        `"${backendStatus}"`
      );

      const successMessage = (() => {
        switch (status) {
          case 'lab_test_required':
            return 'Lab tests have been requested';
          case 'lab_test_completed':
            return 'Lab test results have been recorded';
          default:
            return `Appointment status updated to ${status.replace(/_/g, ' ')}`;
        }
      })();

      toast.success(successMessage);
      return transformAppointmentData(response.result);
    } catch (error) {
      const errorMessage = handleError(error);
      toast.error(`Failed to update status: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
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
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.currentPage = 0;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch appointments";
        state.appointments = [];
      })
      // Fetch appointments with pagination
      .addCase(fetchAppointmentsWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsWithPagination.fulfilled, (state, action: PayloadAction<{
        appointments: Appointment[];
        totalPages: number;
        totalElements: number;
        currentPage: number;
      }>) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchAppointmentsWithPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch appointments";
        state.appointments = [];
      })
      // Fetch lab test appointments
      .addCase(fetchLabTestAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTestAppointments.fulfilled, (state, action: PayloadAction<{
        appointments: Appointment[];
        totalPages: number;
        totalElements: number;
        currentPage: number;
      }>) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchLabTestAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch lab test appointments";
        state.appointments = [];
      })
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.error = null;
        const index = state.appointments.findIndex((apt) => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update appointment status";
      })
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action: PayloadAction<{
        appointments: Appointment[];
        totalPages: number;
        totalElements: number;
        currentPage: number;
      }>) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch doctor appointments";
        state.appointments = [];
      });
  },
});

export const { 
  setCurrentDoctor, 
  setAppointmentStatus, 
  setPageSize, 
  setCurrentPage 
} = scheduleSlice.actions;

export default scheduleSlice.reducer;