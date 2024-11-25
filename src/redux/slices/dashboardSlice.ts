// redux/slices/dashboardSlice.ts
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

export interface DashboardStats {
  totalAppointments: number;
  confirmedAppointments: number;
  successfulAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRevenuePerDay: number;
}

interface DashboardState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  stats: DashboardStats;
}

interface AppointmentResponseItem {
  id: number;
  appointmentDate: string;
  doctorName: string;
  doctorId: number;
  patientResponseDTO: PatientResponseDTO;
  appointmentStatus: string;
  timeSlot: string;
  payId: number | null;
}

interface AppointmentResponse {
  result: {
    content: AppointmentResponseItem[];
  };
  code: number;
  message: string;
}

// Constants
const REVENUE_PER_APPOINTMENT = 70000;

// Helper Functions
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

const transformAppointmentData = (apt: AppointmentResponseItem): Appointment => ({
  id: apt.id,
  appointmentDate: apt.appointmentDate,
  doctorName: apt.doctorName,
  doctorId: apt.doctorId,
  patientResponseDTO: apt.patientResponseDTO,
  appointmentStatus: apt.appointmentStatus,
  timeSlot: apt.timeSlot,
  payId: apt.payId,
  patientName: apt.patientResponseDTO.fullName,
  patientId: apt.patientResponseDTO.id,
  appointmentType: apt.timeSlot,
  status: mapStatus(apt.appointmentStatus),
  gender: apt.patientResponseDTO.gender,
  birthDate: apt.patientResponseDTO.birthDate
});

const calculateStats = (appointments: Appointment[]): DashboardStats => {
  const confirmedAppointments = appointments.filter(apt => 
    ['confirmed', 'checked-in'].includes(apt.status)
  ).length;
  
  const successfulAppointments = appointments.filter(apt => 
    ['success', 'lab_test_completed', 'lab_test_required'].includes(apt.status)
  ).length;
  
  const cancelledAppointments = appointments.filter(apt => 
    apt.status === 'cancelled'
  ).length;

  const uniqueDates = new Set(
    appointments.map(apt => apt.appointmentDate.split('T')[0])
  );
  const numberOfDays = uniqueDates.size || 1;

  // Each successful or confirmed appointment generates revenue
  const revenueGeneratingAppointments = confirmedAppointments + successfulAppointments;
  const totalRevenue = revenueGeneratingAppointments * REVENUE_PER_APPOINTMENT;
  const averageRevenuePerDay = totalRevenue / numberOfDays;

  return {
    totalAppointments: appointments.length,
    confirmedAppointments,
    successfulAppointments,
    cancelledAppointments,
    totalRevenue,
    averageRevenuePerDay
  };
};

// Initial State
const initialState: DashboardState = {
  appointments: [],
  loading: false,
  error: null,
  stats: {
    totalAppointments: 0,
    confirmedAppointments: 0,
    successfulAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageRevenuePerDay: 0
  }
};

// Thunks
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<AppointmentResponse>(
        "/appointment?size=1000000"
      );
      
      return response.result.content.map(transformAppointmentData);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch dashboard data";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateStats: (state) => {
      state.stats = calculateStats(state.appointments);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
        state.stats = calculateStats(action.payload);
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.appointments = [];
      });
  },
});

export const { updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;