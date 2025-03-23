import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import Title from '../components/common/Title';
import { Plus, Trash2, ClipboardList, Pill } from 'lucide-react';
import {
  fetchLatestMedicalBillByPatientId,
  addDrugsToMedicalBill,
  PrescribedDrugRequest,
  fetchDrugs
} from '../redux/slices/medicalBillSlice';
import { toast, ToastContainer } from 'react-toastify';
import { AuthService } from '../utils/security/services/AuthService';
import { apiService } from '../utils/axios-config';

interface LocationState {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
  appointmentDate: string;
}

interface PrescribedDrugResponseDTO {
  id: number;
  drugId: number;
  drugName: string;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

interface ExaminationDetailResponseDTO {
  id: number;
  examinationType: string;
  examinationResult: string;
  imageResponseDTO?: ImageResponseDTO[];
}

interface ImageResponseDTO {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
}

interface MedicalBill {
  id: number;
  patientId: number;
  patientName: string;
  patientGender: string;
  patientBirthDate: string;
  doctorId: number;
  doctorName: string;
  date: string;
  syndrome: string;
  note: string;
  weight: number;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  finalDiagnosis: string | null;
  prescribedDrugs: any[];
  examinationDetails: any[];
}

interface Department {
  name: string;
}

interface LabTest {
  name: string;
}

interface ApiResponse<T> {
  data: T;
}

const API_BASE_URL = "http://localhost:8080/api";

const handleImageView = (imageId: number) => {
  window.open(`${API_BASE_URL}/images/download/${imageId}`, '_blank');
};

const MedicalBillFinal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBill, availableDrugs, loading } = useAppSelector(state => state.medicalBill);
  const state = location.state as LocationState;

  // State for drug form and lab tests
  const [drugs, setDrugs] = useState<PrescribedDrugRequest[]>([]);
  const [newLabTests, setNewLabTests] = useState<string[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<Partial<MedicalBill>>({
    syndrome: '',
    note: '',
    finalDiagnosis: null
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);

  // Check doctor access on component mount
  useEffect(() => {
    const checkDoctorAccess = () => {
      const isDoctor = AuthService.hasRole('ROLE_DOCTOR');
      if (!isDoctor) {
        toast.error("Access denied: Only doctors can access this page");
        navigate('/login');
        return;
      }

      if (!state?.patientId || !state?.doctorId) {
        toast.error("Invalid access: Missing required information");
        navigate('/schedule');
        return;
      }
    };

    checkDoctorAccess();
  }, [navigate, state]);

  useEffect(() => {
    if (state?.patientId) {
      dispatch(fetchLatestMedicalBillByPatientId(state.patientId));
      dispatch(fetchDrugs());
    }
  }, [dispatch, state?.patientId]);

  // Add new useEffect to update medicalInfo when currentBill changes
  useEffect(() => {
    if (currentBill) {
      setMedicalInfo({
        syndrome: currentBill.syndrome || '',
        note: currentBill.note || '',
        finalDiagnosis: currentBill.finalDiagnosis || null
      });
    }
  }, [currentBill]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiService.get('/lab_department');
        console.log('Departments response:', response);
        // Response is directly the array we need
        setDepartments(response as string[]); // Add type assertion
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast.error('Failed to load departments');
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch lab tests when department changes
  useEffect(() => {
    const fetchLabTests = async () => {
      if (!selectedDepartment) {
        setLabTests([]);
        return;
      }

      try {
        const response = await apiService.get(`/lab_department/lab_tests?labDepartment=${selectedDepartment}`);
        console.log('Lab tests response:', response);
        // Response is directly the array we need
        setLabTests(response as string[]); // Add type assertion
      } catch (error) {
        console.error('Failed to fetch lab tests:', error);
        toast.error('Failed to load lab tests');
        setLabTests([]);
      }
    };

    fetchLabTests();
  }, [selectedDepartment]);

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
    const newDrugs = drugs.filter((_, i) => i !== index);
    setDrugs(newDrugs);
  };

  const handleAddLabTest = (testName: string) => {
    if (!selectedLabTests.includes(testName)) {
      setSelectedLabTests([...selectedLabTests, testName]);
    }
  };

  const removeLabTest = (testName: string) => {
    setSelectedLabTests(selectedLabTests.filter(name => name !== testName));
  };

  const validatePrescriptions = () => {
    if (drugs.length === 0) return false;
    
    return drugs.every(drug => 
      drug.drugId !== 0 && 
      drug.dosage > 0 && 
      drug.duration > 0 && 
      drug.frequency.trim() !== ""
    );
  };

  const validateLabTests = () => {
    if (newLabTests.length === 0) return false;
    
    return newLabTests.every(test => test.trim() !== "");
  };

  const handleSubmitTreatment = async () => {
    if (!currentBill) {
      toast.error('No medical bill found');
      return;
    }

    // Validate drugs only when submitting
    const hasValidPrescriptions = validatePrescriptions();
    if (!hasValidPrescriptions) {
      toast.error('Please complete all prescription fields (medicine, quantity, duration, and frequency)');
      return;
    }

    try {
      // First update medical info with only necessary fields
      const updateData = {
        id: currentBill.id,
        patientId: state.patientId,
        doctorId: state.doctorId,
        date: currentBill.date,
        syndrome: medicalInfo.syndrome,
        note: medicalInfo.note,
        finalDiagnosis: medicalInfo.finalDiagnosis,
        weight: currentBill.weight,
        heartRate: currentBill.heartRate,
        bloodPressure: currentBill.bloodPressure,
        temperature: currentBill.temperature
      };
      
      await apiService.put(`/medical-bills/${currentBill.id}`, updateData);

      // Then submit treatment
      await dispatch(addDrugsToMedicalBill({
        medicalBillId: currentBill.id,
        drugs: drugs,
        appointmentId: state.appointmentId
      })).unwrap();

      toast.success('Treatment submitted successfully');
      navigate('/schedule');
    } catch (error) {
      toast.error('Failed to submit treatment');
      console.error('Failed to submit treatment:', error);
    }
  };

  const handleSubmitLabTests = async () => {
    if (!currentBill) {
      toast.error('No medical bill found');
      return;
    }

    if (selectedLabTests.length === 0) {
      toast.error('Please select at least one lab test');
      return;
    }

    try {
      const labRequests = selectedLabTests.map(testName => ({
        examinationType: testName
      }));

      await apiService.post(
        `/medical-bills/${currentBill.id}/lab_request`,
        labRequests
      );

      await apiService.put(
        `/appointment/${state.appointmentId}/status`,
        "LAB_TEST_REQUIRED"
      );

      toast.success('Lab tests requested successfully');
      navigate('/schedule');
    } catch (error) {
      console.error('Failed to submit lab tests:', error);
      toast.error('Failed to submit lab tests');
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

  const handleMedicalInfoChange = (field: keyof MedicalBill, value: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateMedicalInfo = async () => {
    try {
      if (!currentBill) {
        toast.error('No medical bill found');
        return;
      }

      const updateData = {
        id: currentBill.id,
        patientId: state.patientId,
        doctorId: state.doctorId,
        date: currentBill.date,
        syndrome: medicalInfo.syndrome,
        note: medicalInfo.note,
        finalDiagnosis: medicalInfo.finalDiagnosis,
        weight: currentBill.weight,
        heartRate: currentBill.heartRate,
        bloodPressure: currentBill.bloodPressure,
        temperature: currentBill.temperature
      };

      await apiService.put(`/medical-bills/${currentBill.id}`, updateData);
      toast.success('Medical information updated successfully');
      
      // Refresh medical bill data
      dispatch(fetchLatestMedicalBillByPatientId(state.patientId));
    } catch (error) {
      console.error('Failed to update medical information:', error);
      toast.error('Failed to update medical information');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentBill) {
    return null;
  }

  const hasLabTests = newLabTests.length > 0;

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
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Patient Name: </p>
                <span className="ms-5 text-2xl text-gray-400">
                  {currentBill.patientName}
                </span>
              </div>
              <div className="col-span-1 flex">
                <p className="font-bold text-2xl">Birth Date: </p>
                <span className="ms-5 text-2xl text-gray-400">
                  {formatDate(currentBill.patientBirthDate)}
                </span>
              </div>
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
          <Title id={12} />
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
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className="mb-12">
          <Title id={8} />
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-700">Weight</p>
                <p className="text-xl text-gray-900 mt-1">{currentBill.weight} kg</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-700">Heart Rate</p>
                <p className="text-xl text-gray-900 mt-1">{currentBill.heartRate} bpm</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-700">Blood Pressure</p>
                <p className="text-xl text-gray-900 mt-1">{currentBill.bloodPressure}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-700">Temperature</p>
                <p className="text-xl text-gray-900 mt-1">{currentBill.temperature}°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Lab Tests Section */}
        {currentBill.examinationDetails && currentBill.examinationDetails.length > 0 && (
          <div className="mb-12">
            <Title id={13} />
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Previous Lab Tests</h3>
              <div className="space-y-6">
                {currentBill.examinationDetails.map((exam) => (
                  <div key={exam.id} className="p-6 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="font-medium text-gray-700">Test Type</p>
                        <p className="text-xl text-gray-900 mt-1">{exam.examinationType}</p>
                      </div>
                      {exam.examinationResult && (
                        <div>
                          <p className="font-medium text-gray-700">Result</p>
                          <p className="text-xl text-gray-900 mt-1">{exam.examinationResult}</p>
                        </div>
                      )}
                    </div>

                    {exam.imageResponseDTO && exam.imageResponseDTO.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Images</p>
                        <div className="grid grid-cols-4 gap-4">
                          {exam.imageResponseDTO.map((image: ImageResponseDTO) => (
                            <div
                              key={image.id}
                              className="cursor-pointer"
                              onClick={() => handleImageView(image.id)}
                            >
                              <img
                                src={`${API_BASE_URL}/images/download/${image.id}`}
                                alt={image.fileName}
                                className="w-full h-32 object-cover rounded-lg"
                              />
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

        {/* Add New Lab Tests Section */}
        {drugs.length === 0 && (
          <div className="mb-12">
            <Title id={9} />
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a department</option>
                    {departments && departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDepartment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Lab Tests
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {labTests
                        .filter(test => !selectedLabTests.includes(test) && 
                          !currentBill.examinationDetails?.some(
                            exam => exam.examinationType.toLowerCase() === test.toLowerCase()
                          )
                        )
                        .map((test) => (
                          <button
                            key={test}
                            onClick={() => handleAddLabTest(test)}
                            className="p-4 text-left bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            {test}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {selectedLabTests.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Lab Tests
                    </label>
                    <div className="space-y-3">
                      {selectedLabTests.map((test) => (
                        <div
                          key={test}
                          className="flex justify-between items-center p-4 bg-blue-50 rounded-xl"
                        >
                          <span className="text-blue-700">{test}</span>
                          <button
                            onClick={() => removeLabTest(test)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLabTests.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleSubmitLabTests}
                      className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg shadow-blue-500/30"
                    >
                      Submit Lab Tests
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Medicine Section - Only show if no lab tests */}
        {selectedLabTests.length === 0 && (
          <div className="mb-12">
            <Title id={10} />
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
                            <button
                              onClick={() => removeDrugField(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Information Section - Only show when adding drugs */}
        {selectedLabTests.length === 0 && drugs.length > 0 && (
          <div className="mb-12">
            <Title id={11} />
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syndrome
                  </label>
                  <textarea
                    value={medicalInfo.syndrome}
                    onChange={(e) => handleMedicalInfoChange('syndrome', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter syndrome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={medicalInfo.note}
                    onChange={(e) => handleMedicalInfoChange('note', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Diagnosis
                  </label>
                  <textarea
                    value={medicalInfo.finalDiagnosis || ''}
                    onChange={(e) => handleMedicalInfoChange('finalDiagnosis', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter final diagnosis..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Only show if not adding lab tests */}
        {selectedLabTests.length === 0 && drugs.length > 0 && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to discard all changes?')) {
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
        )}
      </div>
    </div>
  );
};

export default MedicalBillFinal;