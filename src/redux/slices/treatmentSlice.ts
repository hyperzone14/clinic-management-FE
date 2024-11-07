import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Export interfaces so they can be imported in other files
export interface Medicine {
  id: string;
  name: string;
  quantity: number;
  note: string;
  price: number;
}

export interface PatientInfo {
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
}

export interface LabTest {
  type: string;
  results: string;
}

export interface TreatmentState {
  patientInfo: PatientInfo;
  selectedSymptoms: string[];
  medicines: Medicine[];
  labTest: LabTest;
  doctorFeedback: string;
  total: number;
}

// Add new interface for treatment completion
export interface CompleteTreatmentPayload {
  patientId: string;
  treatmentData: {
    symptoms: string[];
    medicines: Medicine[];
    labTest: LabTest;
    doctorFeedback: string;
  };
}

// Initial state
const initialState: TreatmentState = {
  patientInfo: {
    name: '',
    dateOfBirth: '',
    gender: 'Male'
  },
  selectedSymptoms: [],
  medicines: [],
  labTest: {
    type: '',
    results: ''
  },
  doctorFeedback: '',
  total: 0
};

const treatmentSlice = createSlice({
  name: 'treatment',
  initialState,
  reducers: {
    // Previous reducers remain the same
    setPatientInfo: (state, action: PayloadAction<PatientInfo>) => {
      state.patientInfo = action.payload;
    },
    
    addSymptom: (state, action: PayloadAction<string>) => {
      if (!state.selectedSymptoms.includes(action.payload)) {
        state.selectedSymptoms.push(action.payload);
      }
    },
    
    removeSymptom: (state, action: PayloadAction<string>) => {
      state.selectedSymptoms = state.selectedSymptoms.filter(
        symptom => symptom !== action.payload
      );
    },
    
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      state.medicines.push(action.payload);
      state.total = state.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
    },
    
    removeMedicine: (state, action: PayloadAction<string>) => {
      state.medicines = state.medicines.filter(med => med.id !== action.payload);
      state.total = state.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
    },
    
    updateMedicine: (state, action: PayloadAction<{ id: string; updates: Partial<Medicine> }>) => {
      const index = state.medicines.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medicines[index] = { ...state.medicines[index], ...action.payload.updates };
        state.total = state.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
      }
    },
    
    setLabTest: (state, action: PayloadAction<Partial<LabTest>>) => {
      state.labTest = {
        ...state.labTest,
        ...action.payload
      };
    },
    
    setDoctorFeedback: (state, action: PayloadAction<string>) => {
      state.doctorFeedback = action.payload;
    },
    
    
    completeTreatment: (_state, _action: PayloadAction<CompleteTreatmentPayload>) => {
      
      return initialState;
    },
    
    resetTreatment: () => initialState
  }
});

export const {
  setPatientInfo,
  addSymptom,
  removeSymptom,
  addMedicine,
  removeMedicine,
  updateMedicine,
  setLabTest,
  setDoctorFeedback,
  completeTreatment,  // Add this export
  resetTreatment
} = treatmentSlice.actions;

export default treatmentSlice.reducer;