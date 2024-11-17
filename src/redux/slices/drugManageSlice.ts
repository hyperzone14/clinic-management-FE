import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

interface Drug {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
}

interface DrugManageState {
  drugs: Drug[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DrugManageState = {
  drugs: [],
  loading: false,
  error: null,
};

// Async thunks for CRUD operations

// Fetch all drugs
export const fetchDrugs = createAsyncThunk(
  "drugManage/fetchDrugs",
  async () => {
    const data = await apiService.get<{ result: Drug[] }>("/drug");
    return data.result;
  }
);

// Add a new drug
export const addDrug = createAsyncThunk(
  "drugManage/addDrug",
  async (newDrug: Omit<Drug, "id">) => {
    const data = await apiService.post<{ result: Drug }>("/drug", newDrug);
    return data.result;
  }
);

// Update an existing drug
export const updateDrug = createAsyncThunk(
  "drugManage/updateDrug",
  async (updatedDrug: Drug) => {
    await apiService.put(`/drug/${updatedDrug.id}`, updatedDrug);
    return updatedDrug; // Returning the updated drug directly
  }
);

// Delete a drug
export const deleteDrug = createAsyncThunk(
  "drugManage/deleteDrug",
  async (id: number) => {
    await apiService.delete(`/drug/${id}`);
    return id; // Returning the deleted drug ID
  }
);

const drugSlice = createSlice({
  name: "drugManage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Drugs
      .addCase(fetchDrugs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugs.fulfilled, (state, action: PayloadAction<Drug[]>) => {
        state.loading = false;
        state.drugs = action.payload;
      })
      .addCase(fetchDrugs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch drugs";
      })
      // Add Drug
      .addCase(addDrug.fulfilled, (state, action: PayloadAction<Drug>) => {
        state.drugs.push(action.payload);
      })
      // Update Drug
      .addCase(updateDrug.fulfilled, (state, action: PayloadAction<Drug>) => {
        const index = state.drugs.findIndex(
          (drug) => drug.id === action.payload.id
        );
        if (index !== -1) {
          state.drugs[index] = action.payload;
        }
      })
      // Delete Drug
      .addCase(deleteDrug.fulfilled, (state, action: PayloadAction<number>) => {
        state.drugs = state.drugs.filter((drug) => drug.id !== action.payload);
      });
  },
});

export default drugSlice.reducer;
