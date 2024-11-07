// scheduleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sampleScheduleData } from '../../utils/scheduleData';

export type StatusType = 'completed' | 'pending' | 'cancelled' | 'check-in' | 'confirm';

export interface Appointment {
  patientName: string;
  patientImage: string;
  gender: string;
  appointmentType: string;
  status: StatusType;
}

interface ScheduleState {
  currentDoctor: string;
  appointments: Appointment[];
}

const initialState: ScheduleState = sampleScheduleData;

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    updateAppointmentStatus(
      state,
      action: PayloadAction<{ index: number; newStatus: StatusType }>
    ) {
      const { index, newStatus } = action.payload;
      const currentStatus = state.appointments[index].status;
      
      // Define valid status transitions
      const validTransitions: Record<StatusType, StatusType[]> = {
        'pending': ['check-in', 'cancelled'],
        'check-in': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
        'confirm': ['check-in', 'cancelled']
      };

      // Only update if the transition is valid
      if (validTransitions[currentStatus]?.includes(newStatus)) {
        state.appointments[index].status = newStatus;
      }
    },

    completeTreatmentAndUpdateStatus(
      state,
      action: PayloadAction<{ patientName: string }>
    ) {
      const index = state.appointments.findIndex(
        app => app.patientName === action.payload.patientName
      );
      
      // Remove the status check here as well
      if (index !== -1) {
        state.appointments[index].status = 'completed';
        console.log("Status updated to completed for:", action.payload.patientName); // Debug log
      }
    },

    setAppointments(state, action: PayloadAction<Appointment[]>) {
      state.appointments = action.payload;
    },

    setCurrentDoctor(state, action: PayloadAction<string>) {
      state.currentDoctor = action.payload;
    }
  }
});

export const {
  updateAppointmentStatus,
  setAppointments,
  setCurrentDoctor,
  completeTreatmentAndUpdateStatus
} = scheduleSlice.actions;

export default scheduleSlice.reducer;