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
}

const initialState: DoctorState = {
  doctors: [],
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
      });
  },
});

export const { setDoctors, deleteDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
