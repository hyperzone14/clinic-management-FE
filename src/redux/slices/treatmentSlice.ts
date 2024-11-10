// redux/slices/treatmentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from "../../utils/axios-config";

// Interfaces
export interface Drug {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
}

export interface PrescribedDrug {
  drugId: number;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

export interface ExaminationDetail {
  examinationType: string;
  examinationResult: string;
}

export interface PatientInfo {
  patientId: number;
  patientName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
}

export interface DoctorInfo {
  doctorId: number;
  doctorName: string;
}

export interface MedicalBillRequest {
  patientId: number;
  doctorId: number;
  date: string;
  syndrome: string;
  note: string;
  prescribedDrugRequestDTOS: PrescribedDrug[];
  examinationDetailRequestDTOS: ExaminationDetail[];
}

interface TreatmentState {
  patientInfo: PatientInfo;
  doctorInfo: DoctorInfo;
  appointmentId: number;
  date: string;
  syndrome: string;
  note: string;
  prescribedDrugRequestDTOS: PrescribedDrug[];
  examinationDetailRequestDTOS: ExaminationDetail[];
  availableDrugs: Drug[];
  loading: boolean;
  error: string | null;
}

const initialState: TreatmentState = {
  patientInfo: {
    patientId: 0,
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
  },
  doctorInfo: {
    doctorId: 0,
    doctorName: '',
  },
  appointmentId: 0,
  date: new Date().toISOString().split('T')[0],
  syndrome: '',
  note: '',
  prescribedDrugRequestDTOS: [],
  examinationDetailRequestDTOS: [],
  availableDrugs: [],
  loading: false,
  error: null,
};

interface DrugResponse {
  result: Drug[];
  code: number;
  message: string;
}

interface TreatmentResponse {
  result: any;
  code: number;
  message: string;
}

// Fetch drugs async thunk
export const fetchDrugs = createAsyncThunk(
  'treatment/fetchDrugs',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching drugs...'); // Debug log
      const response = await apiService.get<DrugResponse>('/drug');
      console.log('Drugs response:', response); // Debug log
      if (!response.result) {
        throw new Error('No drug data received');
      }
      return response.result;
    } catch (error) {
      console.error('Drug fetch error:', error); // Debug log
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch drugs');
    }
  }
);

// Submit treatment async thunk
export const submitTreatment = createAsyncThunk(
  'treatment/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { treatment: TreatmentState };
      const treatmentData: MedicalBillRequest = {
        patientId: state.treatment.patientInfo.patientId,
        doctorId: state.treatment.doctorInfo.doctorId,
        date: state.treatment.date,
        syndrome: state.treatment.syndrome,
        note: state.treatment.note,
        prescribedDrugRequestDTOS: state.treatment.prescribedDrugRequestDTOS,
        examinationDetailRequestDTOS: state.treatment.examinationDetailRequestDTOS,
      };

      console.log('Submitting treatment:', treatmentData); // Debug log
      const response = await apiService.post<TreatmentResponse>('/medical-bills', treatmentData);
      console.log('Treatment response:', response); // Debug log
      return response.result;
    } catch (error) {
      console.error('Treatment submission error:', error); // Debug log
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit treatment');
    }
  }
);

// Initialize treatment async thunk
export const initializeTreatmentAsync = createAsyncThunk(
  'treatment/initializeAsync',
  async (data: {
    patientId: number;
    patientName: string;
    doctorId: number;
    doctorName: string;
    appointmentId: number;
    appointmentDate: string;
    gender: 'Male' | 'Female';
  }, { dispatch }) => {
    try {
      console.log('Initializing treatment with:', data); // Debug log
      // First initialize the treatment data
      dispatch(initializeTreatment(data));
      // Then fetch the drugs
      await dispatch(fetchDrugs()).unwrap();
      return data;
    } catch (error) {
      console.error('Treatment initialization error:', error); // Debug log
      throw error;
    }
  }
);

const treatmentSlice = createSlice({
  name: 'treatment',
  initialState,
  reducers: {
    initializeTreatment: (state, action: PayloadAction<{
      patientId: number;
      patientName: string;
      doctorId: number;
      doctorName: string;
      appointmentId: number;
      appointmentDate: string;
      gender: 'Male' | 'Female';
    }>) => {
      console.log('Setting treatment state:', action.payload); // Debug log
      const { patientId, patientName, doctorId, doctorName, appointmentId, appointmentDate, gender } = action.payload;
      state.patientInfo = {
        patientId,
        patientName,
        dateOfBirth: '', 
        gender,
      };
      state.doctorInfo = {
        doctorId,
        doctorName,
      };
      state.appointmentId = appointmentId;
      state.date = appointmentDate;
      state.syndrome = '';
      state.note = '';
      state.prescribedDrugRequestDTOS = [];
      state.examinationDetailRequestDTOS = [];
    },

    setSyndrome: (state, action: PayloadAction<string>) => {
      state.syndrome = action.payload;
    },

    setNote: (state, action: PayloadAction<string>) => {
      state.note = action.payload;
    },

    addPrescribedDrug: (state, action: PayloadAction<PrescribedDrug>) => {
      state.prescribedDrugRequestDTOS.push(action.payload);
    },

    updatePrescribedDrug: (state, action: PayloadAction<{
      index: number;
      updates: Partial<PrescribedDrug>;
    }>) => {
      const { index, updates } = action.payload;
      if (state.prescribedDrugRequestDTOS[index]) {
        state.prescribedDrugRequestDTOS[index] = {
          ...state.prescribedDrugRequestDTOS[index],
          ...updates
        };
      }
    },

    removePrescribedDrug: (state, action: PayloadAction<number>) => {
      state.prescribedDrugRequestDTOS.splice(action.payload, 1);
    },

    addExamination: (state, action: PayloadAction<ExaminationDetail>) => {
      state.examinationDetailRequestDTOS.push(action.payload);
    },

    updateExamination: (state, action: PayloadAction<{
      index: number;
      updates: Partial<ExaminationDetail>;
    }>) => {
      const { index, updates } = action.payload;
      if (state.examinationDetailRequestDTOS[index]) {
        state.examinationDetailRequestDTOS[index] = {
          ...state.examinationDetailRequestDTOS[index],
          ...updates
        };
      }
    },

    removeExamination: (state, action: PayloadAction<number>) => {
      state.examinationDetailRequestDTOS.splice(action.payload, 1);
    },

    resetTreatment: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch drugs cases
      .addCase(fetchDrugs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugs.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDrugs = action.payload;
        console.log('Updated available drugs:', state.availableDrugs); // Debug log
      })
      .addCase(fetchDrugs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit treatment cases
      .addCase(submitTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTreatment.fulfilled, (state) => {
        console.log('Treatment submitted successfully'); // Debug log
        return initialState;
      })
      .addCase(submitTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Selector
export const selectTreatment = (state: { treatment: TreatmentState }) => state.treatment;

export const {
  initializeTreatment,
  setSyndrome,
  setNote,
  addPrescribedDrug,
  updatePrescribedDrug,
  removePrescribedDrug,
  addExamination,
  updateExamination,
  removeExamination,
  resetTreatment
} = treatmentSlice.actions;

export default treatmentSlice.reducer;