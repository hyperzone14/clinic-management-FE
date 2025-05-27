import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  createPayment,
  resetPaymentState,
} from "../../redux/slices/paymentSlice";
import { updateAppointmentStatus } from "../../redux/slices/appointmentSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setCashPaymentSelected } from "../../redux/slices/paymentSlice";

const Purchase: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState<boolean>(false);

  // Selectors
  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );
  const { isProcessing, error } = useSelector(
    (state: RootState) => state.payment
  );

  // Handle payment initialization
  const handlePaymentClick = async () => {
    if (!currentAppointment?.id) {
      toast.error("No appointment selected for payment");
      return;
    }

    try {
      setPaymentInitiated(true);
      const response = await dispatch(
        createPayment(currentAppointment.id.toString())
      ).unwrap();

      if (response.url) {
        const newWindow = window.open(
          response.url,
          "VNPayWindow",
          "width=1000,height=800"
        );
        setPaymentWindow(newWindow);
      } else {
        toast.error("Invalid payment URL received");
        setPaymentInitiated(false);
      }
    } catch (err) {
      setPaymentInitiated(false);
      if (err instanceof Error) {
        toast.error(
          err.message || "Failed to create payment. Please try again."
        );
      } else {
        toast.error("Failed to create payment. Please try again.");
      }
    }
  };

  // Handle Cash on Delivery payment
  const handleCoDpayment = async () => {
    if (!currentAppointment?.id) {
      toast.error("No appointment selected for payment");
      return;
    }

    try {
      setPaymentInitiated(true);
      await dispatch(
        updateAppointmentStatus({
          id: currentAppointment.id,
          status: "PENDING",
        })
      ).unwrap();

      dispatch(setCashPaymentSelected(true));

      toast.success("Cash payment selected successfully!");
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error("Failed to create payment. Please try again.");
      setPaymentInitiated(false);
    }
  };

  // Clean up payment window on unmount
  useEffect(() => {
    return () => {
      if (paymentWindow) {
        paymentWindow.close();
      }
      dispatch(resetPaymentState());
    };
  }, [paymentWindow, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      setPaymentInitiated(false);
    }
  }, [error]);

  return (
    <>
      <ToastContainer />
      <div className='mt-12 mb-16'>
        <div>
          <h1 className='text-4xl font-bold font-sans my-5 text-center'>
            Payment
          </h1>
          <div className='w-full text-center'>
            <span className='text-2xl mt-5 text-[#A9A9A9]'>
              Quick, Secure Clinic Payments—Your Seamless Path to Better Health!
            </span>
          </div>
          <div className='grid grid-cols-2 gap-4 my-12 px-10 justify-items-center'>
            <div className='col-span-1 flex items-center justify-end'>
              <p className='text-2xl font-bold text-[#34A85A] text-end'>
                {currentAppointment
                  ? `Confirm Your Booking for ${currentAppointment.appointmentDate}`
                  : "Please select an appointment first"}
              </p>
            </div>
            <div className='flex flex-col gap-y-8'>
              <div className='flex items-center gap-x-5'>
                <span className='font-bold text-xl'>Pay with VNPay</span>
                <div
                  className={`hover:shadow-xl transition duration-300 ease-in-out rounded-2xl ${
                    !isProcessing && currentAppointment && !paymentInitiated
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={
                    currentAppointment && !isProcessing && !paymentInitiated
                      ? handlePaymentClick
                      : undefined
                  }
                >
                  <img
                    src='/assets/images/vnpay.png'
                    alt='VNPay payment'
                    className='w-56 p-5'
                  />
                </div>
              </div>
              <div className='flex items-center gap-x-5'>
                <span className='font-bold text-xl'>Pay with Cash</span>
                <div
                  className={`hover:shadow-xl transition duration-300 ease-in-out rounded-2xl ${
                    !isProcessing && currentAppointment && !paymentInitiated
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={
                    currentAppointment && !isProcessing && !paymentInitiated
                      ? handleCoDpayment
                      : undefined
                  }
                >
                  <img
                    src='/assets/images/CoD.png'
                    alt='Cash payment'
                    className='w-36 p-5'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Purchase;
