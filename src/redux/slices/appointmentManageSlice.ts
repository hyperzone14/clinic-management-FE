import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

interface PatientResponseDTO {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: null;
  status: null;
}

interface Appointment {
  id?: number;
  appointmentDate: string;
  doctorName?: string; // Make optional
  doctorId?: number; // Make optional
  departmentId?: number; // Add departmentId
  patientId: number; // Add patientId
  patientResponseDTO?: PatientResponseDTO; // Make optional
  appointmentStatus: string;
  timeSlot: string;
  payId?: number;
}

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  },
};

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface PaginatedResponse {
  result: {
    content: Appointment[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: Sort;
    };
    size: number;
    sort: Sort;
    totalElements: number;
    totalPages: number;
  };
}

interface ApiError {
  message: string;
  status?: number;
}

export const fetchAppointments = createAsyncThunk(
  "appointmentManage/fetchAppointment",
  async (_, { rejectWithValue }) => {
    try {
      const initialResponse = await apiService.get<PaginatedResponse>(
        "/appointment?page=0&size=1"
      );

      const totalElements = initialResponse.result.totalElements;

      const response = await apiService.get<PaginatedResponse>(
        `/appointment?page=0&size=${totalElements}`
      );

      return {
        appointments: response.result.content,
        totalElements: response.result.totalElements,
        totalPages: 1,
        currentPage: 0,
        pageSize: response.result.size,
      };
    } catch (error) {
      const errorResponse = error as ApiError;
      return rejectWithValue({
        message: errorResponse.message || "Failed to fetch appointments",
        status: errorResponse.status,
      });
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  "appointmentManage/getAppointmentById",
  async (id: number) => {
    const response = await apiService.get<Appointment>(`/appointment/${id}`);
    return response;
  }
);

const appointmentManageSlice = createSlice({
  name: "appointmentManage",
  initialState,
  reducers: {
    setPageSize(state, action: PayloadAction<number>) {
      state.pagination.pageSize = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAppointments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAppointments.fulfilled,
      (
        state,
        action: PayloadAction<{
          appointments: Appointment[];
          totalElements: number;
          totalPages: number;
          currentPage: number;
          pageSize: number;
        }>
      ) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination.totalElements = action.payload.totalElements;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.currentPage = action.payload.currentPage;
        state.pagination.pageSize = action.payload.pageSize;
      }
    );
    builder.addCase(fetchAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch appointments";
    });

    builder.addCase(getAppointmentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAppointmentById.fulfilled, (state, action) => {
      state.currentAppointment = action.payload;
    });
    builder.addCase(getAppointmentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch appointment";
    });
  },
});

export const { setPageSize, setCurrentPage } = appointmentManageSlice.actions;
export default appointmentManageSlice.reducer;
