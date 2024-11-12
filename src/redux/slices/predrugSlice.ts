import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  PrescribeDrug, 
  Medicine, 
  mockPrescribeDrugs, 
  calculateTotalPrice 
} from '../../utils/predrugData';

interface PredrugState {
  prescribeDrugs: PrescribeDrug[];
  selectedDrug: PrescribeDrug | null;
  loading: boolean;
  error: string | null;
}

const initialState: PredrugState = {
  prescribeDrugs: mockPrescribeDrugs,
  selectedDrug: null,
  loading: false,
  error: null
};

const predrugSlice = createSlice({
  name: 'predrug',
  initialState,
  reducers: {
    addPrescribeDrug: (state, action: PayloadAction<PrescribeDrug>) => {
      state.prescribeDrugs.push(action.payload);
    },
    
    selectPrescribeDrug: (state, action: PayloadAction<string>) => {
      state.selectedDrug = state.prescribeDrugs.find(drug => drug.id === action.payload) || null;
    },

    clearSelectedDrug: (state) => {
      state.selectedDrug = null;
    },
    
    updatePrescribeDrug: (state, action: PayloadAction<PrescribeDrug>) => {
        const index = state.prescribeDrugs.findIndex(drug => drug.id === action.payload.id);
        if (index !== -1) {
          state.prescribeDrugs[index] = action.payload;
          state.selectedDrug = action.payload;
        }
      },
    
    deletePrescribeDrug: (state, action: PayloadAction<string>) => {
      state.prescribeDrugs = state.prescribeDrugs.filter(drug => drug.id !== action.payload);
      if (state.selectedDrug?.id === action.payload) {
        state.selectedDrug = null;
      }
    },
    
    addMedicine: (state, action: PayloadAction<{ prescribeId: string; medicine: Medicine }>) => {
      const prescription = state.prescribeDrugs.find(drug => drug.id === action.payload.prescribeId);
      if (prescription) {
        prescription.medicines.push(action.payload.medicine);
        prescription.totalPrice = calculateTotalPrice(prescription.medicines);
      }
    },
    
    removeMedicine: (state, action: PayloadAction<{ prescribeId: string; medicineId: string }>) => {
      const prescription = state.prescribeDrugs.find(drug => drug.id === action.payload.prescribeId);
      if (prescription) {
        prescription.medicines = prescription.medicines.filter(med => med.id !== action.payload.medicineId);
        prescription.totalPrice = calculateTotalPrice(prescription.medicines);
      }
    },
    
    updateMedicine: (state, action: PayloadAction<{ prescribeId: string; medicine: Medicine }>) => {
      const prescription = state.prescribeDrugs.find(drug => drug.id === action.payload.prescribeId);
      if (prescription) {
        const index = prescription.medicines.findIndex(med => med.id === action.payload.medicine.id);
        if (index !== -1) {
          prescription.medicines[index] = action.payload.medicine;
          prescription.totalPrice = calculateTotalPrice(prescription.medicines);
        }
      }
    }
  }
});

export const {
  addPrescribeDrug,
  selectPrescribeDrug,
  clearSelectedDrug,
  updatePrescribeDrug,
  deletePrescribeDrug,
  addMedicine,
  removeMedicine,
  updateMedicine
} = predrugSlice.actions;

export default predrugSlice.reducer;