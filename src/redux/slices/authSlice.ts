import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";
import { JwtUtils } from "../../utils/security/jwt/JwtUtils";

interface AuthState {
  id: string | null;
  email: string | null;
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  id: null,
  email: null,
  username: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for login
// export const login = createAsyncThunk(
//   "auth/login",
//   async (
//     { email, password }: { email: string; password: string },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await apiService.post<{
//         code: number;
//         result: { id: string; token: string };
//       }>("/auth/login", { email, password });

//       if (response.code === 200) {
//         const { id, token } = response.result;
//         localStorage.setItem("token", token);
//         return { id, token, email };
//       }

//       return rejectWithValue("Invalid credentials");
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || "Login failed");
//     }
//   }
// );
export const login = createAsyncThunk(
  "auth/login",
  async (
    {
      email,
      password,
      rememberMe,
    }: {
      email: string;
      password: string;
      rememberMe: boolean;
    },
    { rejectWithValue }
  ) => {
    const response = await apiService.post<{
      code: number;
      result: { id: string; token: string };
    }>("/auth/login", { email, password });

    if (response.code === 200) {
      const { id, token } = response.result;
      JwtUtils.setToken(token, rememberMe); // Use the updated setToken method
      return { id, token, email };
    }

    return rejectWithValue("Invalid credentials");
  }
);

// Async thunk for logout
export const logout = createAsyncThunk("auth/logout", async () => {
  JwtUtils.clearAll(); // This will clear token, email, and username from both storages
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        id: string;
        email: string;
        username: string;
        token: string;
      }>
    ) => {
      const { id, email, username, token } = action.payload;
      state.id = id;
      state.email = email;
      state.username = username;
      state.token = token;
      state.isAuthenticated = true;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { id, token, email } = action.payload;
        state.id = id;
        state.email = email;
        state.token = token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.id = null;
        state.email = null;
        state.token = null;
        state.username = null;
        state.isAuthenticated = false;
      });
  },
});

// Exporting actions
export const { setCredentials, setUserId, setUserName, setUserEmail } =
  authSlice.actions;
export default authSlice.reducer;
