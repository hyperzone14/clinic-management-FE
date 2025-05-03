import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../utils/axios-config';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import Title from '../components/common/Title';
import { FileManager } from '../redux/slices/examinationSlice';

interface LabTestDetail {
  id: number;
  patientName: string;
  examinationType: string;
  labDepartment: string;
  examinationResult: string | null;
  imageResponseDTO: Array<{
    id: number;
    url: string;
  }>;
}

const LabTestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const examId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const [labTest, setLabTest] = useState<LabTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageInfo, setImageInfo] = useState<Record<number, any[]>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<number, string[]>>({});
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const fetchLabTestDetail = async () => {
      if (!examId) {
        toast.error('Invalid lab test ID');
        navigate('/lab-tests');
        return;
      }

      try {
        const response = await apiService.get<LabTestDetail>(`/examination_detail/${examId}`);
        setLabTest(response);
        if (response.examinationResult) {
          setResult(response.examinationResult);
        }
      } catch (error) {
        console.error('Failed to fetch lab test details:', error);
        toast.error('Failed to load lab test details');
        navigate('/lab-tests');
      } finally {
        setLoading(false);
      }
    };

    fetchLabTestDetail();
  }, [examId, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrls[examId]) {
        previewUrls[examId].forEach((url: string) => URL.revokeObjectURL(url));
      }
    };
  }, [examId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!labTest) return;

    const files = Array.from(event.target.files || []);
    
    if (!files.length) return;
    
    if (files.some(file => !file.type.startsWith('image/'))) {
      toast.error('Please upload only image files');
      return;
    }

    // Only take the first file
    const file = files[0];

    if (previewUrls[examId]) {
      previewUrls[examId].forEach((url: string) => URL.revokeObjectURL(url));
    }

    const url = URL.createObjectURL(file);
    setPreviewUrls(prev => ({
      ...prev,
      [examId]: [url]
    }));

    const fileInfo = [{
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    }];

    FileManager.addFiles(examId, [file]);
    setImageInfo(prev => ({
      ...prev,
      [examId]: fileInfo
    }));
  };

  const handleRemoveImage = (index: number) => {
    if (!examId) return;

    const files = FileManager.getFiles(examId);
    if (!files) return;

    // Remove file from FileManager
    const newFiles = Array.from(files);
    newFiles.splice(index, 1);
    FileManager.addFiles(examId, newFiles);

    // Remove preview URL
    if (previewUrls[examId]) {
      URL.revokeObjectURL(previewUrls[examId][index]);
      const newUrls = [...previewUrls[examId]];
      newUrls.splice(index, 1);
      setPreviewUrls(prev => ({
        ...prev,
        [examId]: newUrls
      }));
    }

    // Remove file info
    if (imageInfo[examId]) {
      const newInfo = [...imageInfo[examId]];
      newInfo.splice(index, 1);
      setImageInfo(prev => ({
        ...prev,
        [examId]: newInfo
      }));
    }
  };

  const handleSubmit = async () => {
    if (!labTest || !examId) return;

    if (!result.trim()) {
      toast.error('Please provide examination result');
      return;
    }

    try {
      setLoading(true);

      const files = FileManager.getFiles(examId);
      
      if (!files || files.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }

      const formData = new FormData();
      
      const requestData = [{
        id: examId,
        examinationType: labTest.examinationType,
        examinationResult: result,
        imagesCount: files.length
      }];

      formData.append(
        'examinationDetailUploadImgRequestDTO',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );

      files.forEach(file => {
        formData.append('files', file);
      });

      await apiService.post('/examination_detail/images', formData);

      toast.success('Lab test results uploaded successfully');
      
      // Clear all resources
      setImageInfo({});
      FileManager.clear();
      
      if (previewUrls[examId]) {
        previewUrls[examId].forEach((url: string) => URL.revokeObjectURL(url));
      }
      setPreviewUrls({});

      // Navigate back to lab tests list immediately after successful upload
      navigate('/lab-tests', { replace: true });

    } catch (error) {
      console.error('Failed to upload lab test results:', error);
      toast.error('Failed to upload lab test results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!labTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-gray-500 mb-4">Lab test not found</p>
        <button
          onClick={() => navigate('/lab-tests')}
          className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
        >
          Back to Lab Tests
        </button>
      </div>
    );
  }

  const isComplete = Boolean(labTest.examinationResult && labTest.imageResponseDTO && labTest.imageResponseDTO.length > 0);

  return (
    <div className="w-full">
      <div className="mt-16">
        <h1 className="text-4xl font-bold font-sans my-5 text-center">
          LAB TEST DETAIL
        </h1>

        {/* Patient Information Section */}
        <div className="mt-10 mx-16">
          <Title id={13} />
          <div className="mt-10 mx-16 px-3">
            <div className="flex">
              <p className="font-bold text-2xl">Patient Name: </p>
              <span className="ms-12 text-2xl text-[#A9A9A9]">
                {labTest.patientName}
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 justify-between">
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Department: </p>
                <span className="ms-4 text-2xl text-[#A9A9A9]">
                  {labTest.labDepartment}
                </span>
              </div>
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Examination Type: </p>
                <span className="ms-4 text-2xl text-[#A9A9A9]">
                  {labTest.examinationType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Examination Results Section */}
        <div className="my-10 mx-16">
          <Title id={13} />
          <div className="mt-10 mx-16 px-3">
            <p className="font-bold text-2xl mb-4">Examination Results</p>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              disabled={isComplete}
              className="w-full p-4 border rounded-lg text-2xl text-[#A9A9A9] min-h-[200px] resize-none focus:ring-2 focus:ring-[#4567b7] focus:border-[#4567b7] disabled:bg-gray-50"
              placeholder="Enter examination result..."
            />
          </div>
        </div>

        {/* Examination Images Section */}
        <div className="my-10 mx-16">
          <Title id={13} />
          <div className="mt-10 mx-16 px-3">
            <div className="flex items-center justify-between mb-6">
              <p className="font-bold text-2xl">Examination Images</p>
            </div>

            {!isComplete && (!previewUrls[examId] || previewUrls[examId].length === 0) && (
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-base text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isComplete}
                  />
                </label>
              </div>
            )}

            {((previewUrls[examId] && previewUrls[examId].length > 0) || 
              (labTest.imageResponseDTO && labTest.imageResponseDTO.length > 0)) && (
              <div className="flex items-start">
                <div className="w-[300px] bg-white rounded-lg shadow-sm">
                  {labTest.imageResponseDTO?.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="h-[200px] rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt="Examination"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                  {previewUrls[examId]?.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="h-[200px] rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        {!isComplete && (
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons Section */}
        {!isComplete && (
          <div className="flex justify-center items-center gap-4 my-20">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-8 py-4 rounded-lg transition duration-300 ease-in-out text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload Results & Complete'
              )}
            </button>
            <button
              onClick={() => navigate('/lab-tests')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg transition duration-300 ease-in-out text-xl"
            >
              Back to Lab Tests
            </button>
          </div>
        )}

        {isComplete && (
          <div className="flex justify-center items-center my-20">
            <button
              onClick={() => navigate('/lab-tests')}
              className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
            >
              Back to Lab Tests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTestDetail; 