import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config"; // Import your API service
// import { AxiosResponse } from "axios";

interface User {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string | null;
  status: string | null;
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

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface PaginatedResponse {
  result: {
    content: User[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: Sort;
      offset: number;
      paged: boolean;
    };
    totalElements: number;
    totalPages: number;
  };
  code: number;
  message: string;
}

// Async thunk to fetch users from API
export const fetchUsers = createAsyncThunk(
  "userManage/fetchUsers",
  async () => {
    const response = await apiService.get<PaginatedResponse>("/patient");
    // Extract the content array from the nested response
    return response.result.content.map((user) => ({
      id: user.id,
      fullName: user.fullName || "",
      citizenId: user.citizenId || "",
      email: user.email || "",
      gender: user.gender || "",
      address: user.address || "",
      birthDate: user.birthDate || "",
      role: user.role,
      status: user.status,
    }));
  }
);

// Async thunk to add a new user
export const addUserAsync = createAsyncThunk(
  "userManage/addUser",
  async (userData: Omit<User, "id">) => {
    const response = await apiService.post<{ result: User }>(
      "/patient",
      userData
    );
    return response.result;
  }
);

// Async thunk to update an existing user
export const updateUserAsync = createAsyncThunk(
  "userManage/updateUser",
  async (userData: User) => {
    const response = await apiService.put<{ result: User }>(
      `/patient/${userData.id}`,
      userData
    );
    return response.result;
  }
);

const userManageSlice = createSlice({
  name: "userManage",
  initialState,
  reducers: {
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
      // Fetch users
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
      })
      // Add user cases
      .addCase(addUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add user";
      })
      // Update user cases
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUserAsync.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          const index = state.users.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      )
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update user";
      });
  },
});

export const { setUserManage, deleteUser } = userManageSlice.actions;
export default userManageSlice.reducer;
