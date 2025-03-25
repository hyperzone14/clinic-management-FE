import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../utils/axios-config";

interface Doctor {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string;
  status: string;
  departmentId: number;
  workingDays: string[];
}

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
  searchTerm: string;
}

const initialState: DoctorState = {
  doctors: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 10,
  },
  searchTerm: "",
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
      pageNumber: number;
      pageSize: number;
      sort: Sort;
      offset: number;
      paged: boolean;
    };
    totalElements: number;
    totalPages: number;
  };
}

interface SearchDoctorsPagination {
  code: number;
  message: string;
  result: {
    content: Doctor[];
    totalPages: number;
    totalElements: number;
    size: number;
  };
}

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async () => {
    const response = await apiService.get<PaginatedResponse>("/doctor");
    // Extract the content array from the nested response
    return response.result.content.map((doctor) => ({
      id: doctor.id,
      fullName: doctor.fullName || "",
      citizenId: doctor.citizenId || "",
      email: doctor.email || "",
      gender: doctor.gender || "",
      address: doctor.address || "",
      birthDate: doctor.birthDate || "",
      role: doctor.role,
      status: doctor.status,
      departmentId: doctor.departmentId,
      workingDays: doctor.workingDays || [],
    }));
  }
);

export const fetchDoctorsPagination = createAsyncThunk(
  "doctor/searchDoctorsPagination",
  async ({ page, searchTerm }: { page: number; searchTerm?: string }) => {
    let url = `/doctor?page=${page}`;
    if (searchTerm) {
      url += `&size=1000000000`;
    } else {
      url += `&size=10`;
    }

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    const response = await apiService.get<SearchDoctorsPagination>(url);

    return {
      doctors: response.result.content,
      page,
      totalPages: response.result.totalPages,
      totalElements: response.result.totalElements,
      pageSize: response.result.size,
    };
  }
);

export const addDoctorAsync = createAsyncThunk(
  "doctor/addDoctor",
  async (doctorData: Omit<Doctor, "id">) => {
    const response = await apiService.post<{ result: Doctor }>(
      "/doctor",
      doctorData
    );
    return response.result;
  }
);

export const updateDoctorAsync = createAsyncThunk(
  "doctor/updateDoctor",
  async (doctorData: Doctor) => {
    const response = await apiService.put<{ result: Doctor }>(
      `/doctor/${doctorData.id}`,
      doctorData
    );
    return response.result;
  }
);

export const getDoctorById = createAsyncThunk(
  "doctor/getDoctorById",
  async (doctorId: number) => {
    const response = await apiService.get<{ result: Doctor }>(
      `/doctor/${doctorId}`
    );
    return response.result;
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<Doctor>) => {
      const index = state.doctors.findIndex(
        (doctor) => doctor.id === action.payload.id
      );
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
    deleteDoctor: (state, action: PayloadAction<number>) => {
      state.doctors = state.doctors.filter(
        (doctor) => doctor.id !== action.payload
      );
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.currentPage = 0;
    },
    clearSearch: (state) => {
      state.searchTerm = "";
      state.pagination.currentPage = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDoctors.fulfilled,
        (state, action: PayloadAction<Doctor[]>) => {
          state.loading = false;
          state.doctors = action.payload;
        }
      )
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch doctors";
      })
      // Add doctor cases
      .addCase(addDoctorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addDoctorAsync.fulfilled,
        (state, action: PayloadAction<Doctor>) => {
          state.loading = false;
          state.doctors.push(action.payload);
        }
      )
      .addCase(addDoctorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add doctor";
      })
      // Update doctor cases
      .addCase(updateDoctorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateDoctorAsync.fulfilled,
        (state, action: PayloadAction<Doctor>) => {
          state.loading = false;
          const index = state.doctors.findIndex(
            (doctor) => doctor.id === action.payload.id
          );
          if (index !== -1) {
            state.doctors[index] = action.payload;
          }
        }
      )
      .addCase(updateDoctorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update doctor";
      })

      // Get doctor by ID cases
      .addCase(getDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDoctorById.fulfilled,
        (state, action: PayloadAction<Doctor>) => {
          state.loading = false;
          const index = state.doctors.findIndex(
            (doctor) => doctor.id === action.payload.id
          );
          if (index !== -1) {
            // Update existing doctor
            state.doctors[index] = action.payload;
          } else {
            // If doctor not in list, add to the list
            state.doctors.push(action.payload);
          }
        }
      )
      .addCase(getDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch doctor by ID";
      })

      // Search doctors cases
      .addCase(fetchDoctorsPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorsPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          pageSize: action.payload.pageSize,
        };
      })
      .addCase(fetchDoctorsPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search doctors";
      });
  },
});

export const { setDoctors, deleteDoctor, setSearchTerm, clearSearch } =
  doctorSlice.actions;
export default doctorSlice.reducer;
