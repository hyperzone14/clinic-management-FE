import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/axios-config';
import { toast } from 'react-toastify';
import axios from 'axios';

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
}

interface ExaminationDetail {
  id: number;
  examinationType: string;
  examinationResult: string;
  imageResponseDTOS?: ImageResponse[];
}

interface MedicalBill {
  id: number;
  patientName: string;
  doctorName: string;
  examinationDetails: ExaminationDetail[];
  patientId?: number;
}

interface ExaminationResponse {
  id: number;
  patientName: string;
  doctorName: string;
  examinationType: string;
  examinationResult: string;
  imageResponseDTO: ImageResponse[];
}

interface ExaminationState {
  medicalBill: MedicalBill | null;
  loading: boolean;
  error: string | null;
  imageInfo: Record<number, ImageInfo[]>;
  examResults: Record<number, string>;
  uploadedResults: ExaminationResponse[];
}

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

const initialState: ExaminationState = {
  medicalBill: null,
  loading: false,
  error: null,
  imageInfo: {},
  examResults: {},
  uploadedResults: []
};

export const fetchMedicalBillByPatientId = createAsyncThunk(
    'examination/fetchMedicalBill',
    async (patientId: number) => {
      const response = await apiService.get<MedicalBill>(`/medical-bills/top/patient/${patientId}`);
      return response;  // Usually response should contain the data directly
    }
  );

  export const uploadLabResults = createAsyncThunk(
    'examination/uploadResults',
    async ({ medicalBill, appointmentId }: { medicalBill: MedicalBill; appointmentId: string }, { getState, rejectWithValue }) => {
      try {
        const state = getState() as { examination: ExaminationState };
        const formData = new FormData();
  
        Object.entries(state.examination.imageInfo).forEach(([examId, files]) => {
          const actualFiles = FileManager.getFiles(Number(examId));
          actualFiles.forEach(file => {
            formData.append(`files`, file);
          });
  
          const examDetail = medicalBill.examinationDetails.find(
            detail => detail.id === Number(examId)
          );
          formData.append('examinationDetailUploadImgRequestDTO', JSON.stringify({
            id: Number(examId),
            examinationType: examDetail?.examinationType || '',
            examinationResult: state.examination.examResults[Number(examId)] || '',
            imagesCount: actualFiles.length
          }));
        });
  
        const axiosResponse = await axios.post(
          'http://localhost:8080/api/medical-bills/images',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
            }
          }
        );
  
        await apiService.put(`/appointments/${appointmentId}/status`, "LAB_TEST_COMPLETED");
        FileManager.clear();
        return axiosResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message || error.message);
        }
        return rejectWithValue('Failed to upload results');
      }
    }
  );

const examinationSlice = createSlice({
  name: 'examination',
  initialState,
  reducers: {
    clearExamination: (state) => {
      FileManager.clear();
      return initialState;
    },
    updateImageInfo: (state, action: PayloadAction<{ examId: number; fileInfo: ImageInfo[] }>) => {
      const { examId, fileInfo } = action.payload;
      state.imageInfo[examId] = fileInfo;
      FileManager.addFiles(examId, fileInfo as unknown as File[]);
    },
    updateExamResult: (state, action: PayloadAction<{ examId: number; result: string }>) => {
      const { examId, result } = action.payload;
      state.examResults[examId] = result;
    },
    initializeExamResults: (state, action: PayloadAction<ExaminationDetail[]>) => {
      action.payload.forEach((exam: ExaminationDetail) => {
        if (exam.examinationResult) {
          state.examResults[exam.id] = exam.examinationResult;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalBillByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalBillByPatientId.fulfilled, (state, action: PayloadAction<MedicalBill>) => {
        state.loading = false;
        state.medicalBill = action.payload;
        if (action.payload?.examinationDetails) {
          state.examResults = action.payload.examinationDetails.reduce<Record<number, string>>(
            (acc: Record<number, string>, exam: ExaminationDetail) => ({
              ...acc,
              [exam.id]: exam.examinationResult || ''
            }), 
            {}
          );
        }
       })
      .addCase(fetchMedicalBillByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch medical bill';
      })
      .addCase(uploadLabResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadLabResults.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedResults = [action.payload.data];
        toast.success('Lab results uploaded successfully');
      })
      .addCase(uploadLabResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });
  }
});

export const { 
  clearExamination, 
  updateImageInfo, 
  updateExamResult,
  initializeExamResults 
} = examinationSlice.actions;

export const selectExamination = (state: { examination: ExaminationState }) => state.examination;

export default examinationSlice.reducer;