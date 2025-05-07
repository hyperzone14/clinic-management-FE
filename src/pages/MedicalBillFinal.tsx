/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/store";
import Title from "../components/common/Title";
import { Plus, Trash2, ClipboardList, Pill, Calendar } from "lucide-react";
import {
  fetchLatestMedicalBillByPatientId,
  addDrugsToMedicalBill,
  PrescribedDrugRequest,
  fetchDrugs,
} from "../redux/slices/medicalBillSlice";
import { toast, ToastContainer } from "react-toastify";
import { AuthService } from "../utils/security/services/AuthService";
import { apiService } from "../utils/axios-config";
import { format, parse, set } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaNotesMedical } from "react-icons/fa";
import {
  clearPredictionsLLM,
  getPredictionsLLM,
} from "../redux/slices/botLLMSlice";
import {
  clearPredictionsTrain,
  getPredictionsTrain,
} from "../redux/slices/botTrainSlice";
import { Switch } from "@mui/material";
import "../styles/switchSetup.css";
import { clear } from "console";

interface LocationState {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
  appointmentDate: string;
}

// interface PrescribedDrugResponseDTO {
//   id: number;
//   drugId: number;
//   drugName: string;
//   dosage: number;
//   duration: number;
//   frequency: string;
//   specialInstructions: string;
// }

// interface ExaminationDetailResponseDTO {
//   id: number;
//   examinationType: string;
//   examinationResult: string;
//   imageResponseDTO?: ImageResponseDTO[];
// }

interface ImageResponseDTO {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
}

// interface Department {
//   name: string;
// }

// interface LabTest {
//   name: string;
// }

// interface ApiResponse<T> {
//   data: T;
// }

interface DrugFormData {
  drugId: number;
  dosage: string;
  duration: string;
  frequency: string;
  specialInstructions: string;
}

interface Symptom {
  id: number;
  name: string;
  description: string;
  prescribedDrugs: {
    id: number;
    drugName: string;
    dosage: number;
    duration: number;
    frequency: string;
    specialInstructions: string;
  }[];
}

interface MedicalInfoState {
  syndrome: string;
  note: string;
  finalDiagnosis: string | null;
  isHealthy: boolean;
  nextAppointmentDate: string;
}

// const suggestedDiagnoses = [
//   "Common Cold",
//   "Seasonal Allergies",
//   "Migraine",
//   "Sinusitis",
//   "Gastroenteritis",
//   "Anxiety",
//   "Hypertension",
//   "Type 2 Diabetes",
// ];

// interface diagnosisOptions {
//   predictions: [diseases: string, probability: number];
// }

// const API_BASE_URL = "http://localhost:8080/api";
// const API_BASE_URL = "https://clinic-management-tdd-ee9f27f356d8.herokuapp.com/api";
// const API_BASE_URL = "http://localhost:8080/api";
// const API_BASE_URL = "/api";
const API_BASE_URL =
  "https://clinic-management-tdd-ee9f27f356d8.herokuapp.com/api";

const handleImageView = (imageId: number) => {
  window.open(`${API_BASE_URL}/images/download/${imageId}`, "_blank");
};

const MedicalBillFinal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBill, availableDrugs, loading } = useAppSelector(
    (state) => state.medicalBill
  );
  const predictionsLLM = useAppSelector((state) => state.botLLM.predictions);
  const predictionsTrain = useAppSelector(
    (state) => state.botTrain.predictions
  );

  const state = location.state as LocationState;

  // State for drug form and lab tests
  const [drugs, setDrugs] = useState<DrugFormData[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfoState>({
    syndrome: "",
    note: "",
    finalDiagnosis: null,
    isHealthy: false,
    nextAppointmentDate: "",
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);

  // States for symptom search
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [fault, setFault] = useState<boolean>(false);
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(false);
  const [switchValue, setSwitchValue] = useState<"LLM" | "Train data">("LLM");

  useEffect(() => {
    dispatch(clearPredictionsLLM());
    dispatch(clearPredictionsTrain());
  }, [dispatch]);

  // Check doctor access on component mount
  useEffect(() => {
    const checkDoctorAccess = () => {
      const isDoctor = AuthService.hasRole("ROLE_DOCTOR");
      if (!isDoctor) {
        toast.error("Access denied: Only doctors can access this page");
        navigate("/login");
        return;
      }

      if (!state?.patientId || !state?.doctorId) {
        toast.error("Invalid access: Missing required information");
        navigate("/schedule");
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
      // Set default next appointment date to 7 days from now if not provided
      const defaultNextDate = new Date();
      defaultNextDate.setDate(defaultNextDate.getDate() + 7);

      // Format date as dd-mm-yyyy for display
      const formattedNextAppointmentDate = currentBill.nextAppointmentDate
        ? format(new Date(currentBill.nextAppointmentDate), "dd-MM-yyyy")
        : format(defaultNextDate, "dd-MM-yyyy");

      setMedicalInfo({
        syndrome: currentBill.syndrome || "",
        note: currentBill.note || "",
        finalDiagnosis: currentBill.finalDiagnosis || null,
        isHealthy: false,
        nextAppointmentDate: formattedNextAppointmentDate,
      });
    }
  }, [currentBill]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiService.get("/lab_department");
        console.log("Departments response:", response);
        // Response is directly the array we need
        setDepartments(response as string[]); // Add type assertion
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Failed to load departments");
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
        const response = await apiService.get(
          `/lab_department/lab_tests?labDepartment=${selectedDepartment}`
        );
        console.log("Lab tests response:", response);
        // Response is directly the array we need
        setLabTests(response as string[]); // Add type assertion
      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
        toast.error("Failed to load lab tests");
        setLabTests([]);
      }
    };

    fetchLabTests();
  }, [selectedDepartment]);

  const handleDrugChange = (
    index: number,
    field: keyof DrugFormData,
    value: string | number
  ) => {
    const newDrugs = [...drugs];

    if (field === "dosage" || field === "duration") {
      // Allow empty value or positive numbers only
      if (
        value === "" ||
        (Number(value) > 0 && !String(value).startsWith("0"))
      ) {
        newDrugs[index] = {
          ...newDrugs[index],
          [field]: value.toString(),
        };
        setDrugs(newDrugs);
      }
    } else {
      newDrugs[index] = {
        ...newDrugs[index],
        [field]: value,
      };
      setDrugs(newDrugs);
    }
  };

  const addDrugField = () => {
    setDrugs([
      ...drugs,
      {
        drugId: 0,
        dosage: "",
        duration: "",
        frequency: "",
        specialInstructions: "",
      },
    ]);
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
    setSelectedLabTests(selectedLabTests.filter((name) => name !== testName));
  };

  const validatePrescriptions = () => {
    if (drugs.length === 0) return false;

    return drugs.every(
      (drug) =>
        drug.drugId !== 0 &&
        drug.dosage !== "" &&
        Number(drug.dosage) > 0 &&
        drug.duration !== "" &&
        Number(drug.duration) > 0 &&
        drug.frequency.trim() !== ""
    );
  };

  // const validateLabTests = () => {
  //   if (newLabTests.length === 0) return false;

  //   return newLabTests.every(test => test.trim() !== "");
  // };

  const handleSubmitLabTests = async () => {
    if (!currentBill) {
      toast.error("No medical bill found");
      return;
    }

    if (selectedLabTests.length === 0) {
      toast.error("Please select at least one lab test");
      return;
    }

    try {
      // Convert nextAppointmentDate from dd-mm-yyyy to yyyy-mm-dd for backend
      const parsedDate = parse(
        medicalInfo.nextAppointmentDate,
        "dd-MM-yyyy",
        new Date()
      );
      const formattedDateForBackend = format(parsedDate, "yyyy-MM-dd");

      // First update medical info
      const updateData = {
        syndrome: medicalInfo.syndrome,
        note: medicalInfo.note,
        finalDiagnosis: medicalInfo.finalDiagnosis,
        nextAppointmentDate: formattedDateForBackend,
      };

      await apiService.patch(`/medical-bills/${currentBill.id}`, updateData);

      const labRequests = selectedLabTests.map((testName) => ({
        examinationType: testName,
      }));

      await apiService.post(
        `/medical-bills/${currentBill.id}/lab_request`,
        labRequests
      );

      await apiService.put(
        `/appointment/${state.appointmentId}/status`,
        "LAB_TEST_REQUIRED"
      );

      toast.success("Lab tests requested successfully");
      navigate("/schedule");
    } catch (error) {
      console.error("Failed to submit lab tests:", error);
      toast.error("Failed to submit lab tests");
    }
  };

  const handleSubmitTreatment = async () => {
    if (!currentBill) {
      toast.error("No medical bill found");
      return;
    }

    // Check if finalDiagnosis is null or empty
    if (!medicalInfo.finalDiagnosis) {
      toast.error("Please enter Final Diagnosis before submitting treatment");
      return;
    }

    // Check if syndrome is empty
    if (!medicalInfo.syndrome) {
      toast.error("Please enter Syndrome before submitting treatment");
      return;
    }

    // Validate drugs only when submitting
    const hasValidPrescriptions = validatePrescriptions();
    if (!hasValidPrescriptions) {
      toast.error(
        "Please complete all prescription fields (medicine, quantity, duration, and frequency)"
      );
      return;
    }

    try {
      // Convert nextAppointmentDate from dd-mm-yyyy to yyyy-mm-dd for backend
      const parsedDate = parse(
        medicalInfo.nextAppointmentDate,
        "dd-MM-yyyy",
        new Date()
      );
      const formattedDateForBackend = format(parsedDate, "yyyy-MM-dd");

      // First update medical info
      const updateData = {
        syndrome: medicalInfo.syndrome,
        note: medicalInfo.note,
        finalDiagnosis: medicalInfo.finalDiagnosis,
        nextAppointmentDate: formattedDateForBackend,
      };

      await apiService.patch(`/medical-bills/${currentBill.id}`, updateData);

      // Convert form data to PrescribedDrugRequest format
      const prescribedDrugs: PrescribedDrugRequest[] = drugs.map((drug) => ({
        drugId: drug.drugId,
        dosage: Number(drug.dosage),
        duration: Number(drug.duration),
        frequency: drug.frequency,
        specialInstructions: drug.specialInstructions,
      }));

      // Then submit treatment
      await dispatch(
        addDrugsToMedicalBill({
          medicalBillId: currentBill.id,
          drugs: prescribedDrugs,
          appointmentId: state.appointmentId,
        })
      ).unwrap();

      // Update appointment status to SUCCESS
      await apiService.put(
        `/appointment/${state.appointmentId}/status`,
        "SUCCESS"
      );

      toast.success("Treatment submitted successfully");
      navigate("/schedule");
    } catch (error) {
      toast.error("Failed to submit treatment");
      console.error("Failed to submit treatment:", error);
    }
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

  const handleMedicalInfoChange = (
    field: keyof MedicalInfoState,
    value: string | boolean
  ) => {
    if (field === "isHealthy") {
      const isHealthyValue = value as boolean;
      setMedicalInfo((prev) => ({
        ...prev,
        isHealthy: isHealthyValue,
        finalDiagnosis: isHealthyValue
          ? "Patient is healthy. No treatment needed."
          : prev.finalDiagnosis === "Patient is healthy. No treatment needed."
          ? ""
          : prev.finalDiagnosis,
      }));
    } else {
      setMedicalInfo((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Function to fetch symptoms based on search term
  const searchSymptoms = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setSymptoms([]);
      return;
    }

    setIsSearching(true);
    console.log("Searching for symptom:", term);

    try {
      const encodedTerm = encodeURIComponent(term.trim());
      console.log("API call to:", `/symptom/name/${encodedTerm}`);

      const response = await apiService.get(`/symptom/name/${encodedTerm}`);
      console.log("API response:", response);

      // Check if we got a valid response
      if (response && typeof response === "object" && "result" in response) {
        console.log("Setting symptoms:", [response.result as Symptom]);
        setSymptoms([response.result as Symptom]);
      } else {
        console.log("No symptoms found in response");
        setSymptoms([]);
      }
    } catch (error: any) {
      // Log detailed error information
      console.error("Failed to fetch symptoms:", error);
      console.error("Error response:", error.response);

      // Don't show error for 404, just clear symptoms
      if (error?.response?.status === 404) {
        console.log("404 error - no symptoms found");
        setSymptoms([]);
      } else {
        console.error("Other error fetching symptoms:", error);
        toast.error("Error searching for symptoms");
        setSymptoms([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle symptom selection
  const handleSymptomSelect = (symptom: Symptom) => {
    // Update final diagnosis with symptom description
    setMedicalInfo((prev) => ({
      ...prev,
      finalDiagnosis: symptom.name,
    }));

    // Find matching drugs from availableDrugs based on name
    const prescribedDrugs: DrugFormData[] = symptom.prescribedDrugs.map(
      (prescribedDrug) => {
        const matchingDrug = availableDrugs.find(
          (d) => d.name === prescribedDrug.drugName
        );
        return {
          drugId: matchingDrug?.id || 0,
          dosage: prescribedDrug.dosage.toString(),
          duration: prescribedDrug.duration.toString(),
          frequency: prescribedDrug.frequency,
          specialInstructions: prescribedDrug.specialInstructions,
        };
      }
    );

    // Update drugs state
    setDrugs(prescribedDrugs);

    // Clear search results
    setSymptoms([]);
  };

  // Debounce search function
  useEffect(() => {
    // Chỉ tìm kiếm triệu chứng khi finalDiagnosis thay đổi, không phải khi nextAppointmentDate thay đổi
    const debounceTimer = setTimeout(() => {
      if (medicalInfo.finalDiagnosis && !medicalInfo.isHealthy) {
        searchSymptoms(medicalInfo.finalDiagnosis);
      } else {
        setSymptoms([]);
      }
    }, 500); // Tăng thời gian debounce lên 500ms để tránh gọi API quá nhiều

    return () => clearTimeout(debounceTimer);
  }, [medicalInfo.finalDiagnosis, medicalInfo.isHealthy]); // Thêm isHealthy vào dependencies

  // Chuyển đổi giá trị string date sang Date object
  const getDateValue = () => {
    try {
      // Kiểm tra định dạng ngày hợp lệ trước khi parse
      if (
        !medicalInfo.nextAppointmentDate ||
        !/^\d{2}-\d{2}-\d{4}$/.test(medicalInfo.nextAppointmentDate)
      ) {
        return new Date(); // Trả về ngày hiện tại nếu định dạng không hợp lệ
      }

      // Parse ngày từ chuỗi
      const parsedDate = parse(
        medicalInfo.nextAppointmentDate,
        "dd-MM-yyyy",
        new Date()
      );

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(parsedDate.getTime())) {
        console.warn("Invalid date detected:", medicalInfo.nextAppointmentDate);
        return new Date();
      }

      return parsedDate;
    } catch (error) {
      console.warn("Error parsing date:", error);
      return new Date(); // Trả về ngày hiện tại nếu có lỗi
    }
  };

  // Function để xử lý khi date thay đổi từ DatePicker
  const handleDatePickerChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const formattedDate = format(date, "dd-MM-yyyy");
      // Cập nhật trực tiếp state mà không gọi API
      setMedicalInfo((prev) => ({
        ...prev,
        nextAppointmentDate: formattedDate,
      }));
    }
  };

  // Render DatePicker an toàn
  const renderDatePicker = () => {
    try {
      return (
        <DatePicker
          selected={getDateValue()}
          onChange={handleDatePickerChange}
          dateFormat='dd-MM-yyyy'
          minDate={new Date()}
          className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12'
          placeholderText='DD-MM-YYYY'
          popperPlacement='bottom-end'
          popperClassName='z-50'
        />
      );
    } catch (error) {
      console.error("Error rendering DatePicker:", error);
      // Fallback to regular input if DatePicker fails
      return (
        <input
          type='text'
          value={medicalInfo.nextAppointmentDate}
          onChange={(e) => {
            setMedicalInfo((prev) => ({
              ...prev,
              nextAppointmentDate: e.target.value,
            }));
          }}
          placeholder='DD-MM-YYYY'
          className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12'
        />
      );
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (!currentBill) {
    return null;
  }

  const doPrediction = async () => {
    if (!medicalInfo.syndrome) {
      toast.error("Please enter a syndrome before predicting.");
      return;
    }

    setLoadingPredictions(true); // Set loading to true
    try {
      if (switchValue === "Train data") {
        await dispatch(getPredictionsTrain(medicalInfo.syndrome)).unwrap();
        clearPredictionsLLM();
      } else {
        await dispatch(getPredictionsLLM(medicalInfo.syndrome)).unwrap();
        clearPredictionsTrain();
      }
      setFault(false);
    } catch (error) {
      setFault(true);
    } finally {
      setLoadingPredictions(false); // Set loading to false
    }
  };

  const handleSwitchChange = () => {
    setSwitchValue((prev) => (prev === "LLM" ? "Train data" : "LLM"));
  };

  const handlePredictionSelect = (disease: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      finalDiagnosis: disease
    }));
    // Clear predictions after selection
    if (switchValue === "LLM") {
      dispatch(clearPredictionsLLM());
    } else {
      dispatch(clearPredictionsTrain());
    }
  };

  // const hasLabTests = newLabTests.length > 0;

  return (
    <div className='w-full min-h-screen bg-gray-50 pb-20'>
      <div className='pt-16 pb-10'>
        <ToastContainer />
        <h1 className='text-4xl font-bold font-sans text-center text-gray-800'>
          MEDICAL BILL
        </h1>
        <div className='w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Patient Information Section */}
        <div className='mb-12'>
          <Title id={5} />
          <div className='mt-10 mx-16 px-3'>
            <div className='grid grid-cols-3 gap-4 items-center'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Patient Name: </p>
                <span className='ms-5 text-2xl text-gray-400'>
                  {currentBill.patientName}
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Birth Date: </p>
                <span className='ms-5 text-2xl text-gray-400'>
                  {formatDate(currentBill.patientBirthDate)}
                </span>
              </div>
              <div className='col-span-1 flex justify-end'>
                <button
                  onClick={() =>
                    window.open(
                      `/medical-history?id=${currentBill.patientId}`,
                      "_blank"
                    )
                  }
                  className='flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
                >
                  <ClipboardList className='h-5 w-5 mr-2' />
                  <span className='text-lg'>View History</span>
                </button>
              </div>
            </div>
            <div className='mt-7 flex'>
              <p className='font-bold text-2xl'>Gender: </p>
              <span className='ms-12 text-2xl text-gray-400'>
                {currentBill.patientGender}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Information Section */}
        <div className='mb-12'>
          <Title id={12} />
          <div className='mt-10 mx-16 px-3'>
            <div className='grid grid-cols-2 justify-between'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Doctor Name: </p>
                <span className='ms-5 text-2xl text-[#A9A9A9]'>
                  {currentBill.doctorName}
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Visit Date: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {formatDate(currentBill.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className='mb-12'>
          <Title id={8} />
          <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='p-4 bg-gray-50 rounded-xl'>
                <p className='font-medium text-gray-700'>Weight</p>
                <p className='text-xl text-gray-900 mt-1'>
                  {currentBill.weight} kg
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-xl'>
                <p className='font-medium text-gray-700'>Heart Rate</p>
                <p className='text-xl text-gray-900 mt-1'>
                  {currentBill.heartRate} bpm
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-xl'>
                <p className='font-medium text-gray-700'>Blood Pressure</p>
                <p className='text-xl text-gray-900 mt-1'>
                  {currentBill.bloodPressure}
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-xl'>
                <p className='font-medium text-gray-700'>Temperature</p>
                <p className='text-xl text-gray-900 mt-1'>
                  {currentBill.temperature}°C
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Lab Tests Section */}
        {currentBill.examinationDetails &&
          currentBill.examinationDetails.length > 0 && (
            <div className='mb-12'>
              <Title id={13} />
              <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
                <h3 className='text-xl font-semibold text-gray-800 mb-6'>
                  Previous Lab Tests
                </h3>
                <div className='space-y-6'>
                  {currentBill.examinationDetails.map((exam) => (
                    <div key={exam.id} className='p-6 bg-gray-50 rounded-xl'>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <p className='font-medium text-gray-700'>Test Type</p>
                          <p className='text-xl text-gray-900 mt-1'>
                            {exam.examinationType}
                          </p>
                        </div>
                        {exam.examinationResult && (
                          <div>
                            <p className='font-medium text-gray-700'>Result</p>
                            <p className='text-xl text-gray-900 mt-1'>
                              {exam.examinationResult}
                            </p>
                          </div>
                        )}
                      </div>

                      {exam.imageResponseDTO &&
                        exam.imageResponseDTO.length > 0 && (
                          <div className='mt-4'>
                            <p className='font-medium text-gray-700 mb-2'>
                              Images
                            </p>
                            <div className='grid grid-cols-4 gap-4'>
                              {exam.imageResponseDTO.map(
                                (image: ImageResponseDTO) => (
                                  <div
                                    key={image.id}
                                    className='cursor-pointer'
                                    onClick={() => handleImageView(image.id)}
                                  >
                                    <img
                                      src={`${API_BASE_URL}/images/download/${image.id}`}
                                      alt={image.fileName}
                                      className='w-full h-32 object-cover rounded-lg'
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Medical Information Section */}
        <div className='mb-12'>
          <Title id={11} />
          <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Syndrome
                </label>
                <textarea
                  value={medicalInfo.syndrome}
                  onChange={(e) =>
                    handleMedicalInfoChange("syndrome", e.target.value)
                  }
                  className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                  placeholder='Enter syndrome...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Note
                </label>
                <textarea
                  value={medicalInfo.note}
                  onChange={(e) =>
                    handleMedicalInfoChange("note", e.target.value)
                  }
                  className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                  placeholder='Enter notes...'
                />
              </div>
              <div>
                <div className='flex items-center space-x-2 mb-4'>
                  <input
                    type='checkbox'
                    id='isHealthy'
                    checked={medicalInfo.isHealthy}
                    onChange={(e) =>
                      handleMedicalInfoChange("isHealthy", e.target.checked)
                    }
                    className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='isHealthy'
                    className='text-sm font-medium text-gray-700'
                  >
                    Patient is healthy - No treatment needed
                  </label>
                </div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Final Diagnosis
                </label>
                <div className='relative'>
                  {/* <textarea
                    value={medicalInfo.finalDiagnosis || ""}
                    onChange={(e) =>
                      handleMedicalInfoChange("finalDiagnosis", e.target.value)
                    }
                    className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    rows={3}
                    placeholder='Enter or search for final diagnosis...'
                    disabled={medicalInfo.isHealthy}
                  />
                  {isSearching && (
                    <div className='absolute right-3 top-3 flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                      </div>
                      <span className='text-sm text-blue-600 font-medium'>
                        Searching...
                      </span>
                    </div>
                  )}
                  {symptoms.length > 0 && medicalInfo.finalDiagnosis && (
                    <div className='absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto'>
                      {symptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() => handleSymptomSelect(symptom)}
                          className='w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0'
                        >
                          <p className='font-medium text-gray-800'>
                            {symptom.name}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            {symptom.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  )} */}
                  <FaNotesMedical
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    value={medicalInfo.finalDiagnosis || ""}
                    onChange={(e) =>
                      handleMedicalInfoChange("finalDiagnosis", e.target.value)
                    }
                    className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter final diagnosis...'
                    disabled={medicalInfo.isHealthy}
                  />
                  {isSearching && (
                    <div className='absolute right-3 top-3 flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                      </div>
                      <span className='text-sm text-blue-600 font-medium'>
                        Searching...
                      </span>
                    </div>
                  )}
                  {symptoms.length > 0 && medicalInfo.finalDiagnosis && (
                    <div className='absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto'>
                      {symptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() => handleSymptomSelect(symptom)}
                          className='w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0'
                        >
                          <p className='font-medium text-gray-800'>
                            {symptom.name}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            {symptom.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className='flex mt-3'>
                    <button
                      className={`my-2 p-3 rounded-md text-white font-semibold transition-colors duration-300  ${
                        loadingPredictions
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#4567b7] hover:bg-[#4567b7]/80"
                      }`}
                      onClick={doPrediction}
                      disabled={loadingPredictions} // Disable button while loading
                    >
                      {loadingPredictions ? (
                        <div className='flex items-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2'></div>
                          Loading...
                        </div>
                      ) : (
                        "Diagnosis Suggestions"
                      )}
                    </button>
                    <div className='flex ms-7 items-center'>
                      <p className='text-lg'>Train data</p>
                      <Switch
                        value={switchValue}
                        inputProps={{
                          "aria-label": "Switch between LLM and Train data",
                        }}
                        onChange={handleSwitchChange}
                        checked={switchValue === "LLM"}
                        className='custom-switch'
                      />
                      <p className='text-lg'>LLM</p>
                    </div>
                  </div>
                  <div
                    className={
                      "overflow-hidden transition-all duration-300 ease-in-out mt-2 border rounded-md bg-gray-50 max-h-96"
                    }
                  >
                    <div className={"p-4 transition-opacity duration-300"}>
                      <h3 className='font-medium mb-2'>
                        Suggested diagnoses based on symptoms:
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {fault === true ? (
                          <p className='text-red-500 font-semibold'>
                            No suggestions available. Please enter a valid
                            syndrome.
                          </p>
                        ) : switchValue === "LLM" ? (
                          predictionsLLM.map((prediction, index) => (
                            <button
                              key={index}
                              onClick={() => handlePredictionSelect(prediction.disease.toString())}
                              className='bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded duration-300 transition-colors'
                            >
                              {prediction.disease}
                            </button>
                          ))
                        ) : (
                          predictionsTrain.map((prediction, index) => (
                            <button
                              key={index}
                              onClick={() => handlePredictionSelect(prediction.disease.toString())}
                              className='bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded duration-300 transition-colors'
                            >
                              {prediction.disease}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Next Appointment Date
                </label>
                <div className='relative'>
                  {renderDatePicker()}
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    <Calendar className='h-5 w-5 text-gray-400' />
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    Format: DD-MM-YYYY
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Lab Tests Section */}
        {drugs.length === 0 && (
          <div className='mb-12'>
            <Title id={9} />
            <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Select Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className='w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select a department</option>
                    {departments &&
                      departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedDepartment && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Available Lab Tests
                    </label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {labTests
                        .filter(
                          (test) =>
                            !selectedLabTests.includes(test) &&
                            !currentBill.examinationDetails?.some(
                              (exam) =>
                                exam.examinationType.toLowerCase() ===
                                test.toLowerCase()
                            )
                        )
                        .map((test) => (
                          <button
                            key={test}
                            onClick={() => handleAddLabTest(test)}
                            className='p-4 text-left bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors'
                          >
                            {test}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {selectedLabTests.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Selected Lab Tests
                    </label>
                    <div className='space-y-3'>
                      {selectedLabTests.map((test) => (
                        <div
                          key={test}
                          className='flex justify-between items-center p-4 bg-blue-50 rounded-xl'
                        >
                          <span className='text-blue-700'>{test}</span>
                          <button
                            onClick={() => removeLabTest(test)}
                            className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                          >
                            <Trash2 className='h-5 w-5' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLabTests.length > 0 && (
                  <div className='flex justify-center mt-8 space-x-4'>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to discard all selected lab tests?"
                          )
                        ) {
                          setSelectedLabTests([]);
                          setSelectedDepartment("");
                        }
                      }}
                      className='px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg'
                    >
                      Discard Lab Tests
                    </button>
                    <button
                      onClick={handleSubmitLabTests}
                      className='px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg shadow-blue-500/30'
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
          <div className='mb-12'>
            <Title id={10} />
            <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
              <div className='space-y-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-xl font-semibold text-gray-800'>
                    Add New Prescriptions
                  </h3>
                  <button
                    onClick={addDrugField}
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
                      {drugs.map((drug, index) => (
                        <tr
                          key={index}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4'>
                            <select
                              value={drug.drugId}
                              onChange={(e) =>
                                handleDrugChange(
                                  index,
                                  "drugId",
                                  parseInt(e.target.value)
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
                                handleDrugChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Enter quantity'
                              min='0.1'
                              step='0.1'
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <input
                              type='number'
                              value={drug.duration}
                              onChange={(e) =>
                                handleDrugChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Enter days'
                              min='1'
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <input
                              type='text'
                              value={drug.frequency}
                              onChange={(e) =>
                                handleDrugChange(
                                  index,
                                  "frequency",
                                  e.target.value
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
                                handleDrugChange(
                                  index,
                                  "specialInstructions",
                                  e.target.value
                                )
                              }
                              className='w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Take after meals'
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <button
                              onClick={() => removeDrugField(index)}
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
            </div>
          </div>
        )}

        {/* Action Buttons - Only show if not adding lab tests */}
        {selectedLabTests.length === 0 && drugs.length > 0 && (
          <div className='flex justify-center space-x-4'>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to discard all changes?"
                  )
                ) {
                  navigate(-1);
                }
              }}
              className='px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg'
            >
              Discard Changes
            </button>
            <button
              onClick={handleSubmitTreatment}
              className='px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg shadow-blue-500/30 flex items-center'
            >
              <Pill className='h-5 w-5 mr-2' />
              Submit Treatment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalBillFinal;
