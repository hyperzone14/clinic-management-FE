import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-Train-config";

interface BotTrain {
  disease: string;
  confidence: string;
}

interface ApiResponse {
  success: boolean;
  input?: string;
  predictions?: BotTrain[];
  message?: string; // Add message field for error responses
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

export const getPredictionsTrain = createAsyncThunk<
  BotTrain[], // Return type
  string, // Input type (symptoms)
  { rejectValue: string } // ThunkAPI config with custom error type
>("botTrain/getPredictions", async (symptoms: string, { rejectWithValue }) => {
  try {
    const response = await apiService.post<ApiResponse>("/api_Train/predict", {
      symptoms: symptoms,
    });

    // Check if the API returned success: false
    if (!response.success) {
      return rejectWithValue(response.message || "Unknown error occurred");
    }

    return response.predictions || [];
  } catch (error: any) {
    // Get error message from axios interceptor's error.details
    if (error.details?.message) {
      return rejectWithValue(error.details.message);
    }

    // Fallback error message
    return rejectWithValue(error.message || "Failed to fetch predictions");
  }
});

const botTrainSlice = createSlice({
  name: "botTrain",
  initialState,
  reducers: {
    clearPredictionsTrain: (state) => {
      state.predictions = [];
      state.error = null;
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
          state.error = null;
        }
      )
      .addCase(getPredictionsTrain.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch predictions";
      });
  },
});

export const { clearPredictionsTrain } = botTrainSlice.actions;
export default botTrainSlice.reducer;
