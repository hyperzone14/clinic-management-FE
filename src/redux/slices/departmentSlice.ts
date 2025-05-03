import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

interface Doctor {
  id: number;
  fullName: string;
  citizenId: number;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string;
  status: string;
  departmentId: number;
  workingDays: string[];
}

interface Department {
  id: number;
  name: string;
  doctors: Doctor[];
}

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};
interface ApiResponse {
  code: number;
  message: string;
  result: Department[]; // Direct array instead of paginated structure
}

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async () => {
    try {
      const response = await apiService.get<ApiResponse>("/department");
      // console.log("API Response:", response);

      // Since result is directly an array, we can map it directly
      return response.result.map((department) => ({
        id: department.id,
        name: department.name || "",
        doctors:
          department.doctors?.map((doctor) => ({
            id: doctor.id,
            fullName: doctor.fullName || "",
            citizenId: doctor.citizenId || 0,
            email: doctor.email || "",
            gender: doctor.gender || "",
            address: doctor.address || "",
            birthDate: doctor.birthDate || "",
            role: doctor.role || "",
            status: doctor.status || "",
            departmentId: doctor.departmentId || 0,
            workingDays: doctor.workingDays || [],
          })) || [],
      }));
    } catch (error) {
      console.error("Error in fetchDepartments:", error);
      throw error;
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  "department/fetchDepartmentById",
  async (departmentId: number) => {
    try {
      const response = await apiService.get<{ result: Department }>(
        `/department/${departmentId}`
      );
      return response.result;
    } catch (error) {
      console.error("Error in fetchDepartmentById:", error);
      throw error;
    }
  }
);

export const addDepartmentAsync = createAsyncThunk(
  "department/addDepartment",
  async (departmentData: Omit<Department, "id" | "doctors">) => {
    const response = await apiService.post<{ result: Department }>(
      "authz/department",
      departmentData
    );
    return response.result;
  }
);

export const updateDepartmentAsync = createAsyncThunk(
  "department/updateDepartment",
  async (departmentData: Omit<Department, "doctors">) => {
    const response = await apiService.put<{ result: Department }>(
      `authz/department/${departmentData.id}`,
      departmentData
    );
    return response.result;
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(
        (department) => department.id === action.payload.id
      );
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
    deleteDepartment: (state, action: PayloadAction<number>) => {
      state.departments = state.departments.filter(
        (department) => department.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state, action: PayloadAction<Department[]>) => {
          state.loading = false;
          state.departments = action.payload;
        }
      )
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch departments";
      })
      // Add department cases
      .addCase(addDepartmentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addDepartmentAsync.fulfilled,
        (state, action: PayloadAction<Department>) => {
          state.loading = false;
          state.departments.push(action.payload);
        }
      )
      .addCase(addDepartmentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add department";
      })
      // Update department cases
      .addCase(updateDepartmentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateDepartmentAsync.fulfilled,
        (state, action: PayloadAction<Department>) => {
          state.loading = false;
          const index = state.departments.findIndex(
            (department) => department.id === action.payload.id
          );
          if (index !== -1) {
            state.departments[index] = action.payload;
          }
        }
      )
      .addCase(updateDepartmentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update department";
      });
  },
});

export const { setDepartments, deleteDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
