import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/store";
import Title from "../components/common/Title";
import { Loader2 } from "lucide-react";
import { fetchRecordById } from "../redux/slices/medicHistorySlice";

const API_BASE_URL = "https://clinic-management-vdb.onrender.com/api"; //https://clinic-management-vdb.onrender.com/api

const MedicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedRecord, loading, error } = useAppSelector(
    (state) => state.medicHistory
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchRecordById(Number(id)));
    }
  }, [dispatch, id]);

  const handleImageView = (imageId: number) => {
    window.open(`${API_BASE_URL}/images/download/${imageId}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] p-4'>
        <p className='text-red-500 mb-4'>{error}</p>
        <button
          onClick={() => dispatch(fetchRecordById(Number(id)))}
          className='bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out'
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedRecord) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] p-4'>
        <p className='text-gray-500 mb-4'>Record not found</p>
        <button
          onClick={() => navigate("/medical-history")}
          className='bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out'
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='mt-16'>
        <h1 className='text-4xl font-bold font-sans my-5 text-center'>
          MEDICAL RECORD DETAIL
        </h1>

        {/* Patient Information Section */}
        <div className='mt-10 mx-16'>
          <Title id={5} />
          <div className='mt-10 mx-16 px-3'>
            <div className='flex'>
              <p className='font-bold text-2xl'>Patient Name: </p>
              <span className='ms-12 text-2xl text-[#A9A9A9]'>
                {selectedRecord.patientName}
              </span>
            </div>

            <div className='mt-7 grid grid-cols-2 justify-between'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Birth Date: </p>
                <span className='ms-4 text-2xl text-[#A9A9A9]'>
                  {formatDate(selectedRecord.patientBirthDate)}
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Gender: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.patientGender}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Pre-assessment Information Section */}
        <div className='mt-10 mx-16'>
          <Title id={9} />
          <div className='mt-10 mx-16 px-3'>
            <div className='grid grid-cols-2 justify-between'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Weight: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.weight} kg
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Heart Rate: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.heartRate} bpm
                </span>
              </div>
            </div>

            <div className='mt-7 grid grid-cols-2 justify-between'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Blood Pressure: </p>
                <span className='ms-4 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.bloodPressure} mmHg
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Temperature: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.temperature} °C
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Information Section */}
        <div className='my-10 mx-16'>
          <Title id={6} />
          <div className='mt-10 mx-16 px-3'>
            <div className='grid grid-cols-2 justify-between'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Doctor Name: </p>
                <span className='ms-5 text-2xl text-[#A9A9A9]'>
                  {selectedRecord.doctorName}
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Visit Date: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {formatDate(selectedRecord.date)}
                </span>
              </div>
            </div>
            <div className='mt-7 flex'>
              <p className='font-bold text-2xl'>Syndrome: </p>
              <span className='ms-12 text-2xl text-[#A9A9A9] flex-1'>
                {selectedRecord.syndrome}
              </span>
            </div>
          </div>
        </div>

        {/* Prescribed Drugs Section */}
        <div className='my-10 mx-16'>
          <Title id={10} />
          <div className='mt-10 mx-16 px-3'>
            <p className='font-bold text-2xl mb-4'>Prescribed Drugs</p>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-6 py-3 text-left text-lg font-medium text-gray-500 tracking-wider'>
                      Drug Name
                    </th>
                    <th className='px-6 py-3 text-left text-lg font-medium text-gray-500 tracking-wider'>
                      Quantity
                    </th>
                    {/* <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 tracking-wider">Frequency</th> */}
                    <th className='px-6 py-3 text-left text-lg font-medium text-gray-500 tracking-wider'>
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {selectedRecord.prescribedDrugs.map((drug) => (
                    <tr key={drug.id}>
                      <td className='px-6 py-4 text-xl text-[#A9A9A9]'>
                        {drug.drugName}
                      </td>
                      <td className='px-6 py-4 text-xl text-[#A9A9A9]'>
                        {drug.dosage}
                      </td>
                      {/* <td className="px-6 py-4 text-xl text-[#A9A9A9]">{drug.duration} days</td>
                      <td className="px-6 py-4 text-xl text-[#A9A9A9]">{drug.frequency}</td> */}
                      <td className='px-6 py-4 text-xl text-[#A9A9A9]'>
                        {drug.specialInstructions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Examination Details */}
        {selectedRecord.examinationDetails &&
          selectedRecord.examinationDetails.length > 0 && (
            <div className='my-10 mx-16'>
              <Title id={12} />
              <div className='mt-10 mx-16 px-3'>
                <p className='font-bold text-2xl mb-4'>Examination Details</p>
                <div className='space-y-6'>
                  {selectedRecord.examinationDetails.map((exam) => (
                    <div key={exam.id} className='border rounded-lg p-6'>
                      <div className='grid grid-cols-2 gap-6'>
                        {exam.examinationType && (
                          <div className='flex'>
                            <p className='font-bold text-2xl'>Test Type: </p>
                            <span className='ms-4 text-2xl text-[#A9A9A9]'>
                              {exam.examinationType}
                            </span>
                          </div>
                        )}
                        {exam.examinationResult && (
                          <div className='flex'>
                            <p className='font-bold text-2xl'>Result: </p>
                            <span className='ms-4 text-2xl text-[#A9A9A9]'>
                              {exam.examinationResult}
                            </span>
                          </div>
                        )}
                      </div>

                      {exam.imageResponseDTO &&
                        exam.imageResponseDTO.length > 0 && (
                          <div className='mt-6'>
                            <p className='font-bold text-2xl mb-4'>
                              Examination Images
                            </p>
                            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                              {exam.imageResponseDTO.map((image) => (
                                <div key={image.id} className='relative group'>
                                  <div
                                    className='aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'
                                    onClick={() => handleImageView(image.id)}
                                  >
                                    <img
                                      src={`${API_BASE_URL}/images/download/${image.id}`}
                                      alt={image.fileName}
                                      className='object-cover w-full h-full'
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = "/placeholder-image.png";
                                        target.onerror = null;
                                      }}
                                    />
                                  </div>
                                  <div className='mt-2'>
                                    <span className='text-xl text-[#A9A9A9] truncate'>
                                      {image.fileName}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Doctor Final conclude & Note */}
        {(selectedRecord.note && selectedRecord.note.trim() !== "") ||
        selectedRecord.finalDiagnosis ||
        selectedRecord.nextAppointmentDate ? (
          <div className='my-10 mx-16'>
            <Title id={11} />
            <div className='mt-10 mx-16 px-3'>
              {selectedRecord.finalDiagnosis && (
                <div className='flex mb-5'>
                  <p className='font-bold text-2xl'>Final Diagnosis: </p>
                  <span className='ms-12 text-2xl text-[#A9A9A9]'>
                    {selectedRecord.finalDiagnosis}
                  </span>
                </div>
              )}

              {selectedRecord.nextAppointmentDate && (
                <div className='flex mb-5 items-center'>
                  <p className='font-bold text-2xl'>Next Appointment: </p>
                  <span className='ms-5 text-2xl text-[#A9A9A9]'>
                    {formatDate(selectedRecord.nextAppointmentDate)}
                  </span>
                </div>
              )}

              {selectedRecord.note && selectedRecord.note.trim() !== "" && (
                <>
                  <p className='font-bold text-2xl mb-4'>Doctor Note</p>
                  <div className='p-4 rounded-md'>
                    <p className='text-2xl text-[#A9A9A9] whitespace-pre-wrap'>
                      {selectedRecord.note}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* Back Button */}
        <div className='flex justify-center items-center my-20'>
          <button
            onClick={() => navigate(-1)}
            className='bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out'
          >
            Back to History
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicDetail;
