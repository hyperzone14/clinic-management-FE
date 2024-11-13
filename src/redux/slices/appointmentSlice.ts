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
  timeSlot: number;
  payId?: number;
}

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

interface ApiResponse {
  code: number;
  message: string;
  result: Appointment[] | Appointment;
}

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAppointments",
  async () => {
    const response = await apiService.get<ApiResponse>("/appointment/getall");
    return response.result as Appointment[];
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
      });
  },
});

export const { setAppointments, deleteAppointment, setCurrentAppointment } =
  appointmentSlice.actions;
export default appointmentSlice.reducer;
