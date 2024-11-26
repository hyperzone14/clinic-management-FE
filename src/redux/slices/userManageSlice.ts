import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

interface User {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  // password: string;
  gender: string;
  address: string;
  birthDate: string;
  // role: string | null;
  // status: string | null;
}

interface NewUser extends Omit<User, "id"> {
  password: string;
}

interface UserManageState {
  users: User[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const initialState: UserManageState = {
  users: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
};

// interface FetchUsersParams {
//   page: number;
//   size: number;
// }

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

interface ApiError {
  message: string;
  status?: number;
}

export const fetchUsers = createAsyncThunk(
  "userManage/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      // First, fetch with page 0 and size 1 to get total elements
      const initialResponse = await apiService.get<PaginatedResponse>(
        `/patient?page=0&size=1`
      );

      const totalElements = initialResponse.result.totalElements;

      // Then fetch all records in a single request
      const response = await apiService.get<PaginatedResponse>(
        `/patient?page=0&size=${totalElements}`
      );

      return {
        content: response.result.content,
        totalElements: response.result.totalElements,
        totalPages: 1, // Since we're getting all data at once
        currentPage: 0,
        pageSize: totalElements,
      };
    } catch (err) {
      const error = err as ApiError;
      return rejectWithValue({
        message: error.message || "Failed to fetch all users",
        status: error.status,
      });
    }
  }
);

export const addUserAsync = createAsyncThunk(
  "userManage/addUser",
  async (userData: NewUser) => {
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

export const getUserById = createAsyncThunk(
  "userManage/getUserById",
  async (id: number) => {
    const response = await apiService.get<{ result: User }>(`/patient/${id}`);
    return response.result;
  }
);

const userManageSlice = createSlice({
  name: "userManage",
  initialState,
  reducers: {
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
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
      .addCase(
        fetchUsers.fulfilled,
        (
          state,
          action: PayloadAction<{
            content: User[];
            totalElements: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
          }>
        ) => {
          state.loading = false;
          state.users = action.payload.content;
          state.totalElements = action.payload.totalElements;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all users";
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
      })

      // Get user by id cases
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        const user = action.payload;
        state.users.push(user);
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get user";
      });
  },
});

export const { setPageSize, setCurrentPage, deleteUser } =
  userManageSlice.actions;
export default userManageSlice.reducer;
