import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StatusType = 'completed' | 'pending' | 'cancelled';

interface Appointment {
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

const initialState: ScheduleState = {
  currentDoctor: "Dr.John Doe",
  appointments: [
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "completed"
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "pending"
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "cancelled"
    },
    {
      patientName: "John F. Kennedy",
      patientImage: "https://placehold.co/150x150",
      gender: "Male",
      appointmentType: "Appointment type: By doctor",
      status: "cancelled"
    }
  ]
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    updateAppointmentStatus(
      state,
      action: PayloadAction<{ index: number; newStatus: StatusType }>
    ) {
      const { index, newStatus } = action.payload;
      // Only allow status change if current status is not cancelled
      if (state.appointments[index].status !== 'cancelled') {
        state.appointments[index].status = newStatus;
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

export const { updateAppointmentStatus, setAppointments, setCurrentDoctor } = scheduleSlice.actions;
export default scheduleSlice.reducer;