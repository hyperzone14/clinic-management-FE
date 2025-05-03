import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  Trash2,
  Plus,
  ClipboardList,
  UserCircle,
  Calendar,
  AlertCircle,
  Beaker,
  Pill,
} from "lucide-react";
import Title from "../components/common/Title";
import {
  submitTreatment,
  addPrescribedDrug,
  removePrescribedDrug,
  updatePrescribedDrug,
  addExamination,
  removeExamination,
  updateExamination,
  setSyndrome,
  setNote,
  resetTreatment,
  fetchDrugs,
  selectTreatment,
} from "../redux/slices/treatmentSlice";
import { apiService } from "../utils/axios-config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserDoctor } from "react-icons/fa6";

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

interface MedicalBillResponseDTO {
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
  prescribedDrugs: PrescribedDrugResponseDTO[];
  examinationDetails: ExaminationDetailResponseDTO[];
}

const MedicalService: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"prescription" | "labtest" | null>(
    null
  );
  const [medicalBillData, setMedicalBillData] =
    useState<MedicalBillResponseDTO | null>(null);
  const {
    patientInfo,
    syndrome,
    note,
    prescribedDrugRequestDTOS,
    examinationDetailRequestDTOS,
    availableDrugs,
    loading,
    doctorInfo,
    appointmentId,
  } = useAppSelector(selectTreatment);

  const hasLabTests = examinationDetailRequestDTOS.length > 0;
  const hasPrescriptions = prescribedDrugRequestDTOS.length > 0;

  const validatePrescriptions = () => {
    if (prescribedDrugRequestDTOS.length === 0) return false;

    return prescribedDrugRequestDTOS.every(
      (drug) =>
        drug.drugId !== 0 &&
        drug.dosage > 0 &&
        drug.duration > 0 &&
        drug.frequency.trim() !== ""
    );
  };

  const validateLabTests = () => {
    if (examinationDetailRequestDTOS.length === 0) return false;

    return examinationDetailRequestDTOS.every(
      (test) => test.examinationType.trim() !== ""
    );
  };

  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchDrugs());
    }
  }, [appointmentId, dispatch]);

  useEffect(() => {
    if (hasLabTests) {
      setActiveTab("labtest");
    } else if (hasPrescriptions) {
      setActiveTab("prescription");
    }
  }, [hasLabTests, hasPrescriptions]);

  useEffect(() => {
    const fetchMedicalBillData = async () => {
      try {
        // Assuming we get the medical bill ID from URL params or props
        const medicalBillId = new URLSearchParams(window.location.search).get(
          "id"
        );
        if (medicalBillId) {
          const response = await apiService.get<MedicalBillResponseDTO>(
            `/medical-bills/${medicalBillId}`
          );
          setMedicalBillData(response);

          // Update the form with fetched data
          if (response) {
            dispatch(setSyndrome(response.syndrome));
            dispatch(setNote(response.note));

            // Clear existing prescriptions and add fetched ones
            prescribedDrugRequestDTOS.forEach((_, index) => {
              dispatch(removePrescribedDrug(index));
            });
            response.prescribedDrugs.forEach((drug) => {
              dispatch(
                addPrescribedDrug({
                  drugId: drug.drugId,
                  dosage: drug.dosage,
                  duration: drug.duration,
                  frequency: drug.frequency,
                  specialInstructions: drug.specialInstructions,
                })
              );
            });

            // Clear existing examinations and add fetched ones
            examinationDetailRequestDTOS.forEach((_, index) => {
              dispatch(removeExamination(index));
            });
            response.examinationDetails.forEach((exam) => {
              dispatch(
                addExamination({
                  examinationType: exam.examinationType,
                })
              );
            });

            // Set appropriate tab based on data
            if (response.examinationDetails.length > 0) {
              setActiveTab("labtest");
            } else if (response.prescribedDrugs.length > 0) {
              setActiveTab("prescription");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching medical bill:", error);
        toast.error("Failed to fetch medical bill data");
      }
    };

    fetchMedicalBillData();
  }, [dispatch]);

  const handleSubmit = async () => {
    // Validate syndrome
    if (!syndrome.trim()) {
      toast.error("Please enter syndrome");
      return;
    }

    // Validate that either lab tests or prescriptions are present and valid
    const hasValidPrescriptions = validatePrescriptions();
    const hasValidLabTests = validateLabTests();

    if (!hasValidLabTests && !hasValidPrescriptions) {
      toast.error("Please add and complete either lab tests or prescriptions");
      return;
    }

    // Validate prescription details if prescriptions are present
    if (hasPrescriptions && !hasValidPrescriptions) {
      toast.error(
        "Please complete all prescription fields (medicine, quantity, duration, and frequency)"
      );
      return;
    }

    // Validate lab test details if lab tests are present
    if (hasLabTests && !hasValidLabTests) {
      toast.error("Please enter all lab test types");
      return;
    }

    try {
      await dispatch(submitTreatment()).unwrap();
      toast.success(
        hasLabTests
          ? "Lab test request submitted successfully"
          : "Medical bill created successfully"
      );
      navigate("/schedule");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create medical bill. Please try again.");
    }
  };

  const handleAddLabTest = () => {
    if (hasPrescriptions) {
      if (
        window.confirm(
          "Adding a lab test will remove all prescribed drugs. Do you want to continue?"
        )
      ) {
        prescribedDrugRequestDTOS.forEach((_, index) => {
          dispatch(removePrescribedDrug(index));
        });
        dispatch(addExamination({ examinationType: "" }));
        setActiveTab("labtest");
      }
    } else {
      dispatch(addExamination({ examinationType: "" }));
      setActiveTab("labtest");
    }
  };

  const handleAddPrescription = () => {
    if (hasLabTests) {
      if (
        window.confirm(
          "Adding a prescription will remove all lab tests. Do you want to continue?"
        )
      ) {
        examinationDetailRequestDTOS.forEach((_, index) => {
          dispatch(removeExamination(index));
        });
        dispatch(
          addPrescribedDrug({
            drugId: 0,
            dosage: 0,
            duration: 0,
            frequency: "",
            specialInstructions: "",
          })
        );
        setActiveTab("prescription");
      }
    } else {
      dispatch(
        addPrescribedDrug({
          drugId: 0,
          dosage: 0,
          duration: 0,
          frequency: "",
          specialInstructions: "",
        })
      );
      setActiveTab("prescription");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <ToastContainer />

      {/* Medical Treatment Title */}
      <div className='mb-12'>
        <h1 className='text-4xl font-bold font-sans text-center text-gray-800'>
          MEDICAL TREATMENT
        </h1>
        <div className='w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full'></div>
      </div>

      {/* Patient Information Section */}
      <div className='bg-white rounded-xl shadow-md p-6 mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center min-w-[250px]'>
            <UserCircle className='w-8 h-8 text-blue-500 mr-4' />
            <div>
              <p className='text-sm text-gray-500 mb-1'>Patient Name</p>
              <p className='text-2xl font-medium text-gray-800'>
                {medicalBillData?.patientName || patientInfo.patientName}
              </p>
            </div>
          </div>

          {/* Birth Date */}
          <div className='flex items-center min-w-[200px] mx-16'>
            <Calendar className='w-6 h-6 text-blue-500 mr-3' />
            <div>
              <p className='text-sm text-gray-500 mb-1'>Birth Date</p>
              <p className='text-xl text-gray-700'>
                {medicalBillData
                  ? new Date(
                      medicalBillData.patientBirthDate
                    ).toLocaleDateString()
                  : new Date(patientInfo.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className='flex items-center min-w-[150px] mx-16'>
            <UserCircle className='w-6 h-6 text-blue-500 mr-3' />
            <div>
              <p className='text-sm text-gray-500 mb-1'>Gender</p>
              <p className='text-xl text-gray-700'>
                {medicalBillData?.patientGender || patientInfo.gender}
              </p>
            </div>
          </div>

          {/* View History Button */}
          <button
            onClick={() =>
              window.open(
                `/medical-history?id=${
                  medicalBillData?.patientId || patientInfo.patientId
                }`,
                "_blank"
              )
            }
            className='flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap ml-auto'
          >
            <ClipboardList className='h-5 w-5 mr-2' />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Pre-Examination Results Section */}
      <div className='mb-12'>
        <Title id={6} />
        <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
          <div className='mb-8'>
            <h3 className='text-xl font-semibold text-gray-800 mb-6'>
              Pre-Examination Results
            </h3>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-gray-500'>Weight</p>
                <p className='text-lg font-medium'>
                  {medicalBillData?.weight} kg
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Heart Rate</p>
                <p className='text-lg font-medium'>
                  {medicalBillData?.heartRate} bpm
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Blood Pressure</p>
                <p className='text-lg font-medium'>
                  {medicalBillData?.bloodPressure}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Temperature</p>
                <p className='text-lg font-medium'>
                  {medicalBillData?.temperature} °C
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Information */}
      <div className='bg-white rounded-xl shadow-md p-6 mb-8'>
        <div className='flex items-center'>
          <FaUserDoctor className='w-8 h-8 text-blue-500 mr-4' />
          <div>
            <p className='text-sm text-gray-500 mb-1'>Doctor Name</p>
            <p className='text-2xl font-medium text-gray-800'>
              {medicalBillData?.doctorName || doctorInfo.doctorName}
            </p>
          </div>
        </div>
      </div>

      {/* Treatment Options */}
      <div className='w-full bg-gray-50 pb-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-12'>
            <Title id={5} />
            <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
              <div className='flex justify-center space-x-4 mb-6'>
                <button
                  onClick={handleAddPrescription}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                    activeTab === "prescription"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <Pill className='h-5 w-5 mr-2' />
                  Prescribe Medicine
                </button>
                <button
                  onClick={handleAddLabTest}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                    activeTab === "labtest"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <Beaker className='h-5 w-5 mr-2' />
                  Request Lab Tests
                </button>
              </div>

              {/* Dynamic Content Based on Selection */}
              <div className='bg-white rounded-2xl shadow-sm p-8'>
                {activeTab === "prescription" && (
                  <div className='space-y-6'>
                    <div className='flex justify-between items-center mb-6'>
                      <h3 className='text-xl font-semibold text-gray-800'>
                        Prescribed Medications
                      </h3>
                      <button
                        onClick={handleAddPrescription}
                        className='flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors'
                      >
                        <Plus className='h-5 w-5 mr-2' />
                        Add Medicine
                      </button>
                    </div>

                    <div className='overflow-hidden rounded-xl border border-gray-200'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                          <tr>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                              Medicine Name
                            </th>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                              Quantity
                            </th>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                              Duration
                            </th>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                              Frequency
                            </th>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                              Instructions
                            </th>
                            <th className='w-20'></th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {prescribedDrugRequestDTOS.map((drug, index) => (
                            <tr
                              key={index}
                              className='hover:bg-gray-50 transition-colors'
                            >
                              <td className='px-6 py-4'>
                                <select
                                  value={drug.drugId}
                                  onChange={(e) =>
                                    dispatch(
                                      updatePrescribedDrug({
                                        index,
                                        updates: {
                                          drugId: Number(e.target.value),
                                        },
                                      })
                                    )
                                  }
                                  className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                >
                                  <option value=''>Select Medicine</option>
                                  {availableDrugs.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} ({d.standardDosage})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className='px-6 py-4'>
                                <input
                                  type='number'
                                  value={drug.dosage}
                                  onChange={(e) =>
                                    dispatch(
                                      updatePrescribedDrug({
                                        index,
                                        updates: {
                                          dosage: Number(e.target.value),
                                        },
                                      })
                                    )
                                  }
                                  className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                              </td>
                              <td className='px-6 py-4'>
                                <input
                                  type='number'
                                  value={drug.duration}
                                  onChange={(e) =>
                                    dispatch(
                                      updatePrescribedDrug({
                                        index,
                                        updates: {
                                          duration: Number(e.target.value),
                                        },
                                      })
                                    )
                                  }
                                  className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  placeholder='Days'
                                />
                              </td>
                              <td className='px-6 py-4'>
                                <input
                                  type='text'
                                  value={drug.frequency}
                                  onChange={(e) =>
                                    dispatch(
                                      updatePrescribedDrug({
                                        index,
                                        updates: { frequency: e.target.value },
                                      })
                                    )
                                  }
                                  className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  placeholder='e.g., Twice a day'
                                />
                              </td>
                              <td className='px-6 py-4'>
                                <input
                                  type='text'
                                  value={drug.specialInstructions}
                                  onChange={(e) =>
                                    dispatch(
                                      updatePrescribedDrug({
                                        index,
                                        updates: {
                                          specialInstructions: e.target.value,
                                        },
                                      })
                                    )
                                  }
                                  className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  placeholder='Take after meals'
                                />
                              </td>
                              <td className='px-6 py-4'>
                                <button
                                  onClick={() =>
                                    dispatch(removePrescribedDrug(index))
                                  }
                                  className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                                >
                                  <Trash2 className='h-5 w-5' />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "labtest" && (
                  <div className='space-y-6'>
                    <div className='flex justify-between items-center mb-6'>
                      <h3 className='text-xl font-semibold text-gray-800'>
                        Laboratory Tests
                      </h3>
                      <button
                        onClick={handleAddLabTest}
                        className='flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors'
                      >
                        <Plus className='h-5 w-5 mr-2' />
                        Add Test
                      </button>
                    </div>

                    <div className='space-y-4'>
                      {examinationDetailRequestDTOS.map((exam, index) => (
                        <div
                          key={index}
                          className='p-6 bg-gray-50 rounded-xl relative group'
                        >
                          <button
                            onClick={() => dispatch(removeExamination(index))}
                            className='absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                          >
                            <Trash2 className='h-5 w-5' />
                          </button>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Test Type
                            </label>
                            <input
                              type='text'
                              value={exam.examinationType}
                              onChange={(e) =>
                                dispatch(
                                  updateExamination({
                                    index,
                                    updates: {
                                      examinationType: e.target.value,
                                    },
                                  })
                                )
                              }
                              className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Enter test type...'
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!activeTab && (
                  <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                    <div className='mb-4 p-4 rounded-full bg-gray-50'>
                      <AlertCircle className='h-8 w-8' />
                    </div>
                    <p className='text-lg mb-2'>No Treatment Selected</p>
                    <p className='text-sm'>
                      Please select either prescription or lab test above
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor's Notes Section */}
          <div className='mb-12'>
            <Title id={6} />
            <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
              <h3 className='text-xl font-semibold text-gray-800 mb-4'>
                Doctor's Notes
              </h3>
              <textarea
                value={note}
                onChange={(e) => dispatch(setNote(e.target.value))}
                rows={4}
                className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter your medical notes and observations...'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center space-x-4'>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to discard all changes? This action cannot be undone."
                  )
                ) {
                  dispatch(resetTreatment());
                  setActiveTab(null);
                }
              }}
              className='px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg'
            >
              Discard Changes
            </button>
            <button
              onClick={handleSubmit}
              className='px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg shadow-blue-500/30 flex items-center'
            >
              {hasLabTests ? (
                <>
                  <Beaker className='h-5 w-5 mr-2' />
                  Submit Lab Request
                </>
              ) : (
                <>
                  <Pill className='h-5 w-5 mr-2' />
                  Create Medical Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating notification for successful actions */}
      <div className='fixed bottom-8 right-8 pointer-events-none'>
        <div
          className={`
            transform transition-all duration-300 
            ${
              activeTab
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }
          `}
        >
          <div className='bg-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2'>
            <div
              className={`w-2 h-2 rounded-full ${
                activeTab === "prescription" ? "bg-blue-500" : "bg-green-500"
              }`}
            />
            <span className='text-sm text-gray-600'>
              {activeTab === "prescription"
                ? "Prescription Mode"
                : "Lab Test Mode"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalService;
