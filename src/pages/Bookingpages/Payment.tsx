import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { updateAppointmentStatus } from "../../redux/slices/appointmentSlice";
import ProgressBar from "../../components/common/ProgressBar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

interface PaymentResponse {
  status: string;
  message: string;
  url: string;
}

const Payment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  const [isProcessing, setIsProcessing] = useState(false);

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
      // Using the exact endpoint from your API
      const response = await axios.get<PaymentResponse>(
        `http://localhost:8080/api/payment/create_payment/${currentAppointment.id}`
      );

      if (response.data?.url) {
        // Redirect to VNPay payment URL
        window.location.href = response.data.url;
      } else {
        toast.error("Invalid payment URL received");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error("Failed to create payment. Please try again.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get("vnp_ResponseCode");
    const txnRef = params.get("vnp_TxnRef");

    // Check if we're returning from payment
    if (responseCode && txnRef) {
      const verifyPayment = async () => {
        try {
          // The verification URL includes all query parameters
          const verificationResponse = await axios.get(
            `/api/payment/payment_info${window.location.search}`
          );

          if (
            responseCode === "00" &&
            verificationResponse.data?.status === "OK"
          ) {
            // Update appointment status to CONFIRMED
            if (currentAppointment?.id) {
              await dispatch(
                updateAppointmentStatus({
                  id: currentAppointment.id,
                  status: "CONFIRMED",
                })
              );
            }

            toast.success("Payment successful!");
            // Clear the URL parameters
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            goToNextStep();
          } else {
            toast.error("Payment was not successful. Please try again.");
            setIsProcessing(false);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast.error("Error verifying payment. Please contact support.");
          setIsProcessing(false);
        }
      };

      verifyPayment();
    }
  }, [currentAppointment?.id, goToNextStep, dispatch]);

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
          </div>
        </div>
        <div className="mt-16 mb-20 flex justify-center items-center gap-3">
          <button
            className="bg-[#34a85a] hover:bg-[#2e8b57] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out disabled:opacity-50"
            onClick={() => {
              goToPreviousStep();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={isProcessing}
          >
            Previous
          </button>
          <button
            className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out disabled:opacity-50"
            onClick={() => {
              if (currentAppointment?.status === "CONFIRMED") {
                goToNextStep();
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                toast.warning("Please complete payment before proceeding");
              }
            }}
            disabled={
              isProcessing || currentAppointment?.status !== "CONFIRMED"
            }
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Payment;
