import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";
import { toast } from "react-toastify";
import axios from "axios";

// Types
export interface Drug {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
}

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

export interface PrescribedDrugRequest {
  drugId: number;
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

export interface MedicalBill {
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
  finalDiagnosis: string | null;
  prescribedDrugs: any[];
  examinationDetails: any[];
}

interface MedicalBillState {
  currentBill: MedicalBill | null;
  availableDrugs: Drug[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicalBillState = {
  currentBill: null,
  availableDrugs: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchDrugs = createAsyncThunk(
  'medicalBill/fetchDrugs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ result: Drug[] }>('/drug');
      return response.result;
    } catch (error) {
      console.error('Drug fetch error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch drugs");
      }
      return rejectWithValue("Failed to fetch drugs");
    }
  }
);

export const fetchLatestMedicalBillByPatientId = createAsyncThunk(
  "medicalBill/fetchLatestByPatientId",
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalBill>(
        `/medical-bills/top/patient/${patientId}`
      );
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch latest medical bill");
      }
      return rejectWithValue("Failed to fetch latest medical bill");
    }
  }
);

export const fetchMedicalBillById = createAsyncThunk(
  "medicalBill/fetchById",
  async (billId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalBill>(
        `/medical-bills/${billId}`
      );
      return response;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch medical bill");
      }
      return rejectWithValue("Failed to fetch medical bill");
    }
  }
);

export const addDrugsToMedicalBill = createAsyncThunk(
  "medicalBill/addDrugs",
  async ({ 
    medicalBillId, 
    drugs,
    appointmentId 
  }: { 
    medicalBillId: number; 
    drugs: PrescribedDrugRequest[];
    appointmentId: number;
  }, { rejectWithValue }) => {
    try {
      // Validate drugs
      const invalidDrugs = drugs.some(drug => 
        !drug.drugId || !drug.dosage || !drug.duration || !drug.frequency
      );

      if (invalidDrugs) {
        toast.error('Please fill in all required drug information');
        return rejectWithValue('All drug fields must be filled');
      }

      // Add drugs to medical bill
      const response = await apiService.post<MedicalBill>(
        `/medical-bills/${medicalBillId}/drugs`,
        drugs
      );

      // Update appointment status to SUCCESS
      await apiService.put<void>(
        `/appointment/${appointmentId}/status`,
        "SUCCESS"
      );

      toast.success('Prescriptions added successfully');
      return response;
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        toast.error(`Failed to add prescriptions: ${message}`);
        return rejectWithValue(message);
      }
      toast.error('Failed to add prescriptions');
      return rejectWithValue('Failed to add prescriptions to medical bill');
    }
  }
);

export const updateMedicalBill = createAsyncThunk(
  "medicalBill/update",
  async ({ 
    id, 
    updates 
  }: { 
    id: number; 
    updates: Partial<MedicalBill>;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<MedicalBill>(
        `/medical-bills/${id}`,
        updates
      );
      toast.success('Medical bill updated successfully');
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        toast.error(`Failed to update medical bill: ${message}`);
        return rejectWithValue(message);
      }
      toast.error('Failed to update medical bill');
      return rejectWithValue('Failed to update medical bill');
    }
  }
);

const medicalBillSlice = createSlice({
  name: "medicalBill",
  initialState,
  reducers: {
    clearCurrentBill: (state) => {
      state.currentBill = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch drugs
      .addCase(fetchDrugs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugs.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDrugs = action.payload;
        state.error = null;
      })
      .addCase(fetchDrugs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch latest bill by patient ID
      .addCase(fetchLatestMedicalBillByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestMedicalBillByPatientId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
        state.error = null;
      })
      .addCase(fetchLatestMedicalBillByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentBill = null;
      })
      // Fetch bill by ID
      .addCase(fetchMedicalBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalBillById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
        state.error = null;
      })
      .addCase(fetchMedicalBillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentBill = null;
      })
      // Add drugs to medical bill
      .addCase(addDrugsToMedicalBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDrugsToMedicalBill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
        state.error = null;
      })
      .addCase(addDrugsToMedicalBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update medical bill
      .addCase(updateMedicalBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicalBill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
        state.error = null;
      })
      .addCase(updateMedicalBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentBill, setLoading } = medicalBillSlice.actions;

export default medicalBillSlice.reducer;