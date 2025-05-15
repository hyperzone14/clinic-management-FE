import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiService } from "../utils/axios-config";
import Title from "../components/common/Title";
import { ClipboardList, Save } from "lucide-react";
import { RootState, useAppDispatch } from "../redux/store";
import {
  updateAppointmentStatus,
  AppointmentStatus,
} from "../redux/slices/scheduleSlice";
import { getDoctorById } from "../redux/slices/doctorSlice";
import { useSelector } from "react-redux";
import { fetchDepartments } from "../redux/slices/departmentSlice";

interface PreExaminationFormData {
  patientId: number;
  doctorId: number;
  date: string;
  syndrome: string;
  note: string;
  weight: string;
  heartRate: string;
  bloodPressure: string;
  temperature: string;
}

const PreExaminationDetail: React.FC = () => {
  const doctorInfo = useSelector((state: RootState) => state.doctor);
  const departmentInfo = useSelector((state: RootState) => state.department);
  const [department, setDepartment] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    patientId,
    doctorId,
    appointmentId,
    patientName,
    doctorName,
    appointmentDate,
  } = location.state || {};

  const [formData, setFormData] = useState<PreExaminationFormData>({
    patientId: patientId || 0,
    doctorId: doctorId || 0,
    date: appointmentDate || new Date().toISOString().split("T")[0],
    syndrome: "",
    note: "",
    weight: "",
    heartRate: "",
    bloodPressure: "",
    temperature: "",
  });

  useEffect(() => {
    dispatch(getDoctorById(doctorId));
    dispatch(fetchDepartments());
    const departmentId = doctorInfo.doctors.find(
      (doctor) => doctor.id === doctorId
    )?.departmentId;

    const departmentName = departmentInfo.departments.find(
      (dept) => dept.id === departmentId
    )?.name;

    setDepartment(departmentName || "");
  }, [departmentInfo.departments, dispatch, doctorId, doctorInfo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate numeric inputs
    if (["weight", "heartRate", "temperature"].includes(name)) {
      // Allow empty value or positive numbers only
      if (value === "" || (Number(value) > 0 && !value.startsWith("0"))) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.syndrome.trim()) {
        toast.error("Please enter syndrome");
        return;
      }

      if (!formData.weight || Number(formData.weight) <= 0) {
        toast.error("Please enter a valid weight");
        return;
      }

      if (!formData.heartRate || Number(formData.heartRate) <= 0) {
        toast.error("Please enter a valid heart rate");
        return;
      }

      if (!formData.bloodPressure.trim()) {
        toast.error("Please enter blood pressure");
        return;
      }

      if (!formData.temperature || Number(formData.temperature) <= 0) {
        toast.error("Please enter a valid temperature");
        return;
      }

      // Format data to match backend expectations
      const preExamData = {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        date: appointmentDate,
        syndrome: formData.syndrome,
        note: formData.note,
        weight: Number(formData.weight),
        heartRate: Number(formData.heartRate),
        bloodPressure: formData.bloodPressure,
        temperature: Number(formData.temperature),
      };

      // 1. Submit pre-examination data first
      const response = await apiService.post(
        "/medical-bills/pre_examination",
        preExamData
      );

      if (!response) {
        throw new Error("Failed to save pre-examination data");
      }

      // 2. If pre-examination data is saved successfully, update appointment status
      await apiService.put<void>(
        `/appointment/${appointmentId}/status`,
        AppointmentStatus.PRE_EXAMINATION_COMPLETED
      );

      // 3. Update Redux store
      dispatch(
        updateAppointmentStatus({
          id: appointmentId,
          status: "pre_examination_completed",
        })
      );

      toast.success("Pre-examination completed successfully");
      navigate("/pre_exam");
    } catch (error: any) {
      console.error("Error submitting pre-examination:", error);
      // Log detailed error information
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to submit: ${error.response.data.message || "Unknown error"}`
        );
      } else {
        toast.error("Failed to submit pre-examination data");
      }
    }
  };

  if (!location.state) {
    toast.error("Missing required information");
    navigate("/pre_exam");
    return null;
  }

  return (
    <div className='w-full min-h-screen bg-[#f7f7f7] pb-20'>
      <div className='pt-16 pb-10'>
        <ToastContainer />
        <h1 className='text-4xl font-bold font-sans text-center text-[#4567b7]'>
          PRE-EXAMINATION FORM
        </h1>
        <div className='w-20 h-1 bg-[#4567b7] mx-auto mt-4 rounded-full'></div>
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
                  {patientName}
                </span>
              </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Visit Date: </p>
                <span className='ms-5 text-2xl text-gray-400'>
                  {formatDate(appointmentDate)}
                </span>
              </div>
              <div className='col-span-1 flex justify-end'>
                <button
                  onClick={() =>
                    window.open(`/medical-history?id=${patientId}`, "_blank")
                  }
                  className='flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
                >
                  <ClipboardList className='h-5 w-5 mr-2' />
                  <span className='text-lg'>View History</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Information Section */}
        <div className='mb-12'>
          <Title id={14} />
          <div className='mt-10 mx-16 px-3'>
            <div className='grid grid-cols-3 gap-4 items-center'>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Doctor Name: </p>
                <span className='ms-5 text-2xl text-gray-400'>
                  {doctorName}
                </span>
              </div>
              <div className='col-span-2 flex'>
                <p className='font-bold text-2xl'>Department: </p>
                <span className='ms-5 text-2xl text-gray-400'>
                  {department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Examination Form Section */}
        <div className='mb-12'>
          <Title id={6} />
          <div className='mt-8 bg-white rounded-2xl shadow-sm p-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='block text-lg font-medium text-gray-700 mb-2'>
                    Weight (kg)
                  </label>
                  <input
                    type='number'
                    name='weight'
                    value={formData.weight}
                    onChange={handleInputChange}
                    className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                    step='0.1'
                    min='0.1'
                    placeholder='Enter weight'
                    required
                  />
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 mb-2'>
                    Heart Rate (bpm)
                  </label>
                  <input
                    type='number'
                    name='heartRate'
                    value={formData.heartRate}
                    onChange={handleInputChange}
                    className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                    min='1'
                    placeholder='Enter heart rate'
                    required
                  />
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 mb-2'>
                    Blood Pressure
                  </label>
                  <input
                    type='text'
                    name='bloodPressure'
                    value={formData.bloodPressure}
                    onChange={handleInputChange}
                    placeholder='e.g., 120/80'
                    className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 mb-2'>
                    Temperature (°C)
                  </label>
                  <input
                    type='number'
                    name='temperature'
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                    step='0.1'
                    min='30'
                    max='45'
                    placeholder='Enter temperature'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-lg font-medium text-gray-700 mb-2'>
                  Syndrome
                </label>
                <input
                  type='text'
                  name='syndrome'
                  value={formData.syndrome}
                  onChange={handleInputChange}
                  className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-lg font-medium text-gray-700 mb-2'>
                  Notes
                </label>
                <textarea
                  name='note'
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className='w-full p-3 border rounded-xl text-gray-700 focus:ring-2 focus:ring-[#4567b7] focus:border-transparent'
                />
              </div>
            </form>
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
                navigate("/pre_exam");
              }
            }}
            className='px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg'
          >
            Discard Changes
          </button>
          <button
            onClick={(e) => {
              handleSubmit(e);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className='px-8 py-3 bg-[#4567b7] text-white rounded-xl hover:bg-[#3a569c] transition-colors font-medium text-lg shadow-lg shadow-blue-500/30 flex items-center'
          >
            <Save className='h-5 w-5 mr-2' />
            Submit Pre-Examination
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreExaminationDetail;
