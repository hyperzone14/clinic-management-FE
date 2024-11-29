// import React from "react";
// import { useLocation } from "react-router-dom";

// const PaymentSuccess = () => {
//   const location = useLocation();

//   // Parse query parameters directly
//   const searchParams = new URLSearchParams(location.search);

//   // Extract VNPay parameters
//   const amount = searchParams.get("vnp_Amount");
//   const orderInfo = searchParams.get("vnp_OrderInfo");
//   const responseCode = searchParams.get("vnp_ResponseCode");
//   const transactionStatus = searchParams.get("vnp_TransactionStatus");

//   // Determine if payment was successful
//   const isSuccess = responseCode === "00" && transactionStatus === "00";

//   return (
//     <div className="w-full">
//       <div className="mt-16">
//         <h1 className="text-4xl font-bold font-sans my-5 text-center">
//           {isSuccess ? "PAYMENT COMPLETE" : "PAYMENT FAILED"}
//         </h1>
//       </div>

//       <div className="mt-18">
//         <div className="flex justify-center">
//           <div className="w-1/3">
//             <div className="text-center">
//               {isSuccess ? (
//                 <>
//                   <h2 className="text-2xl font-bold">
//                     Thank you for your payment
//                   </h2>
//                   <p className="text-lg">
//                     Your payment has been successfully processed.
//                   </p>
//                   {amount && (
//                     <p className="text-md mt-4">
//                       Amount Paid: {(parseInt(amount) / 100).toLocaleString()}{" "}
//                       VND
//                     </p>
//                   )}
//                   {orderInfo && (
//                     <p className="text-md">
//                       Order: {decodeURIComponent(orderInfo)}
//                     </p>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <h2 className="text-2xl font-bold text-red-500">
//                     Payment Failed
//                   </h2>
//                   <p className="text-lg">
//                     There was an issue processing your payment.
//                   </p>
//                   <p className="text-md mt-4">Response Code: {responseCode}</p>
//                 </>
//               )}

//               <p className="text-sm mt-4">You can close this page now</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  // const navigate = useNavigate();

  useEffect(() => {
    // Log the full URL for debugging
    console.log("Full URL:", window.location.href);
  }, []);

  // Parse query parameters safely
  const searchParams = new URLSearchParams(location.search);

  // Extract VNPay parameters with fallback
  const amount = searchParams.get("vnp_Amount") || "0";
  const orderInfo = searchParams.get("vnp_OrderInfo") || "Unknown Order";
  const responseCode = searchParams.get("vnp_ResponseCode") || "Unknown";
  const transactionStatus =
    searchParams.get("vnp_TransactionStatus") || "Unknown";

  // Determine if payment was successful
  const isSuccess = responseCode === "00" && transactionStatus === "00";

  return (
    <div className=" flex items-center justify-center p-4 my-2">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1
          className={`text-4xl font-bold mb-6 ${
            isSuccess ? "text-green-600" : "text-red-500"
          }`}
        >
          {isSuccess ? "Payment Complete" : "Payment Failed"}
        </h1>

        <div className="space-y-4">
          {isSuccess ? (
            <>
              <h2 className="text-2xl font-semibold text-green-700">
                Thank You for Your Payment
              </h2>
              <p className="text-gray-600">
                Your payment has been successfully processed.
              </p>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-md">
                  <span className="font-medium">Amount Paid:</span>{" "}
                  {(parseInt(amount) / 100).toLocaleString()} VND
                </p>
                <p className="text-md mt-2">
                  <span className="font-medium">Order:</span>{" "}
                  {decodeURIComponent(orderInfo)}
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-red-700">
                Payment Processing Error
              </h2>
              <p className="text-gray-600">
                There was an issue processing your payment.
              </p>
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-md">
                  <span className="font-medium">Response Code:</span>{" "}
                  {responseCode}
                </p>
                <p className="text-md">
                  <span className="font-medium">Transaction Status:</span>{" "}
                  {transactionStatus}
                </p>
              </div>
            </>
          )}

          <p className="text-sm text-gray-500 mt-4">
            You can close this page or continue browsing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
