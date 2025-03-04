import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

// Interfaces
export interface PaymentResponse {
  status: string;
  message: string;
  url: string;
}

export interface PaymentState {
  cashPaymentSelected: boolean;
  paymentUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  paymentStatus: "idle" | "loading" | "succeeded" | "failed";
}

// Initial State
const initialState: PaymentState = {
  cashPaymentSelected: false,
  paymentUrl: null,
  isProcessing: false,
  error: null,
  paymentStatus: "idle",
};

// Async Thunks
export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<PaymentResponse>(
        `/payment/create_payment/${appointmentId}`
      );
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create payment");
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  "payment/checkPaymentStatus",
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{
        result: { appointmentStatus: string };
      }>(`/appointment/${appointmentId}`);
      return response.result.appointmentStatus;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to check payment status");
    }
  }
);

// Slice
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.paymentUrl = null;
      state.isProcessing = false;
      state.error = null;
      state.paymentStatus = "idle";
    },
    setCashPaymentSelected: (state, action) => {
      state.cashPaymentSelected = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Payment Reducers
    builder.addCase(createPayment.pending, (state) => {
      state.isProcessing = true;
      state.error = null;
      state.paymentStatus = "loading";
    });
    builder.addCase(createPayment.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.paymentUrl = action.payload.url;
      state.paymentStatus = "succeeded";
    });
    builder.addCase(createPayment.rejected, (state, action) => {
      state.isProcessing = false;
      state.error = action.payload as string;
      state.paymentStatus = "failed";
    });

    // Check Payment Status Reducers
    builder.addCase(checkPaymentStatus.pending, (state) => {
      state.isProcessing = true;
      state.error = null;
      state.paymentStatus = "loading";
    });
    builder.addCase(checkPaymentStatus.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.paymentStatus =
        action.payload === "CONFIRMED" || action.payload === "CHECKED_IN"
          ? "succeeded"
          : "failed";
    });
    builder.addCase(checkPaymentStatus.rejected, (state, action) => {
      state.isProcessing = false;
      state.error = action.payload as string;
      state.paymentStatus = "failed";
    });
  },
});

export const { resetPaymentState, setCashPaymentSelected } =
  paymentSlice.actions;

export default paymentSlice.reducer;
