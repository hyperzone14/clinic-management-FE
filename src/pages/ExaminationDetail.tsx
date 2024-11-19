import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchMedicalBillByPatientId,
  uploadLabResults,
  updateImageInfo,
  clearExamination,
  selectExamination,
  FileManager
} from '../redux/slices/examinationSlice';
import Title from '../components/common/Title';

const ExaminationDetail = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { medicalBill, loading, imageInfo } = useAppSelector(selectExamination);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (location.state?.patientId) {
        await dispatch(fetchMedicalBillByPatientId(location.state.patientId));
      }
    };
    fetchData();

    return () => {
      // Cleanup object URLs and clear examination
      Object.values(previewUrls).flat().forEach(url => URL.revokeObjectURL(url));
      dispatch(clearExamination());
    };
  }, [dispatch, location.state?.patientId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, examId: number) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;
    
    if (files.some(file => !file.type.startsWith('image/'))) {
      toast.error('Please upload only image files');
      return;
    }

    // Clean up old preview URLs
    if (previewUrls[examId]) {
      previewUrls[examId].forEach(url => URL.revokeObjectURL(url));
    }

    // Create new preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => ({
      ...prev,
      [examId]: urls
    }));

    const fileInfo = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    }));

    FileManager.addFiles(examId, files);
    dispatch(updateImageInfo({ examId, fileInfo }));
  };

  const handleSubmit = async () => {
    try {
      if (!medicalBill) return;
      
      await dispatch(uploadLabResults({ 
        medicalBill, 
        appointmentId: appointmentId || '' 
      })).unwrap();
      
      navigate('/examination');
    } catch (error) {
      // Error handling is managed by the slice
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mt-16">
        <h1 className="text-4xl font-bold font-sans my-5 text-center">
          LABORATORY EXAMINATION
        </h1>

        <div className="mt-10 mx-16">
          <Title id={5} />
          <div className="mt-10 mx-16 px-3">
            <div className="flex">
              <p className="font-bold text-2xl">Patient Name: </p>
              <span className="ms-12 text-2xl text-[#A9A9A9]">
                {medicalBill?.patientName}
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 justify-between">
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Doctor Name: </p>
                <span className="ms-4 text-2xl text-[#A9A9A9]">
                  {medicalBill?.doctorName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 mx-16">
          <Title id={6} />
          <div className="mt-10 mx-16 px-3">
          {medicalBill?.examinationDetails?.map((exam) => (
            <div key={exam.id} className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <div className="flex mb-4">
                <p className="font-bold text-2xl">Test Type: </p>
                <span className="ms-4 text-2xl text-[#A9A9A9]">
                    {exam.examinationType}
                </span>
                </div>

                <div className="mt-6">
                <p className="font-bold text-2xl mb-4">Upload Images</p>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, exam.id)}
                    className="w-full p-2 border rounded text-xl"
                />

                {imageInfo[exam.id]?.length > 0 && previewUrls[exam.id] && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {imageInfo[exam.id].map((file, index) => (
                        <div key={index} className="relative">
                            <img
                                src={previewUrls[exam.id][index]}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-40 object-cover rounded"
                            />
                            <span className="text-xl text-[#A9A9A9] mt-2 block truncate">
                                {file.name}
                            </span>
                        </div>
                    ))}
                </div>
                )}
                </div>
            </div>
            ))}

            <div className="flex justify-center items-center my-20">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out text-xl"
              >
                Upload Results & Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationDetail;