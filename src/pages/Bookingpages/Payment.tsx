import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { updateAppointmentStatus } from "../../redux/slices/appointmentSlice";
import ProgressBar from "../../components/common/ProgressBar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PaymentResponse {
  status: string;
  message: string;
  url: string;
}

interface AppointmentResponse {
  result: {
    id: number;
    appointmentStatus: string;
    appointmentDate: string;
    doctorId: number;
    patientId: number;
    timeSlot: number;
  };
}

interface BookingStepProps {
  goToNextStep: () => void;
}

const Payment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Get goToNextStep from outlet context
  const { goToNextStep } = useOutletContext<BookingStepProps>();

  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );

  const handlePaymentClick = async () => {
    if (!currentAppointment?.id) {
      toast.error("No appointment selected for payment");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.get<PaymentResponse>(
        `http://localhost:8080/api/payment/create_payment/${currentAppointment.id}`
      );

      if (response.data?.url) {
        const newWindow = window.open(
          response.data.url,
          "VNPayWindow",
          "width=1000,height=800"
        );
        setPaymentWindow(newWindow);
      } else {
        toast.error("Invalid payment URL received");
      }
      setIsProcessing(false);
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error("Failed to create payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // const checkPaymentStatus = async () => {
  //   if (!currentAppointment?.id) {
  //     toast.error("No appointment selected");
  //     return;
  //   }

  //   try {
  //     setIsProcessing(true);

  //     // Direct API call to get appointment by ID
  //     const response = await axios.get<AppointmentResponse>(
  //       `http://localhost:8080/api/appointment/${currentAppointment.id}`
  //     );

  //     const appointment = response.data.result;

  //     if (appointment && appointment.appointmentStatus === "CONFIRMED") {
  //       setIsPaymentConfirmed(true);
  //       await dispatch(
  //         updateAppointmentStatus({
  //           id: currentAppointment.id,
  //           status: "CONFIRMED",
  //         })
  //       );
  //       // Use goToNextStep instead of navigate
  //       goToNextStep();
  //     } else {
  //       toast.info(
  //         "Payment not yet confirmed. Please complete the payment process."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error checking appointment status:", error);
  //     toast.error("Error checking payment status. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const checkPaymentStatus = async () => {
    console.log("Starting payment status check");
    if (!currentAppointment?.id) {
      console.log("No appointment found");
      toast.error("No appointment selected");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Fetching appointment status");

      const response = await axios.get<AppointmentResponse>(
        `http://localhost:8080/api/appointment/${currentAppointment.id}`
      );

      console.log("Received response:", response.data);
      const appointment = response.data.result;

      if (appointment && appointment.appointmentStatus === "CONFIRMED") {
        console.log("Payment confirmed, updating state");
        setIsPaymentConfirmed(true);

        await dispatch(
          updateAppointmentStatus({
            id: currentAppointment.id,
            status: "CONFIRMED",
          })
        ).unwrap();

        console.log("State updated, navigating to next step");
        goToNextStep();
      } else {
        console.log("Payment not confirmed yet");
        toast.info(
          "Payment not yet confirmed. Please complete the payment process."
        );
      }
    } catch (error) {
      console.error("Error checking appointment status:", error);
      toast.error("Error checking payment status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (paymentWindow) {
        paymentWindow.close();
      }
    };
  }, [paymentWindow]);

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={2} />
        </div>
        <div className="mt-24">
          <div>
            <h1 className="text-4xl font-bold font-sans my-5 text-center">
              Payment
            </h1>
            <div className="w-full text-center">
              <span className="text-2xl mt-5 text-[#A9A9A9]">
                Quick, Secure Clinic Payments—Your Seamless Path to Better
                Health!
              </span>
            </div>
            <div className="flex grid grid-cols-2 gap-4 my-24 px-10 justify-items-center">
              <div className="col-span-1 flex items-center justify-end">
                <p className="text-2xl font-bold text-[#34A85A] text-end max-w-md">
                  {currentAppointment
                    ? `Confirm Your Booking for ${currentAppointment.appointmentDate}`
                    : "Please select an appointment first"}
                </p>
              </div>
              <div className="col-span-1 flex items-center">
                <div
                  className={`hover:shadow-xl transition duration-300 ease-in-out rounded-2xl ${
                    !isProcessing && currentAppointment
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={
                    currentAppointment && !isProcessing
                      ? handlePaymentClick
                      : undefined
                  }
                >
                  <img
                    src="/assets/images/vnpay.png"
                    alt="payment"
                    className="w-56 p-5"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center my-3">
              <button
                onClick={checkPaymentStatus}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-lg text-white text-lg font-semibold transition duration-300 ease-in-out
                  ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {isProcessing ? "Checking..." : "Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
