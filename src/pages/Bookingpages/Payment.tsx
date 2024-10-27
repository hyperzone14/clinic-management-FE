import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import axios from "axios";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const Payment: React.FC = () => {
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentClick = async () => {
    try {
      setIsProcessing(true);
      // Call your backend API to get payment URL
      const response = await axios.post("/api/payments/create");

      if (response.data?.paymentUrl) {
        // Redirect to payment page
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("vnp_ResponseCode");

    if (paymentStatus) {
      const verifyPayment = async () => {
        try {
          const response = await axios.get(
            `/api/payments/verify${window.location.search}`
          );
          if (response.data.success) {
            goToNextStep();
          } else {
            // Handle payment failure
            console.error("Payment verification failed");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      };

      verifyPayment();
    }
  }, [goToNextStep]);

  return (
    <>
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
                  Confirm Your Booking with a Quick, Secure Payment Here!
                </p>
              </div>
              {/* <div className="col-span-1 flex items-center">
                <div className="hover:shadow-xl transition duration-300 ease-in-out rounded-2xl">
                  <img
                    src="/assets/images/vnpay.png"
                    alt="payment"
                    className="w-56 p-5 cursor-pointer"
                  />
                </div>
              </div> */}
              <div className="col-span-1 flex items-center">
                <div
                  className="hover:shadow-xl transition duration-300 ease-in-out rounded-2xl"
                  onClick={handlePaymentClick}
                  style={{ cursor: isProcessing ? "wait" : "pointer" }}
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
          {/* Your component content here */}
          <button
            className="bg-[#34a85a] hover:bg-[#2e8b57] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
            onClick={() => {
              goToPreviousStep();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            disabled={isProcessing}
          >
            Previous
          </button>
          <button
            className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
            onClick={() => {
              goToNextStep();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            disabled={isProcessing}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Payment;
