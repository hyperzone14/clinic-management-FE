// redux/slices/medicHistorySlide.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { medicalHistoryData } from '../../utils/medicHistoryData';

export interface Medicine {
  medicine_name: string;
  quantity: number;
  note: string;
  price: number;
}

export interface Examination {
  lab_test?: string;
  test_result?: string;
}

export interface MedicalRecord {
  id: string;
  symptoms: string;
  doctorName: string;
  date: string;
  image: string;
  treatment_medicine: Medicine[];
  examination: Examination;
  doctor_feedback: string;
}

export interface MedicalHistoryState {
  records: MedicalRecord[];
  filteredRecords: MedicalRecord[];
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  filterDoctor: string;
  filterDate: string;
}

const initialState: MedicalHistoryState = {
  records: medicalHistoryData,
  filteredRecords: medicalHistoryData,
  currentPage: 1,
  itemsPerPage: 4,
  searchTerm: '',
  filterDoctor: '',
  filterDate: ''
};

const medicHistorySlice = createSlice({
  name: 'medicHistory',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
      
      let filtered = state.records;
      
      if (action.payload) {
        filtered = filtered.filter(record => 
          record.symptoms.toLowerCase().includes(action.payload.toLowerCase())
        );
      }
      
      if (state.filterDoctor) {
        filtered = filtered.filter(record => record.doctorName === state.filterDoctor);
      }
      
      if (state.filterDate) {
        filtered = filtered.filter(record => {
          const filterDate = new Date(state.filterDate).toISOString().split('T')[0];
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === filterDate;
        });
      }
      
      state.filteredRecords = filtered;
    },
    
    setFilterDoctor: (state, action: PayloadAction<string>) => {
      state.filterDoctor = action.payload;
      state.currentPage = 1;
      
      let filtered = state.records;
      
      if (action.payload) {
        filtered = filtered.filter(record => record.doctorName === action.payload);
      }
      
      if (state.searchTerm) {
        filtered = filtered.filter(record => 
          record.symptoms.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
      }
      
      if (state.filterDate) {
        filtered = filtered.filter(record => {
          const filterDate = new Date(state.filterDate).toISOString().split('T')[0];
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === filterDate;
        });
      }
      
      state.filteredRecords = filtered;
    },
    
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.filterDate = action.payload;
      state.currentPage = 1;
      
      let filtered = state.records;
      
      if (action.payload) {
        filtered = filtered.filter(record => {
          const filterDate = new Date(action.payload).toISOString().split('T')[0];
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === filterDate;
        });
      }
      
      if (state.searchTerm) {
        filtered = filtered.filter(record => 
          record.symptoms.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
      }
      
      if (state.filterDoctor) {
        filtered = filtered.filter(record => record.doctorName === state.filterDoctor);
      }
      
      state.filteredRecords = filtered;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    clearFilters: (state) => {
      state.searchTerm = '';
      state.filterDoctor = '';
      state.filterDate = '';
      state.currentPage = 1;
      state.filteredRecords = state.records;
    }
  }
});

export const { 
  setSearchTerm, 
  setFilterDoctor, 
  setFilterDate, 
  setCurrentPage,
  clearFilters
} = medicHistorySlice.actions;

export default medicHistorySlice.reducer;