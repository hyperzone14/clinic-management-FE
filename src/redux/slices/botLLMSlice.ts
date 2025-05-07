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

export const getPredictionsLLM = createAsyncThunk(
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
    clearPredictionsLLM: (state) => {
      state.predictions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPredictionsLLM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPredictionsLLM.fulfilled,
        (state, action: PayloadAction<BotLLM[]>) => {
          state.predictions = action.payload;
          state.loading = false;
        }
      )
      .addCase(getPredictionsLLM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch predictions";
      });
  },
});

export const { clearPredictionsLLM } = botLLMSlice.actions;
export default botLLMSlice.reducer;
