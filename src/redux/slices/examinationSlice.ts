import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/axios-config';
import { toast } from 'react-toastify';
import axios from 'axios';

// Interfaces
interface ImageInfo {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

interface ImageResponse {
  id: number;
  fileName: string;
  downloadUrl: string;
  fileType: string;
}

interface ExaminationDetail {
  id: number;
  examinationType: string;
  examinationResult: string | null;
  imageResponseDTO?: ImageResponse[];
  doctorName: string;
  patientName: string;
}

interface MedicalBill {
  id: number;
  patientName: string;
  doctorName: string;
  examinationDetails: ExaminationDetail[];
  patientId: number;
  doctorId: number;
  date: string;
  syndrome: string;
  note?: string;
}

interface ExaminationDetailUploadImgRequestDTO {
  id: number;
  examinationType: string;
  examinationResult: string;
  imagesCount: number;
}

interface ExaminationState {
  medicalBill: MedicalBill | null;
  loading: boolean;
  error: string | null;
  imageInfo: Record<number, ImageInfo[]>;
  examResults: Record<number, string>;
  uploadedResults: ImageResponse[];
}

// File Manager for handling file uploads
export class FileManager {
  private static fileMap = new Map<string, File>();

  static addFiles(examId: number, files: File[]) {
    files.forEach((file, index) => {
      this.fileMap.set(`exam_${examId}_file_${index}`, file);
    });
  }

  static getFiles(examId: number): File[] {
    const files: File[] = [];
    let index = 0;
    while (true) {
      const file = this.fileMap.get(`exam_${examId}_file_${index}`);
      if (!file) break;
      files.push(file);
      index++;
    }
    return files;
  }

  static clear() {
    this.fileMap.clear();
  }
}

const initialState: ExaminationState = {
  medicalBill: null,
  loading: false,
  error: null,
  imageInfo: {},
  examResults: {},
  uploadedResults: []
};

// Async Thunks
export const fetchMedicalBillByPatientId = createAsyncThunk(
  'examination/fetchMedicalBill',
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<MedicalBill>(`/medical-bills/top/patient/${patientId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        toast.error(message);
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to fetch medical bill');
    }
  }
);

export const uploadLabResults = createAsyncThunk(
  'examination/uploadResults',
  async ({ medicalBill, appointmentId }: { medicalBill: MedicalBill; appointmentId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { examination: ExaminationState };
      const formData = new FormData();

      // Create the request DTO with the correct structure
      const requestData: ExaminationDetailUploadImgRequestDTO[] = medicalBill.examinationDetails.map(detail => {
        const actualFiles = FileManager.getFiles(Number(detail.id));
        return {
          id: detail.id,
          examinationType: detail.examinationType,
          examinationResult: state.examination.examResults[detail.id] || '',
          imagesCount: actualFiles.length
        };
      });

      // Add the request DTO with the correct key
      formData.append(
        'examinationDetailUploadImgRequestDTO',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );

      // Add all files
      medicalBill.examinationDetails.forEach(detail => {
        const actualFiles = FileManager.getFiles(Number(detail.id));
        actualFiles.forEach(file => {
          formData.append('files', file);
        });
      });

      // Log formData for debugging
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }

      const response = await axios.post(
        'http://localhost:8080/api/examination_detail/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
          }
        }
      );

      await apiService.put<void>(
        `/appointment/${appointmentId}/status`,
        "LAB_TEST_COMPLETED"
      );
      FileManager.clear();
      
      toast.success('Lab results uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        toast.error(message);
        return rejectWithValue(message);
      }
      toast.error('Failed to upload results');
      return rejectWithValue('Failed to upload results');
    }
  }
);

// Slice
const examinationSlice = createSlice({
  name: 'examination',
  initialState,
  reducers: {
    clearExamination: (state) => {
      FileManager.clear();
      return initialState;
    },
    updateImageInfo: (state, action: PayloadAction<{ examId: number; fileInfo: ImageInfo[] }>) => {
      state.imageInfo[action.payload.examId] = action.payload.fileInfo;
    },
    updateExamResult: (state, action: PayloadAction<{ examId: number; result: string }>) => {
      state.examResults[action.payload.examId] = action.payload.result;
    },
    initializeExamResults: (state, action: PayloadAction<ExaminationDetail[]>) => {
      state.examResults = action.payload.reduce((acc, exam) => ({
        ...acc,
        [exam.id]: exam.examinationResult || ''
      }), {});
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalBillByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalBillByPatientId.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalBill = action.payload;
        if (action.payload?.examinationDetails) {
          state.examResults = action.payload.examinationDetails.reduce(
            (acc, exam) => ({
              ...acc,
              [exam.id]: exam.examinationResult || ''
            }),
            {}
          );
        }
      })
      .addCase(fetchMedicalBillByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      .addCase(uploadLabResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadLabResults.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedResults = action.payload;
        toast.success('Lab results uploaded successfully');
      })
      .addCase(uploadLabResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error || 'Failed to upload lab results');
      });
  }
});

// Actions
export const {
  clearExamination,
  updateImageInfo,
  updateExamResult,
  initializeExamResults
} = examinationSlice.actions;

// Selectors
export const selectExamination = (state: { examination: ExaminationState }) => state.examination;

// Reducer
export default examinationSlice.reducer;