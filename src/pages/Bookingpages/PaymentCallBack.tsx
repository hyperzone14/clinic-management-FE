// import React from "react";

// const PaymentCallBack = () => {
//   return (
//     <div>
//       <div className="w-full">
//         <div className="mt-16">
//           <h1 className="text-4xl font-bold font-sans my-5 text-center">
//             PAYMENT COMPLETE
//           </h1>
//         </div>

//         <div className="mt-18">
//           <div className="flex justify-center">
//             <div className="w-1/3">
//               <div className="text-center">
//                 <h2 className="text-2xl font-bold">
//                   Thank you for your payment
//                 </h2>
//                 <p className="text-lg">
//                   Your payment has been successfully processed, You can close
//                   this page now
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentCallBack;

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PaymentCallback = () => {
  const location = useLocation();

  useEffect(() => {
    // Parse the URL parameters from VNPay
    const searchParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

    // Check if payment was successful (00 is success code for VNPay)
    const isSuccess = vnp_ResponseCode === "00";

    // Notify the parent window about payment completion
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "PAYMENT_COMPLETE",
          success: isSuccess,
        },
        window.location.origin
      );
    }
  }, [location]);

  return (
    <div className="w-full">
      <div className="mt-16">
        <h1 className="text-4xl font-bold font-sans my-5 text-center">
          PAYMENT COMPLETE
        </h1>
      </div>

      <div className="mt-18">
        <div className="flex justify-center">
          <div className="w-1/3">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Thank you for your payment</h2>
              <p className="text-lg">
                Your payment has been successfully processed. You can close this
                window now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
