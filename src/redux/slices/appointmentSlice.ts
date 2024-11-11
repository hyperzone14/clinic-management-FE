import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

interface Appointment {
  id?: number;
  patientId: number;
  doctorId?: number;
  departmentId?: number;
  appointmentDate: string;
  timeSlot: number;
  status?: string;
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
    try {
      const response = await apiService.get<ApiResponse>("/appointment/getall");
      return Array.isArray(response.result)
        ? response.result
        : [response.result];
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
      throw error;
    }
  }
);

// Add appointment by doctor
// Add appointment by doctor
export const addAppointmentByDoctor = createAsyncThunk(
  "appointment/addByDoctor",
  async (appointmentData: Omit<Appointment, "id" | "departmentId">) => {
    // try {
    const response = await apiService.post<ApiResponse>(
      "/appointment/doctor",
      appointmentData
    );

    // Debug log
    console.log("API Response:", response);

    if (!response.result) {
      throw new Error("No result in API response");
    }

    return response.result as Appointment;
    // } catch (error: any) {
    //   console.error('API Error:', error.response || error);
    //   throw error;
    // }
  }
);

// Add appointment by department
export const addAppointmentByDepartment = createAsyncThunk(
  "appointment/addByDepartment",
  async (appointmentData: Omit<Appointment, "id" | "doctorId">) => {
    // try {
    const response = await apiService.post<ApiResponse>(
      "/appointment/department",
      appointmentData
    );

    // Debug log
    console.log("API Response:", response);

    if (!response.result) {
      throw new Error("No result in API response");
    }

    return response.result as Appointment;
    // } catch (error: any) {
    //   console.error('API Error:', error.response || error);
    //   throw error;
    // }
  }
);

// Update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  "appointment/updateStatus",
  async ({ id, status }: { id: number; status: string }) => {
    const response = await apiService.put<ApiResponse>(
      `/appointment/updateStatus/${id}`,
      { status }
    );
    return response.result as Appointment;
  }
);

// Get appointments by doctor and date
export const getAppointmentsByDoctorAndDate = createAsyncThunk(
  "appointment/getByDoctorAndDate",
  async ({ doctorId, date }: { doctorId: number; date: string }) => {
    const response = await apiService.get<ApiResponse>(
      `/appointment/getByDoctorAndDate?doctorId=${doctorId}&date=${date}`
    );
    return Array.isArray(response.result) ? response.result : [response.result];
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
    deleteAppointment: (state, action: PayloadAction<number>) => {
      state.appointments = state.appointments.filter(
        (appointment) => appointment.id !== action.payload
      );
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
      .addCase(
        updateAppointmentStatus.fulfilled,
        (state, action: PayloadAction<Appointment>) => {
          state.loading = false;
          const index = state.appointments.findIndex(
            (appointment) => appointment.id === action.payload.id
          );
          if (index !== -1) {
            state.appointments[index] = action.payload;
          }
        }
      )
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to update appointment status";
      })

      // Get appointments by doctor and date
      // .addCase(getAppointmentsByDoctorAndDate.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(
      //   getAppointmentsByDoctorAndDate.fulfilled,
      //   (state, action: PayloadAction<Appointment[]>) => {
      //     state.loading = false;
      //     state.appointments = action.payload;
      //   }
      // )
      // .addCase(getAppointmentsByDoctorAndDate.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error =
      //     action.error.message ||
      //     "Failed to fetch appointments by doctor and date";
      // })

      // Add appointment
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
