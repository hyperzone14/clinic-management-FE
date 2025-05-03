import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

// Types
export interface ImageResponse {
  id: number;
  fileName: string;
  downloadUrl: string;
}

export interface PrescribedDrug {
  id: number;
  drugName: string;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

export interface ExaminationDetail {
  id: number;
  patientName: string;
  doctorName: string;
  examinationType: string;
  examinationResult: string;
  imageResponseDTO: ImageResponse[];
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientGender: string;
  patientBirthDate: string;
  doctorId: number;
  doctorName: string;
  date: string;
  syndrome: string;
  note: string;
  weight: number;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  finalDiagnosis: string;
  nextAppointmentDate: string | null;
  prescribedDrugs: PrescribedDrug[];
  examinationDetails: ExaminationDetail[];
}

interface PaginatedResponse {
  content: MedicalRecord[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface MedicalHistoryState {
  records: MedicalRecord[];
  filteredRecords: MedicalRecord[];
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  filterDoctor: string;
  filterDate: string;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  selectedRecord: MedicalRecord | null;
}

const initialState: MedicalHistoryState = {
  records: [],
  filteredRecords: [],
  currentPage: 1,
  itemsPerPage: 4,
  searchTerm: "",
  filterDoctor: "",
  filterDate: "",
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
  selectedRecord: null,
};
// interface NestedPaginatedResponse {
//   content: {
//     content: MedicalRecord[];
//     pageable: {
//       pageNumber: number;
//       pageSize: number;
//       sort: {
//         empty: boolean;
//         sorted: boolean;
//         unsorted: boolean;
//       };
//     };
//     last: boolean;
//     totalElements: number;
//     totalPages: number;
//     size: number;
//     number: number;
//     sort: {
//       empty: boolean;
//       sorted: boolean;
//       unsorted: boolean;
//     };
//     first: boolean;
//     numberOfElements: number;
//     empty: boolean;
//   };
// }

// Async Thunks
export const fetchMedicalRecords = createAsyncThunk(
  "medicHistory/fetchRecords",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { medicHistory: MedicalHistoryState };
      const { currentPage, itemsPerPage } = state.medicHistory;

      const response = await apiService.get<PaginatedResponse>(
        `/medical-bills?page=${currentPage - 1}&size=${itemsPerPage}`
      );

      return {
        content: response.content,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        currentPage: response.number + 1,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch records");
    }
  }
);

export const fetchRecordById = createAsyncThunk(
  "medicHistory/fetchRecordById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalRecord>(
        `/medical-bills/${id}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch record");
    }
  }
);

export const fetchMedicalRecordsByPatient = createAsyncThunk(
  "medicHistory/fetchByPatient",
  async (patientName: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalRecord[]>(
        `/medical-bills/patient/${encodeURIComponent(patientName)}`
      );
      return {
        content: response,
        totalPages: 1,
        totalElements: response.length,
        currentPage: 1,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch records by patient"
      );
    }
  }
);

export const fetchMedicalRecordsByPatientId = createAsyncThunk(
  "medicHistory/fetchByPatientId",
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<PaginatedResponse>(
        `/medical-bills/patient/id/${patientId}`
      );

      // Extract the array of records directly from the response
      const records = Array.isArray(response) ? response : response.content;

      return {
        content: records,
        totalPages: 1, // Since we're getting all records at once
        totalElements: records.length,
        currentPage: 1, // Default to page 1 since we're not paginating
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch records by patient ID"
      );
    }
  }
);

export const fetchMedicalRecordsByDoctor = createAsyncThunk(
  "medicHistory/fetchByDoctor",
  async (doctorName: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalRecord[]>(
        `/medical-bills/doctor/${encodeURIComponent(doctorName)}`
      );
      return {
        content: response,
        totalPages: 1,
        totalElements: response.length,
        currentPage: 1,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch records by doctor"
      );
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  "medicHistory/createRecord",
  async (record: Omit<MedicalRecord, "id">, { rejectWithValue }) => {
    try {
      const response = await apiService.post<MedicalRecord>(
        "/medical-bills",
        record
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to create record");
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  "medicHistory/updateRecord",
  async (
    { id, record }: { id: number; record: Partial<MedicalRecord> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<MedicalRecord>(
        `/medical-bills/${id}`,
        record
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to update record");
    }
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  "medicHistory/deleteRecord",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/medical-bills/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to delete record");
    }
  }
);

const medicHistorySlice = createSlice({
  name: "medicHistory",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setFilterDoctor: (state, action: PayloadAction<string>) => {
      state.filterDoctor = action.payload;
      state.currentPage = 1;
    },
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.filterDate = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = "";
      state.filterDoctor = "";
      state.filterDate = "";
      state.currentPage = 1;
    },
    setSelectedRecord: (state, action: PayloadAction<MedicalRecord | null>) => {
      state.selectedRecord = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.content;
        state.filteredRecords = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.records = [];
        state.filteredRecords = [];
      })
      .addCase(fetchRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedRecord = null;
      })
      .addCase(fetchMedicalRecordsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.content;
        state.filteredRecords = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMedicalRecordsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMedicalRecordsByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordsByPatientId.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.content;
        state.filteredRecords = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMedicalRecordsByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMedicalRecordsByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordsByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.content;
        state.filteredRecords = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMedicalRecordsByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
        state.filteredRecords = [...state.records];
        state.totalElements += 1;
      })
      .addCase(updateMedicalRecord.fulfilled, (state, action) => {
        const index = state.records.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
          state.filteredRecords = [...state.records];
        }
      })
      .addCase(deleteMedicalRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
        state.filteredRecords = [...state.records];
        state.totalElements -= 1;
      });
  },
});

export const {
  setSearchTerm,
  setFilterDoctor,
  setFilterDate,
  setCurrentPage,
  clearFilters,
  setSelectedRecord,
} = medicHistorySlice.actions;

export default medicHistorySlice.reducer;
