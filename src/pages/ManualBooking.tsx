/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import "../styles/stepperStyle.css";
import Service from "../components/booking/Service";
import useBookingValidation from "../components/booking/BookingValidation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChooseDateTime from "../components/booking/ChooseDateTime";
import Payment from "../components/booking/Payment";
import Finish from "../components/booking/Finish";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import {
  addAppointmentByDepartment,
  addAppointmentByDoctor,
  // updateAppointmentStatus,
} from "../redux/slices/appointmentSlice";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { checkPaymentStatus } from "../redux/slices/paymentSlice";
import PatientInfo from "../components/booking/PatientInfo";

const steps = [
  "Patient Information",
  "Select Service",
  "Pick Date & Time",
  "Purchase",
  "Finish",
];

const ManualBooking = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [key: number]: boolean }>({});
  const { validateStep } = useBookingValidation({ isManualBooking: true });
  const dispatch = useDispatch<AppDispatch>();
  const infoList = useSelector((state: RootState) => state.infoList);
  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );
  const paymentStatus = useSelector((state: RootState) => state.payment);
  const [loading, setLoading] = useState(false);

  const totalSteps = steps.length;
  const completedSteps = Object.keys(completed).length;
  const allStepsCompleted = completedSteps === totalSteps;

  const handleBackButton = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // Scroll to top when moving to previous step
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Separated function to handle date/time submission
  const handleDateTimeSubmission = async (): Promise<boolean> => {
    if (!infoList.date || !infoList.time || !infoList.timeSlot) {
      toast.error("Please select the date and time for the reservation.");
      return false;
    }

    const selectedDate = new Date(infoList.date);
    const formattedDate = formatDateForApi(selectedDate);
    const baseAppointmentData = {
      patientId: infoList.patientId ?? 1,
      appointmentDate: formattedDate,
      timeSlot: infoList.timeSlot,
      status: "PENDING",
    };

    try {
      let result;

      if (infoList.service === "By doctor" && infoList.doctorId) {
        result = await dispatch(
          addAppointmentByDoctor({
            ...baseAppointmentData,
            doctorId: infoList.doctorId,
          })
        ).unwrap();
      } else if (infoList.service === "By date" && infoList.departmentId) {
        result = await dispatch(
          addAppointmentByDepartment({
            ...baseAppointmentData,
            departmentId: infoList.departmentId,
          })
        ).unwrap();
      } else {
        toast.error("Invalid service type or missing doctor/department ID");
        return false;
      }

      if (!result) {
        toast.error("There are no doctors available at the selected time.");
        return false;
      }

      toast.success("Appointment created successfully!");
      return true;
    } catch (error) {
      // console.error("Appointment creation error:", error);
      toast.error("Failed to create appointment. Please try again.");
      return false;
    }
  };

  // Function to handle payment status check before proceeding to final step
  const handlePaymentStatusCheck = async (): Promise<boolean> => {
    if (!currentAppointment?.id) {
      toast.error("No appointment selected");
      return false;
    }

    try {
      if (paymentStatus.cashPaymentSelected) return true;

      const result = await dispatch(
        checkPaymentStatus(currentAppointment.id.toString())
      ).unwrap();

      if (result === "CONFIRMED") {
        return true;
      } else {
        toast.info(
          "Payment not yet confirmed. Please complete the payment process."
        );
        return false;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(
          err.message || "Error checking payment status. Please try again."
        );
      } else {
        toast.error("Error checking payment status. Please try again.");
      }
      return false;
    }
  };

  // Main function to handle Next button click
  // const handleNextButton = async () => {
  //   const validation = validateStep(activeStep);

  //   if (!validation.isValid) {
  //     toast.error(validation.errorMessage);
  //     return;
  //   }

  //   // Special handling for date & time step
  //   if (activeStep === 2) {
  //     const success = await handleDateTimeSubmission();
  //     if (!success) {
  //       return;
  //     }
  //   }

  //   // Special handling for payment step
  //   if (activeStep === 3) {
  //     const paymentConfirmed = await handlePaymentStatusCheck();
  //     if (!paymentConfirmed) {
  //       return;
  //     }
  //   }

  //   // Mark the current step as completed
  //   const newCompleted = { ...completed };
  //   newCompleted[activeStep] = true;
  //   setCompleted(newCompleted);

  //   // Move to the next step
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);

  //   // Scroll to top when moving to next step
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const handleNextButton = async () => {
    const validation = validateStep(activeStep);

    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    setLoading(true); // Start loading

    // Special handling for date & time step
    if (activeStep === 1) {
      const success = await handleDateTimeSubmission();
      if (!success) {
        setLoading(false); // Stop loading if failed
        return;
      }
    }

    // Special handling for payment step
    if (activeStep === 2) {
      const paymentConfirmed = await handlePaymentStatusCheck();
      if (!paymentConfirmed) {
        setLoading(false); // Stop loading if failed
        return;
      }
    }

    // Mark the current step as completed
    const newCompleted = { ...completed };
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);

    // Move to the next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: "smooth" });

    setLoading(false); // Stop loading after everything is done
  };

  // Function to render the appropriate step component
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PatientInfo />;
      case 1:
        return <Service isManualBooking={true} />;
      case 2:
        return <ChooseDateTime />;
      case 3:
        return <Payment />;
      case 4:
        return <Finish />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <>
      <ToastContainer />
      <div>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5 mb-2'>
            BOOKING CENTER
          </h1>
        </div>
        <div className='mt-10 mb-5'>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              return (
                <Step key={index} completed={completed[index]}>
                  <StepLabel className='text-2xl'>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <div>
            {loading ? (
              <div className='flex justify-center items-center my-10'>
                {/* Simple spinner, you can use any spinner component or library */}
                <div className='loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin'></div>
              </div>
            ) : allStepsCompleted || activeStep === steps.length ? (
              <div className='text-center mt-10'>
                <h2 className='text-2xl font-bold text-green-600'>
                  Booking Complete!
                </h2>
                <p className='mt-2'>Thank you for your booking.</p>
              </div>
            ) : (
              <>
                {/* Render the step content */}
                {renderStepContent()}

                {/* Navigation buttons for all steps */}
                {activeStep < steps.length - 1 && (
                  <div className='mt-5 justify-between flex flex-row items-center px-10'>
                    <button
                      className={`bg-[#87ceeb] p-3 rounded-lg font-bold transition-colors duration-300 ${
                        activeStep === 0
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-[#62BFE4]"
                      }`}
                      onClick={handleBackButton}
                      disabled={activeStep === 0}
                    >
                      Back
                    </button>
                    <button
                      className={`bg-[#4567b7] p-3 rounded-lg text-white font-bold transition-colors duration-300 hover:bg-[#3E5CA3]`}
                      onClick={handleNextButton}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManualBooking;
