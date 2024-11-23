import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import Title from '../components/common/Title';
import { Plus, Trash2, ClipboardList, UserCircle, Calendar, Pill } from 'lucide-react';
import {
  fetchLatestMedicalBillByPatientId,
  addDrugsToMedicalBill,
  PrescribedDrugRequest,
  fetchDrugs
} from '../redux/slices/medicalBillSlice';
import { toast, ToastContainer } from 'react-toastify';

interface LocationState {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
  appointmentDate: string;
}

const API_BASE_URL = "http://localhost:8080/api";

const handleImageView = (imageId: number) => {
  window.open(`${API_BASE_URL}/images/download/${imageId}`, '_blank');
};

const MedicalBillFinal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBill, availableDrugs, loading, error } = useAppSelector(state => state.medicalBill);
  const state = location.state as LocationState;

  // State for drug form
  const [drugs, setDrugs] = useState<PrescribedDrugRequest[]>([
    {
      drugId: 0,
      dosage: 0,
      duration: 0,
      frequency: '',
      specialInstructions: ''
    }
  ]);

  useEffect(() => {
    if (state?.patientId) {
      dispatch(fetchLatestMedicalBillByPatientId(state.patientId));
      dispatch(fetchDrugs());
    }
  }, [dispatch, state?.patientId]);

  const handleDrugChange = (index: number, field: keyof PrescribedDrugRequest, value: string | number) => {
    const newDrugs = [...drugs];
    newDrugs[index] = {
      ...newDrugs[index],
      [field]: value
    };
    setDrugs(newDrugs);
  };

  const addDrugField = () => {
    setDrugs([...drugs, {
      drugId: 0,
      dosage: 0,
      duration: 0,
      frequency: '',
      specialInstructions: ''
    }]);
  };

  const removeDrugField = (index: number) => {
    if (drugs.length > 1) {
      const newDrugs = drugs.filter((_, i) => i !== index);
      setDrugs(newDrugs);
    }
  };

  const handleSubmitTreatment = async () => {
    if (!currentBill || !state?.appointmentId) {
      toast.error('Missing required information');
      return;
    }

    // Validate drugs
    const invalidDrugs = drugs.some(drug =>
      !drug.drugId || !drug.dosage || !drug.specialInstructions
    );

    if (invalidDrugs) {
      toast.error('Please fill in all required drug information');
      return;
    }

    try {
      await dispatch(addDrugsToMedicalBill({
        medicalBillId: currentBill.id,
        drugs: drugs,
        appointmentId: state.appointmentId
      })).unwrap();

      navigate('/schedule');
    } catch (error) {
      console.error('Failed to submit treatment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-gray-500 mb-4">No patient information provided</p>
        <button
          onClick={() => navigate('/appointments')}
          className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  if (!currentBill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-gray-500 mb-4">No medical bill found for patient: {state.patientName}</p>
        <button
          onClick={() => navigate('/appointments')}
          className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <div className="pt-16 pb-10">
        <ToastContainer />
        <h1 className="text-4xl font-bold font-sans text-center text-gray-800">
          MEDICAL BILL
        </h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Patient Information Section */}
        <div className="mb-12">
          <Title id={5} />
          <div className="mt-10 mx-16 px-3">
            {/* Top row with Patient Name, Birth Date, and View History button */}
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Patient Name */}
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Patient Name: </p>
                <span className="ms-5 text-2xl text-gray-400">
                  {currentBill.patientName}
                </span>
              </div>
              {/* Birth Date */}
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Birth Date: </p>
                <span className="ms-5 text-2xl text-gray-400">
                  {formatDate(currentBill.patientBirthDate)}
                </span>
              </div>
              {/* View History Button */}
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => window.open(`/medical-history?id=${currentBill.patientId}`, '_blank')}
                  className="flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ClipboardList className="h-5 w-5 mr-2" />
                  <span className="text-lg">View History</span>
                </button>
              </div>
            </div>
            {/* Gender on second row */}
            <div className="mt-7 flex">
              <p className="font-bold text-2xl">Gender: </p>
              <span className="ms-12 text-2xl text-gray-400">
                {currentBill.patientGender}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Information Section */}
        <div className="mb-12">
          <Title id={6} />
          <div className="mt-10 mx-16 px-3">
            <div className="grid grid-cols-2 justify-between">
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Doctor Name: </p>
                <span className="ms-5 text-2xl text-[#A9A9A9]">
                  {currentBill.doctorName}
                </span>
              </div>
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Visit Date: </p>
                <span className="ms-12 text-2xl text-[#A9A9A9]">
                  {formatDate(currentBill.date)}
                </span>
              </div>
            </div>
            <div className="mt-7 flex">
              <p className="font-bold text-2xl">Syndrome: </p>
              <span className="ms-12 text-2xl text-[#A9A9A9] flex-1">
                {currentBill.syndrome}
              </span>
            </div>
          </div>
        </div>

        {/* Add New Drugs Section */}
        <div className="mb-12">
          <Title id={6} />
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add New Prescriptions</h3>
                <button
                  onClick={addDrugField}
                  className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Medicine
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Medicine Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Frequency</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Instructions</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drugs.map((drug, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <select
                            value={drug.drugId}
                            onChange={(e) => handleDrugChange(index, 'drugId', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Medicine</option>
                            {availableDrugs.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.standardDosage})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={drug.dosage}
                            onChange={(e) => handleDrugChange(index, 'dosage', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Quantity"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={drug.duration}
                            onChange={(e) => handleDrugChange(index, 'duration', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Days"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={drug.frequency}
                            onChange={(e) => handleDrugChange(index, 'frequency', e.target.value)}
                            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Twice a day"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={drug.specialInstructions}
                            onChange={(e) => handleDrugChange(index, 'specialInstructions', e.target.value)}
                            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Take after meals"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {drugs.length > 1 && (
                            <button
                              onClick={() => removeDrugField(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Examination Details */}
        {currentBill.examinationDetails && currentBill.examinationDetails.length > 0 && (
          <div className="mb-12">
            <Title id={6} />
            <div className="mt-10 mx-16 px-3">
              <p className="font-bold text-2xl mb-4">Examination Details</p>
              <div className="space-y-6">
                {currentBill.examinationDetails.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {exam.examinationType && (
                        <div className="flex">
                          <p className="font-bold text-2xl">Test Type: </p>
                          <span className="ms-4 text-2xl text-[#A9A9A9]">
                            {exam.examinationType}
                          </span>
                        </div>
                      )}
                      {exam.examinationResult && (
                        <div className="flex">
                          <p className="font-bold text-2xl">Result: </p>
                          <span className="ms-4 text-2xl text-[#A9A9A9]">
                            {exam.examinationResult}
                          </span>
                        </div>
                      )}
                    </div>

                    {exam.imageResponseDTO && exam.imageResponseDTO.length > 0 && (
                      <div className="mt-6">
                        <p className="font-bold text-2xl mb-4">Examination Images</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {exam.imageResponseDTO.map((image) => (
                            <div key={image.id} className="relative group">
                              <div 
                                className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleImageView(image.id)}
                              >
                                <img 
                                  src={`${API_BASE_URL}/images/download/${image.id}`}
                                  alt={image.fileName}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.png';
                                    target.onerror = null;
                                  }}
                                />
                              </div>
                              <div className="mt-2">
                                <span className="text-xl text-[#A9A9A9] truncate">{image.fileName}</span>
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

        {/* Doctor Note */}
        {currentBill.note && currentBill.note.trim() !== "" && (
          <div className="my-10 mx-16">
            <Title id={6} />
            <div className="mt-10 mx-16 px-3">
              <p className="font-bold text-2xl mb-4">Doctor Note</p>
              <div className="p-4 rounded-md">
                <p className="text-2xl text-[#A9A9A9] whitespace-pre-wrap">{currentBill.note}</p>
              </div>
            </div>
          </div>
        )}


         {/* Action Buttons */}
         <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to discard all changes? This action cannot be undone.')) {
                navigate(-1);
              }
            }}
            className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSubmitTreatment}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg shadow-blue-500/30 flex items-center"
          >
            <Pill className="h-5 w-5 mr-2" />
            Submit Treatment
          </button>
        </div>

      </div>
    </div>
  );
};

export default MedicalBillFinal;