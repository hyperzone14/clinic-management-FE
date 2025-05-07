import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-Train-config";

interface BotTrain {
  disease: string;
  confidence: string;
}

interface ApiResponse {
  predictions: BotTrain[];
}

interface BotTrainState {
  predictions: BotTrain[];
  loading: boolean;
  error: string | null;
}

const initialState: BotTrainState = {
  predictions: [],
  loading: false,
  error: null,
};

export const getPredictionsTrain = createAsyncThunk(
  "botTrain/getPredictions",
  async (symptoms: string) => {
    const response = await apiService.post<ApiResponse>("/api_Train/predict", {
      symptoms: symptoms,
    });
    return response.predictions;
  }
);

const botTrainSlice = createSlice({
  name: "botTrain",
  initialState,
  reducers: {
    clearPredictionsTrain: (state) => {
      state.predictions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPredictionsTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPredictionsTrain.fulfilled,
        (state, action: PayloadAction<BotTrain[]>) => {
          state.predictions = action.payload;
          state.loading = false;
        }
      )
      .addCase(getPredictionsTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch predictions";
      });
  },
});

export const { clearPredictionsTrain } = botTrainSlice.actions;
export default botTrainSlice.reducer;
