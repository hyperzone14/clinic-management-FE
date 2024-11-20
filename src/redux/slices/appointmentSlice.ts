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
  searchTerm: string;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 10,
  },
  searchTerm: "",
};

interface ApiResponse {
  code: number;
  message: string;
  result: Appointment[] | Appointment;
}

interface ApiResponsePagination {
  code: number;
  message: string;
  result: {
    content: Appointment[];
    totalPages: number;
    totalElements: number;
    size: number;
    // Add other fields if necessary
  };
}

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAppointments",
  async () => {
    const response = await apiService.get<ApiResponse>("/appointment");
    return response.result as Appointment[];
  }
);

export const fetchAppointmentPagination = createAsyncThunk(
  "appointment/fetchAppointmentPagination",
  async ({ page, searchTerm }: { page: number; searchTerm?: string }) => {
    let url = `/appointment?page=${page}`;

    // When searching, set a large page size to effectively get all results
    if (searchTerm) {
      url += `&size=1000000000`; // Large number to get all results
    } else {
      url += `&size=10`; // Default page size for normal viewing
    }

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    const response = await apiService.get<ApiResponsePagination>(url);

    return {
      appointments: response.result.content,
      page,
      totalPages: response.result.totalPages,
      totalElements: response.result.totalElements,
      pageSize: response.result.size,
    };
  }
);

// Add appointment by doctor
export const addAppointmentByDoctor = createAsyncThunk(
  "appointment/addByDoctor",
  async (appointmentData: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    timeSlot: number;
    status: string;
  }) => {
    const response = await apiService.post<ApiResponse>(
      "/appointment/doctor",
      appointmentData
    );

    if (!response.result) {
      throw new Error("No result in API response");
    }

    return response.result as Appointment;
  }
);

// Add appointment by department
export const addAppointmentByDepartment = createAsyncThunk(
  "appointment/addByDepartment",
  async (appointmentData: {
    patientId: number;
    departmentId: number;
    appointmentDate: string;
    timeSlot: number;
    status: string;
  }) => {
    const response = await apiService.post<ApiResponse>(
      "/appointment/department",
      appointmentData
    );

    if (!response.result) {
      throw new Error("No result in API response");
    }

    // Ensure departmentId is included in the returned appointment
    const appointment = response.result as Appointment;
    return {
      ...appointment,
      departmentId: appointmentData.departmentId, // Explicitly include departmentId
    };
  }
);

// Update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  "appointment/updateStatus",
  async ({ id, status }: { id: number; status: string }) => {
    const response = await apiService.put<ApiResponse, string>(
      `/appointment/${id}/status`,
      status
    );
    return response.result as Appointment;
  }
);

// Get appointments by doctor and date
export const getAppointmentsByDoctorAndDate = createAsyncThunk(
  "appointment/getByDoctorAndDate",
  async ({ doctorId, date }: { doctorId: number; date: string }) => {
    const response = await apiService.get<ApiResponse>(
      `/appointment/doctor/${doctorId}/date/${date}`
    );
    return response.result as Appointment[];
  }
);

export const getAppointmentById = createAsyncThunk(
  "appointment/getById",
  async (id: number) => {
    const response = await apiService.get<ApiResponse>(`/appointment/${id}`);
    return response.result as Appointment;
  }
);

export const searchAppointmentsCriteria = createAsyncThunk(
  "appointment/search",
  async ({
    appointmentId,
    appointmentDate,
    appointmentStatus,
    page = 0,
    size = 5,
    sort = "timeSlot,asc",
  }: {
    appointmentId?: number;
    appointmentDate?: string;
    appointmentStatus?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    let url = `/appointment/search?page=${page}&size=${size}&sort=${sort}`;

    if (appointmentId) {
      url += `&id=${appointmentId}`;
    }
    if (appointmentDate) {
      url += `&appointmentDate=${appointmentDate}`;
    }
    if (appointmentStatus) {
      url += `&appointmentStatus=${appointmentStatus}`;
    }

    const response = await apiService.get<ApiResponsePagination>(url);

    return {
      appointments: response.result.content,
      page,
      totalPages: response.result.totalPages,
      totalElements: response.result.totalElements,
      pageSize: response.result.size,
    };
  }
);

export const rescheduleAppointment = createAsyncThunk(
  "appointment/reschedule",
  async ({
    appointmentId,
    appointmentDate,
    timeSlot,
  }: {
    appointmentId: number;
    appointmentDate: string;
    timeSlot: number;
  }) => {
    const response = await apiService.put<ApiResponse>(
      `/appointment/reschedule/${appointmentId}`,
      {
        appointmentDate,
        timeSlot,
      }
    );

    if (!response.result) {
      throw new Error("No result in API response");
    }

    return response.result as Appointment;
  }
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    setCurrentAppointment: (state, action: PayloadAction<Appointment>) => {
      state.currentAppointment = action.payload;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      // Reset to first page when search term changes
      state.pagination.currentPage = 0;
    },
    clearSearch: (state) => {
      state.searchTerm = "";
      state.pagination.currentPage = 0;
    },
    deleteAppointment: (state, action: PayloadAction<number>) => {
      state.appointments = state.appointments.filter(
        (appointment) => appointment.id !== action.payload
      );
      if (state.currentAppointment?.id === action.payload) {
        state.currentAppointment = null;
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
        }
      )
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch appointments";
      })

      // Add appointment by doctor
      .addCase(addAppointmentByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addAppointmentByDoctor.fulfilled,
        (state, action: PayloadAction<Appointment>) => {
          state.loading = false;
          state.appointments.push(action.payload);
          state.currentAppointment = action.payload;
        }
      )
      .addCase(addAppointmentByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add appointment";
      })

      // Add appointment by department
      .addCase(addAppointmentByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addAppointmentByDepartment.fulfilled,
        (state, action: PayloadAction<Appointment>) => {
          state.loading = false;
          state.appointments.push(action.payload);
          state.currentAppointment = action.payload;
        }
      )
      .addCase(addAppointmentByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add appointment";
      })

      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAppointment = action.payload;
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === updatedAppointment.id
        );
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
        if (state.currentAppointment?.id === updatedAppointment.id) {
          state.currentAppointment = updatedAppointment;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to update appointment status";
      })

      .addCase(getAppointmentsByDoctorAndDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByDoctorAndDate.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointmentsByDoctorAndDate.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          "Failed to fetch appointments by doctor and date";
      })

      // Fetch paginated appointments
      .addCase(fetchAppointmentPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          pageSize: action.payload.pageSize,
        };
      })
      .addCase(fetchAppointmentPagination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch paginated appointments";
      })

      // Get appointment by ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
        // Update the appointment in the list if it exists
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch appointment by ID";
      })

      // Add cases for search appointments
      .addCase(searchAppointmentsCriteria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAppointmentsCriteria.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          pageSize: action.payload.pageSize,
        };
      })
      .addCase(searchAppointmentsCriteria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search appointments";
      })

      // Add cases for reschedule appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAppointment = action.payload;
        // Update appointment in the list
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === updatedAppointment.id
        );
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
        // Update current appointment if it's the one being rescheduled
        if (state.currentAppointment?.id === updatedAppointment.id) {
          state.currentAppointment = updatedAppointment;
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to reschedule appointment";
      });
  },
});

export const {
  setAppointments,
  deleteAppointment,
  setCurrentAppointment,
  setSearchTerm,
  clearSearch,
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
