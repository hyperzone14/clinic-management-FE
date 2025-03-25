import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

// Define the doctor response structure from the API
interface DoctorResponseDTO {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string;
  status: string;
}

// Define feedback structure based on API response
interface Feedback {
  rating: number;
  comment: string;
  doctorResponseDTO?: DoctorResponseDTO;
}

interface FeedbackState {
  feedbacks: Feedback[];
  currentFeedback: Feedback | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

// API response structure
interface ApiResponse {
  code: number;
  message: string;
  result: Feedback[] | Feedback;
}

// Payload for posting feedback
interface FeedbackPayload {
  appointmentId: number;
  feedbackData: {
    rating: number;
    comment: string;
  };
}

// Initial state
const initialState: FeedbackState = {
  feedbacks: [],
  currentFeedback: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  },
};

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Async thunk for posting feedback
export const postFeedback = createAsyncThunk(
  "feedback/postFeedback",
  async (payload: FeedbackPayload, { rejectWithValue }) => {
    try {
      const { appointmentId, feedbackData } = payload;
      const response = await apiService.post<ApiResponse>(
        `/feedback/${appointmentId}`,
        feedbackData
      );
      return Array.isArray(response.result)
        ? response.result
        : [response.result];
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.message ||
        "An error occurred";

      // Return the full error message to handle specific cases in the component
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk for getting feedback by doctor ID
export const getFeedbackByDoctorId = createAsyncThunk(
  "feedback/getFeedbackByDoctorId",
  async (doctorId: number) => {
    // try {
    const response = await apiService.get<ApiResponse>(
      `/api/feedback/doctor/${doctorId}`
    );

    // return response.result;
    return Array.isArray(response.result) ? response.result : [response.result];
    // }
    // catch (error) {
    //   const errorMessage = error instanceof Error
    //     ? error.message
    //     : "An error occurred";
    //   return rejectWithValue(errorMessage);
    // }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    resetFeedbackState: (state) => {
      state.currentFeedback = null;
      state.error = null;
      state.success = false;
    },
    setCurrentFeedback: (state, action: PayloadAction<Feedback>) => {
      state.currentFeedback = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Post feedback cases
    builder
      .addCase(postFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(postFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.feedbacks = action.payload; // action.payload is now always Feedback[]
      })
      .addCase(postFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to submit feedback";
        state.success = false;
      });

    // Get feedback by doctor ID cases
    builder
      .addCase(getFeedbackByDoctorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeedbackByDoctorId.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload; // Type is now inferred as Feedback[]
      })
      .addCase(getFeedbackByDoctorId.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch feedback";
      });
  },
});

export const { resetFeedbackState, setCurrentFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
