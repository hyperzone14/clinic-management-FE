import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchMedicalBillByPatientId,
  uploadLabResults,
  updateImageInfo,
  updateExamResult,
  clearExamination,
  selectExamination,
  FileManager
} from '../redux/slices/examinationSlice';
import Title from '../components/common/Title';

interface LocationState {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
}

const ExaminationDetail = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { medicalBill, loading, imageInfo, examResults } = useAppSelector(selectExamination);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string[]>>({});

  // Use location state if it's available
  const locationState = location.state as LocationState;
  const appointmentIdFromState = locationState?.appointmentId;

  // Determine which appointment ID to use
  const appointmentIdToUse = appointmentId || appointmentIdFromState;

  useEffect(() => {
    if (!appointmentIdToUse) {
      toast.error('Invalid appointment ID');
      navigate('/examination');
      return;
    }

    if (!locationState?.appointmentId || Number(appointmentIdToUse) !== locationState.appointmentId) {
      toast.error(`Invalid appointment data: expected ${locationState?.appointmentId}, but got ${appointmentIdToUse}`);
      navigate('/examination');
      return;
    }

    if (!locationState?.patientId) {
      toast.error('No patient information provided');
      navigate('/examination');
      return;
    }

    const fetchData = async () => {
      try {
        await dispatch(fetchMedicalBillByPatientId(locationState.patientId)).unwrap();
      } catch (error) {
        toast.error('Failed to load examination details');
        navigate('/examination');
      }
    };

    fetchData();

    return () => {
      Object.values(previewUrls).flat().forEach(url => URL.revokeObjectURL(url));
      dispatch(clearExamination());
    };
  }, [appointmentIdToUse, locationState, dispatch, navigate]);

  if (!locationState) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Invalid navigation state</p>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, examId: number) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;
    
    if (files.some(file => !file.type.startsWith('image/'))) {
      toast.error('Please upload only image files');
      return;
    }

    if (previewUrls[examId]) {
      previewUrls[examId].forEach(url => URL.revokeObjectURL(url));
    }

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

  const handleResultChange = (examId: number, result: string) => {
    dispatch(updateExamResult({ examId, result }));
  };

  const handleSubmit = async () => {
    try {
      // Convert appointmentIdToUse to a string
      const appointmentIdString = String(appointmentIdToUse);
  
      if (!appointmentIdString) {
        toast.error('Invalid appointment ID');
        return;
      }
  
      if (!medicalBill?.id) {
        toast.error('Invalid medical bill data');
        return;
      }
  
      const missingResults = medicalBill.examinationDetails.some(
        (exam) => !examResults[exam.id]?.trim()
      );
  
      if (missingResults) {
        toast.error('Please provide examination results for all tests');
        return;
      }
  
      const missingFiles = medicalBill.examinationDetails.some(
        (exam) => !imageInfo[exam.id] || imageInfo[exam.id].length === 0
      );
  
      if (missingFiles) {
        toast.error('Please upload images for all examinations');
        return;
      }
  
      await dispatch(uploadLabResults({ 
        medicalBill, 
        appointmentId: appointmentIdString  // Pass as a string
      })).unwrap();
  
      toast.success('Examination results uploaded successfully');
      navigate('/examination');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to upload examination results');
    }
  };

  if (!locationState) {
    return (
      <div className="flex justify-center items-center min-h-screen" role="alert">
        <p className="text-xl text-gray-600">Invalid navigation state</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" aria-busy="true" role="status">
        <span className="sr-only">Loading examination details...</span>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!medicalBill) {
    return (
      <div className="flex justify-center items-center min-h-screen" role="alert">
        <p className="text-xl text-gray-600">No examination details available</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full">
        <main className="mt-16" role="main" aria-labelledby="page-title">
          <h1 id="page-title" className="text-4xl font-bold font-sans my-5 text-center">
            Laboratory Examination
          </h1>

          <div className="mt-10 mx-16">
            <Title id={5} />
            <div className="mt-10 mx-16 px-3">
              <dl className="space-y-4">
                <div className="flex items-center">
                  <dt className="font-bold text-2xl">Patient Name</dt>
                  <dd className="ms-12 text-2xl text-[#A9A9A9]">
                    {locationState.patientName}
                  </dd>
                </div>

                <div className="flex items-center">
                  <dt className="font-bold text-2xl">Doctor Name</dt>
                  <dd className="ms-4 text-2xl text-[#A9A9A9]">
                    {locationState.doctorName}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10 mx-16">
            <Title id={6} />
            <div className="mt-10 mx-16 px-3">
              {medicalBill.examinationDetails.map((exam) => (
                <section 
                  key={exam.id} 
                  className="mb-8 p-6 bg-white rounded-lg shadow-md"
                  aria-labelledby={`exam-${exam.id}-title`}
                >
                  <h2 
                    id={`exam-${exam.id}-title`}
                    className="font-bold text-2xl mb-4"
                  >
                    {exam.examinationType}
                  </h2>

                  <div className="mt-6">
                    <label 
                      htmlFor={`result-${exam.id}`} 
                      className="font-bold text-2xl block mb-4"
                    >
                      Examination Result
                    </label>
                    <textarea
                      id={`result-${exam.id}`}
                      value={examResults[exam.id] || ''}
                      onChange={(e) => handleResultChange(exam.id, e.target.value)}
                      className="w-full p-4 border rounded-lg text-xl min-h-[100px] mb-6 resize-none"
                      placeholder="Enter examination result..."
                      aria-required="true"
                    />
                  </div>

                  <div className="mt-6">
                    <label 
                      htmlFor={`files-${exam.id}`} 
                      className="font-bold text-2xl block mb-4"
                    >
                      Upload Images
                    </label>
                    <input
                      id={`files-${exam.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, exam.id)}
                      className="w-full p-2 border rounded text-xl"
                      aria-required="true"
                    />

                    {imageInfo[exam.id]?.length > 0 && previewUrls[exam.id] && (
                      <ul 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
                        aria-label={`Uploaded images for ${exam.examinationType}`}
                      >
                        {imageInfo[exam.id].map((file, index) => (
                          <li key={index} className="relative">
                            <figure>
                              <img
                                src={previewUrls[exam.id][index]}
                                alt={`Preview of ${file.name}`}
                                className="w-full h-40 object-cover rounded"
                              />
                              <figcaption className="text-xl text-[#A9A9A9] mt-2 block truncate">
                                {file.name}
                              </figcaption>
                            </figure>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}

              <div className="flex justify-center items-center my-20">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Results & Complete'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ExaminationDetail;