import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../utils/axios-config";
import { toast, ToastContainer } from "react-toastify";
import { IoPersonOutline } from "react-icons/io5";
import { FaRegCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { MdOutlineScience } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import { format } from "date-fns";

interface ImageResponseDTO {
  id: number;
  fileName: string;
  downloadUrl: string;
}

interface LabTest {
  id: number;
  patientName: string;
  doctorName: string;
  examinationType: string;
  labDepartment: string;
  labPrice: string;
  status: string;
  examinationResult: string | null;
  createdAt: string;
  imageResponseDTO: ImageResponseDTO[];
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
  finalDiagnosis: string;
  nextAppointmentDate: string;
  prescribedDrugs: [];
  examinationDetails: LabTest[];
  totalUnpaidAmount: number;
}

const LabTestPaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicalBill, setMedicalBill] = useState<MedicalBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLabTests, setSelectedLabTests] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMedicalBillDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await apiService.get<MedicalBill>(
          `/medical-bills/${id}`
        );
        setMedicalBill(response);
        const unpaidTestIds = response.examinationDetails
          .filter((test) => test.status === "UNPAID")
          .map((test) => test.id);
        setSelectedLabTests(unpaidTestIds);
      } catch (error) {
        console.error("Failed to fetch medical bill details:", error);
        toast.error("Unable to load medical bill details");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalBillDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MM/dd/yyyy");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericAmount);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleBackClick = () => {
    navigate("/lab-test-payment");
  };

  const handleSubmitPayment = async () => {
    if (!id || selectedLabTests.length === 0) {
      toast.warning("Please select at least one lab test to pay");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the payload with the selected examination types
      const examinationTypes = medicalBill?.examinationDetails
        .filter((test) => selectedLabTests.includes(test.id))
        .map((test) => ({ examinationType: test.examinationType }));

      // Call the API to update payment status
      await apiService.put(
        `/medical-bills/${id}/examination-details/update-status`,
        examinationTypes
      );

      // Success message
      toast.success("Payment submitted successfully");

      // Navigate back to the lab test payment screen
      navigate("/lab-test-payment");
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast.error("Failed to submit payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-[#f7f7f7]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#34a85a]'></div>
      </div>
    );
  }

  if (!medicalBill) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-6 bg-[#f7f7f7]'>
        <h2 className='text-2xl font-bold text-[#000000] mb-4'>
          Medical Bill Not Found
        </h2>
        <p className='text-gray-600 mb-8'>
          The medical bill you're looking for does not exist or has been
          removed.
        </p>
        <button
          onClick={handleBackClick}
          className='flex items-center px-4 py-2 bg-[#34a85a] text-white rounded-lg hover:bg-[#2e8b46] transition-colors'
        >
          <FaArrowLeft className='mr-2' /> Back to List
        </button>
      </div>
    );
  }

  // Count of paid and unpaid tests
  const paidTests = medicalBill.examinationDetails.filter(
    (test) => test.status === "PAID"
  ).length;
  const unpaidTests = medicalBill.examinationDetails.length - paidTests;

  return (
    <div className='w-full min-h-screen bg-[#f7f7f7] pb-20'>
      <ToastContainer />

      <div className='max-w-7xl mx-auto p-4'>
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className='flex items-center mb-6 px-4 py-2 bg-[#34a85a] text-white rounded-lg hover:bg-[#2e8b46] transition-colors'
        >
          <FaArrowLeft className='mr-2' /> Back to List
        </button>

        <div className='flex flex-col my-5 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans my-5 text-[#000000]'>
            LAB TEST DETAILS
          </h1>
        </div>

        {/* Patient Information */}
        <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
          <h2 className='text-2xl font-bold text-[#000000] mb-6 border-b pb-2'>
            Patient Information
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex items-center'>
              <IoPersonOutline className='w-8 h-8 text-[#34a85a] mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Patient Name</p>
                <p className='text-xl font-semibold text-[#000000]'>
                  {medicalBill.patientName}
                </p>
              </div>
            </div>

            <div className='flex items-center'>
              {medicalBill.patientGender === "MALE" ? (
                <BsGenderMale className='w-7 h-7 text-[#87ceeb] mr-4' />
              ) : (
                <BsGenderFemale className='w-7 h-7 text-[#87ceeb] mr-4' />
              )}
              <div>
                <p className='text-sm text-gray-500'>Gender</p>
                <p className='text-xl font-semibold text-[#000000]'>
                  {medicalBill.patientGender}
                </p>
              </div>
            </div>

            <div className='flex items-center'>
              <FaRegCalendarAlt className='w-7 h-7 text-[#34a85a] mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Birth Date</p>
                <p className='text-xl font-semibold text-[#000000]'>
                  {formatDate(medicalBill.patientBirthDate)}
                  <span className='text-gray-500 text-base ml-2'>
                    ({calculateAge(medicalBill.patientBirthDate)} years)
                  </span>
                </p>
              </div>
            </div>

            <div className='flex items-center'>
              <FaUserDoctor className='w-8 h-8 text-[#34a85a] mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Doctor</p>
                <p className='text-xl font-semibold text-[#000000]'>
                  {medicalBill.doctorName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Tests Section */}
        <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
          <div className='flex justify-between items-center mb-6 border-b pb-2'>
            <div>
              <h2 className='text-2xl font-bold text-[#000000]'>Lab Tests</h2>
              <div className='flex mt-2 text-sm space-x-4'>
                <span className='text-gray-500'>
                  Total: {medicalBill.examinationDetails.length}
                </span>
                {paidTests > 0 && (
                  <span className='text-[#34a85a]'>Paid: {paidTests}</span>
                )}
                {unpaidTests > 0 && (
                  <span className='text-orange-500'>Unpaid: {unpaidTests}</span>
                )}
              </div>
            </div>
            <div className='flex items-center bg-[#edf9f2] px-4 py-2 rounded-lg'>
              <p className='text-[#34a85a] font-medium mr-2'>
                Total Unpaid Amount:
              </p>
              <p className='text-2xl font-bold text-[#34a85a]'>
                {formatCurrency(medicalBill.totalUnpaidAmount)}
              </p>
            </div>
          </div>

          {/* Selection controls */}
          <div className='flex justify-between mb-4'>
            <div className='flex space-x-2'>
              {/* Xóa các nút Select All và Deselect All */}
            </div>

            <button
              onClick={() => (
                handleSubmitPayment(),
                window.scrollTo({ top: 0, behavior: "smooth" })
              )}
              disabled={selectedLabTests.length === 0 || isSubmitting}
              className={`flex items-center px-4 py-1.5 rounded-lg text-white text-sm transition-colors ${
                selectedLabTests.length > 0 && !isSubmitting
                  ? "bg-[#34a85a] hover:bg-[#2e8b46]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2'></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCreditCard className='mr-2' />
                  Submit Payment ({selectedLabTests.length})
                </>
              )}
            </button>
          </div>

          {medicalBill.examinationDetails &&
          medicalBill.examinationDetails.length > 0 ? (
            <div className='space-y-4'>
              {medicalBill.examinationDetails.map((test) => (
                <div
                  key={test.id}
                  className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
                    test.status === "PAID"
                      ? "bg-[#edf9f2] opacity-70 cursor-default"
                      : "bg-[#edf9f2] border border-[#34a85a] cursor-default"
                  }`}
                >
                  <div className='flex items-center'>
                    {test.status !== "PAID" && (
                      <div className='w-5 h-5 border rounded mr-3 flex items-center justify-center bg-white'>
                        <div className='w-3 h-3 bg-[#34a85a] rounded-sm'></div>
                      </div>
                    )}
                    <MdOutlineScience className='w-7 h-7 text-[#87ceeb] mr-3' />
                    <p className='text-lg font-medium text-[#000000]'>
                      {test.examinationType}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <div className='mr-6'>
                      <p className='text-xl font-semibold text-[#34a85a]'>
                        {formatCurrency(test.labPrice || 0)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        test.status === "PAID"
                          ? "bg-[#edf9f2] text-[#34a85a] border border-[#34a85a]"
                          : "bg-[#fff8ed] text-orange-500 border border-orange-300"
                      }`}
                    >
                      {test.status === "PAID" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <MdOutlineScience className='w-12 h-12 text-[#87ceeb] mx-auto mb-3' />
              <p className='text-gray-500'>
                No lab tests found for this medical bill.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTestPaymentDetail;
