import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from "../../utils/axios-config";
import { updateAppointmentStatus, fetchAppointments } from './scheduleSlice';
import { Gender } from './scheduleSlice';
import { toast } from "react-toastify";
import axios from 'axios';

// Interfaces
export interface Drug {
  id: number;
  name: string;
  standardDosage: string;
  drugFunction: string;
  unit: number;
  sideEffect: string;
}

export interface PrescribedDrug {
  drugId: number;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export interface ExaminationDetail {
  examinationType: string;
  examinationResult: string;
  imagesCount: number;
  imageInfo?: FileMetadata[];
}

export interface UpdateExaminationFilesPayload {
  index: number;
  fileInfo: FileMetadata[];
}

export interface PatientInfo {
  patientId: number;
  patientName: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface DoctorInfo {
  doctorId: number;
  doctorName: string;
}

interface MedicalBillResponse {
  id?: number;
  status?: string;
  message?: string;
}

// File Manager
export class FileManager {
  private static fileMap = new Map<string, File>();

  static addFiles(examIndex: number, files: File[]) {
    files.forEach((file, fileIndex) => {
      const key = `exam_${examIndex}_file_${fileIndex}`;
      this.fileMap.set(key, file);
    });
  }

  static getFiles(examIndex: number): File[] {
    const files: File[] = [];
    let fileIndex = 0;
    while (true) {
      const key = `exam_${examIndex}_file_${fileIndex}`;
      const file = this.fileMap.get(key);
      if (!file) break;
      files.push(file);
      fileIndex++;
    }
    return files;
  }

  static clear() {
    this.fileMap.clear();
  }
}

interface TreatmentState {
  patientInfo: PatientInfo;
  doctorInfo: DoctorInfo;
  appointmentId: number;
  date: string;
  syndrome: string;
  note: string;
  prescribedDrugRequestDTOS: PrescribedDrug[];
  examinationDetailRequestDTOS: ExaminationDetail[];
  availableDrugs: Drug[];
  loading: boolean;
  error: string | null;
}

const initialState: TreatmentState = {
  patientInfo: {
    patientId: 0,
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
  },
  doctorInfo: {
    doctorId: 0,
    doctorName: '',
  },
  appointmentId: 0,
  date: new Date().toISOString().split('T')[0],
  syndrome: '',
  note: '',
  prescribedDrugRequestDTOS: [],
  examinationDetailRequestDTOS: [],
  availableDrugs: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchDrugs = createAsyncThunk(
  'treatment/fetchDrugs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ result: Drug[] }>('/drug');
      return response.result;
    } catch (error) {
      console.error('Drug fetch error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch drugs');
    }
  }
);

export const submitTreatment = createAsyncThunk(
  'treatment/submit',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { treatment: TreatmentState };

      // Validate required fields
      if (!state.treatment.syndrome.trim()) {
        toast.error('Please enter syndrome');
        return rejectWithValue('Syndrome is required');
      }

      if (state.treatment.prescribedDrugRequestDTOS.length === 0) {
        toast.error('Please add at least one prescribed drug');
        return rejectWithValue('At least one prescription is required');
      }

      const hasFiles = state.treatment.examinationDetailRequestDTOS.some(exam =>
        exam.imagesCount > 0
      );

      let response: MedicalBillResponse;

      if (hasFiles) {
        const formData = new FormData();

        const medicalBillData = new Blob([JSON.stringify({
          patientId: state.treatment.patientInfo.patientId,
          doctorId: state.treatment.doctorInfo.doctorId,
          date: state.treatment.date,
          syndrome: state.treatment.syndrome,
          note: state.treatment.note,
          prescribedDrugRequestDTOS: state.treatment.prescribedDrugRequestDTOS,
          examinationDetailRequestDTOS: state.treatment.examinationDetailRequestDTOS.map(
            ({ imageInfo, ...rest }) => rest
          )
        })], {
          type: 'application/json'
        });

        formData.append('medicalBillData', medicalBillData);

        state.treatment.examinationDetailRequestDTOS.forEach((exam, examIndex) => {
          const files = FileManager.getFiles(examIndex);
          files.forEach(file => {
            formData.append('files', file);
          });
        });

        const axiosResponse = await axios.post<MedicalBillResponse>(
          'http://localhost:8080/api/medical-bills/images',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(localStorage.getItem('token') ? {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              } : {})
            }
          }
        );
        response = axiosResponse.data;
      } else {
        const medicalBillData = {
          patientId: state.treatment.patientInfo.patientId,
          doctorId: state.treatment.doctorInfo.doctorId,
          date: state.treatment.date,
          syndrome: state.treatment.syndrome,
          note: state.treatment.note,
          prescribedDrugRequestDTOS: state.treatment.prescribedDrugRequestDTOS,
          examinationDetailRequestDTOS: state.treatment.examinationDetailRequestDTOS.map(
            ({ imageInfo, ...rest }) => rest
          )
        };

        const apiResponse = await apiService.post<MedicalBillResponse>('/medical-bills', medicalBillData);
        response = apiResponse;
      }

      // Update appointment status
      await apiService.put<void>(
        `/appointment/${state.treatment.appointmentId}/status`,
        "SUCCESS"
      );

      await dispatch(fetchAppointments());

      FileManager.clear();
      toast.success('Medical bill created successfully');
      return response;

    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        toast.error(`Failed to create medical bill: ${message}`);
        return rejectWithValue(message);
      }
      toast.error('Failed to create medical bill');
      return rejectWithValue('Failed to complete operation');
    }
  }
);

export const initializeTreatmentAsync = createAsyncThunk(
  'treatment/initializeAsync',
  async (data: {
    patientId: number;
    patientName: string;
    doctorId: number;
    doctorName: string;
    appointmentId: number;
    appointmentDate: string;
    gender: Gender;
    birthDate: string;
  }, { dispatch }) => {
    try {
      dispatch(initializeTreatment(data));
      await dispatch(fetchDrugs()).unwrap();
      return data;
    } catch (error) {
      console.error('Treatment initialization error:', error);
      throw error;
    }
  }
);

// Slice
const treatmentSlice = createSlice({
  name: 'treatment',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    initializeTreatment: (state, action: PayloadAction<{
      patientId: number;
      patientName: string;
      doctorId: number;
      doctorName: string;
      appointmentId: number;
      appointmentDate: string;
      gender: Gender;
      birthDate: string;
    }>) => {
      const { patientId, patientName, doctorId, doctorName, appointmentId, appointmentDate, gender, birthDate } = action.payload;
      state.patientInfo = {
        patientId,
        patientName,
        dateOfBirth: birthDate,
        gender,
      };
      state.doctorInfo = {
        doctorId,
        doctorName,
      };
      state.appointmentId = appointmentId;
      state.date = appointmentDate;
      state.syndrome = '';
      state.note = '';
      state.prescribedDrugRequestDTOS = [];
      state.examinationDetailRequestDTOS = [];
    },

    setSyndrome: (state, action: PayloadAction<string>) => {
      state.syndrome = action.payload;
    },

    setNote: (state, action: PayloadAction<string>) => {
      state.note = action.payload;
    },

    addPrescribedDrug: (state, action: PayloadAction<PrescribedDrug>) => {
      state.prescribedDrugRequestDTOS.push(action.payload);
    },

    updatePrescribedDrug: (state, action: PayloadAction<{
      index: number;
      updates: Partial<PrescribedDrug>;
    }>) => {
      const { index, updates } = action.payload;
      if (state.prescribedDrugRequestDTOS[index]) {
        state.prescribedDrugRequestDTOS[index] = {
          ...state.prescribedDrugRequestDTOS[index],
          ...updates
        };
      }
    },

    removePrescribedDrug: (state, action: PayloadAction<number>) => {
      state.prescribedDrugRequestDTOS.splice(action.payload, 1);
    },

    addExamination: (state, action: PayloadAction<ExaminationDetail>) => {
      state.examinationDetailRequestDTOS.push(action.payload);
    },

    updateExamination: (state, action: PayloadAction<{
      index: number;
      updates: Partial<ExaminationDetail>;
    }>) => {
      const { index, updates } = action.payload;
      if (state.examinationDetailRequestDTOS[index]) {
        state.examinationDetailRequestDTOS[index] = {
          ...state.examinationDetailRequestDTOS[index],
          ...updates
        };
      }
    },

    updateExaminationFiles: (state, action: PayloadAction<UpdateExaminationFilesPayload>) => {
      const { index, fileInfo } = action.payload;
      if (state.examinationDetailRequestDTOS[index]) {
        state.examinationDetailRequestDTOS[index].imageInfo = fileInfo;
        state.examinationDetailRequestDTOS[index].imagesCount = fileInfo.length;
      }
    },

    removeExamination: (state, action: PayloadAction<number>) => {
      state.examinationDetailRequestDTOS.splice(action.payload, 1);
    },

    resetTreatment: () => {
      FileManager.clear();
      return initialState;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDrugs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugs.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDrugs = action.payload;
      })
      .addCase(fetchDrugs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTreatment.fulfilled, (state) => {
        return initialState;
      })
      .addCase(submitTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  initializeTreatment,
  setSyndrome,
  setNote,
  addPrescribedDrug,
  updatePrescribedDrug,
  removePrescribedDrug,
  addExamination,
  updateExamination,
  updateExaminationFiles,
  removeExamination,
  resetTreatment,
  setLoading
} = treatmentSlice.actions;

export const selectTreatment = (state: { treatment: TreatmentState }) => state.treatment;

export default treatmentSlice.reducer;