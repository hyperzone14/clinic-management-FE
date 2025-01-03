import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/axios-config";

interface Doctor {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
  departmentId: number;
  workingDays: string[];
}

interface NewDoctor extends Omit<Doctor, "id"> {
  password: string;
}

interface DoctorManageState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const initialState: DoctorManageState = {
  doctors: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
};

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface PaginatedResponse {
  result: {
    content: Doctor[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      offset: number;
      pageNumber: number;
      pageSize: number;
      paged: boolean;
      sort: Sort;
    };
    // size: number;
    // sort: Sort;
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

export const fetchDoctors = createAsyncThunk(
  "doctorManage/fetcDoctors",
  async (_, { rejectWithValue }) => {
    try {
      // First, fetch with page 0 and size 1 to get total elements
      const initialResponse = await apiService.get<PaginatedResponse>(
        `/doctor?page=0&size=1`
      );

      const totalElements = initialResponse.result.totalElements;

      // Then fetch all records in a single request
      const response = await apiService.get<PaginatedResponse>(
        `/doctor?page=0&size=${totalElements}`
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
        message: error.message || "Failed to fetch all doctors",
        status: error.status,
      });
    }
  }
);

export const addDoctor = createAsyncThunk(
  "doctorManage/addDoctor",
  async (doctorData: NewDoctor) => {
    const response = await apiService.post<{ result: Doctor }>(
      "/doctor",
      doctorData
    );
    return response.result;
  }
);

export const updateDoctor = createAsyncThunk(
  "doctorManage/updateDoctor",
  async (doctorData: Doctor) => {
    const response = await apiService.put<{ result: Doctor }>(
      `/doctor/${doctorData.id}`,
      doctorData
    );
    return response.result;
  }
);

export const getDoctorById = createAsyncThunk(
  "doctorManage/getDoctorById",
  async (id: number) => {
    const response = await apiService.get<{ result: Doctor }>(`/doctor/${id}`);
    return response.result;
  }
);

const doctorManageSlice = createSlice({
  name: "doctorManage",
  initialState,
  reducers: {
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    deleteDoctor: (state, action: PayloadAction<number>) => {
      state.doctors = state.doctors.filter(
        (doctor) => doctor.id !== action.payload
      );
    },
    clearDoctor: (state) => {
      state.doctors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDoctors.fulfilled,
        (
          state,
          action: PayloadAction<{
            content: Doctor[];
            totalElements: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
          }>
        ) => {
          state.loading = false;
          state.doctors = action.payload.content;
          state.totalElements = action.payload.totalElements;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all doctors";
      })

      .addCase(addDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.loading = false;
        state.doctors.push(action.payload);
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add doctor";
      })

      .addCase(
        updateDoctor.fulfilled,
        (state, action: PayloadAction<Doctor>) => {
          // const updatedDoctor = action.payload;
          state.loading = false;
          const index = state.doctors.findIndex(
            (doctor) => doctor.id === action.payload.id
          );
          if (index !== -1) {
            state.doctors[index] = action.payload;
          }
        }
      )
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update doctor";
      })
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDoctorById.fulfilled, (state, action) => {
        const doctor = action.payload;
        state.doctors.push(doctor);
      })
      .addCase(getDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch doctor";
      })
      .addCase(getDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
  },
});

export const { setPageSize, setCurrentPage, deleteDoctor, clearDoctor } =
  doctorManageSlice.actions;
export default doctorManageSlice.reducer;
