import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config"; // Import your API service

interface User {
  id: number;
  name: string;
  citizenID: string;
  email: string;
  gender: string;
  address: string;
  DoB: string;
  role: string;
  status: string;
}

interface UserManageState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserManageState = {
  users: [],
  loading: false,
  error: null,
};

// Async thunk to fetch users from API
export const fetchUsers = createAsyncThunk(
  "userManage/fetchUsers",
  async () => {
    const response = await apiService.get<User[]>("/patient");
    return response;
  }
);

const userManageSlice = createSlice({
  name: "userManage",
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    setUserManage(state, action: PayloadAction<User>) {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser(state, action: PayloadAction<number>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      });
  },
});

export const { addUser, updateUser, setUserManage, deleteUser } =
  userManageSlice.actions;
export default userManageSlice.reducer;
