// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import apiService from "../../utils/axios-LLM-config";

// // Define the structure of a single prediction
// interface BotLLM {
//   disease: string;
//   probability: number;
// }

// // Define the structure of the API response
// interface ApiResponse {
//   success: boolean;
//   input: string;
//   predictions: BotLLM[];
// }

// // Define the state structure
// interface BotLLMState {
//   predictions: BotLLM[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: BotLLMState = {
//   predictions: [],
//   loading: false,
//   error: null,
// };

// export const getPredictionsLLM = createAsyncThunk(
//   "botLLM/getPredictions",
//   async (symptoms: string) => {
//     const response = await apiService.post<ApiResponse>("/api_LLM/predict", {
//       symptoms: symptoms,
//     });
//     return response.predictions;
//   }
// );

// const botLLMSlice = createSlice({
//   name: "botLLM",
//   initialState,
//   reducers: {
//     clearPredictionsLLM: (state) => {
//       state.predictions = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getPredictionsLLM.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(
//         getPredictionsLLM.fulfilled,
//         (state, action: PayloadAction<BotLLM[]>) => {
//           state.predictions = action.payload;
//           state.loading = false;
//         }
//       )
//       .addCase(getPredictionsLLM.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || "Failed to fetch predictions";
//       });
//   },
// });

// export const { clearPredictionsLLM } = botLLMSlice.actions;
// export default botLLMSlice.reducer;

// Updated botLLMSlice.ts
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
  input?: string;
  predictions?: BotLLM[];
  message?: string; // Add message field for error responses
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

export const getPredictionsLLM = createAsyncThunk<
  BotLLM[], // Return type
  string, // Input type (symptoms)
  { rejectValue: string } // ThunkAPI config with custom error type
>("botLLM/getPredictions", async (symptoms: string, { rejectWithValue }) => {
  try {
    const response = await apiService.post<ApiResponse>("/api_LLM/predict", {
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

const botLLMSlice = createSlice({
  name: "botLLM",
  initialState,
  reducers: {
    clearPredictionsLLM: (state) => {
      state.predictions = [];
      state.error = null;
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
          state.error = null;
        }
      )
      .addCase(getPredictionsLLM.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch predictions";
      });
  },
});

export const { clearPredictionsLLM } = botLLMSlice.actions;
export default botLLMSlice.reducer;
