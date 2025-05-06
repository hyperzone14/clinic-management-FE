import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-LLM-config";

// Define the structure of a single prediction
interface BotLLM {
  disease: string;
  probability: number;
}

// Define the structure of the API response
interface ApiResponse {
  success: boolean;
  input: string;
  predictions: BotLLM[];
}

// Define the state structure
interface BotLLMState {
  predictions: BotLLM[];
  loading: boolean;
  error: string | null;
}

const initialState: BotLLMState = {
  predictions: [],
  loading: false,
  error: null,
};

export const getPredictions = createAsyncThunk(
  "botLLM/getPredictions",
  async (symptoms: string) => {
    const response = await apiService.post<ApiResponse>("/api_LLM/predict", {
      symptoms: symptoms,
    });
    return response.predictions;
  }
);

const botLLMSlice = createSlice({
  name: "botLLM",
  initialState,
  reducers: {
    clearPredictions: (state) => {
      state.predictions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPredictions.fulfilled,
        (state, action: PayloadAction<BotLLM[]>) => {
          state.predictions = action.payload;
          state.loading = false;
        }
      )
      .addCase(getPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch predictions";
      });
  },
});

export const { clearPredictions } = botLLMSlice.actions;
export default botLLMSlice.reducer;
