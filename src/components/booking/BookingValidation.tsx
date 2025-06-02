import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

interface useBookingValidationProps {
  isManualBooking?: boolean;
}

const useBookingValidation = ({
  isManualBooking = false,
}: useBookingValidationProps = {}): {
  validateStep: (step: number) => ValidationResult;
} => {
  const infoList = useSelector((state: RootState) => state.infoList);
  // const payment = useSelector((state: RootState) => state.payment);
  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );

  const validateStep = (step: number): ValidationResult => {
    if (!isManualBooking) {
      switch (step) {
        case 0: // Service selection step
          if (!infoList.service || !infoList.type) {
            return {
              isValid: false,
              errorMessage:
                "Please select both service type and make a selection",
            };
          }
          return { isValid: true, errorMessage: "" };

        case 1: // Date & Time selection step
          // console.log(infoList.date, infoList.time, infoList.timeSlot);
          if (!infoList.date || !infoList.time) {
            return {
              isValid: false,
              errorMessage: "Please select date, time and time slot",
            };
          }
          return { isValid: true, errorMessage: "" };

        case 2: // Purchase step
          // Check if payment has been initiated
          if (!currentAppointment || !currentAppointment.id) {
            return {
              isValid: false,
              errorMessage:
                "No appointment has been created. Please go back and create an appointment.",
            };
          }

          // First, check the payment status before proceeding
          return { isValid: true, errorMessage: "" };

        case 3: // Final step - always valid since it's just confirmation
          return { isValid: true, errorMessage: "" };

        default:
          return { isValid: false, errorMessage: "Unknown step" };
      }
    } else {
      switch (step) {
        case 0: // Patient selection step
          if (!infoList.patientId) {
            return {
              isValid: false,
              errorMessage: "Please add a patient information",
            };
          }
          return { isValid: true, errorMessage: "" };
        case 1: // Service selection step
          if (!infoList.service || !infoList.type) {
            return {
              isValid: false,
              errorMessage:
                "Please select both service type and make a selection",
            };
          }
          return { isValid: true, errorMessage: "" };

        case 2: // Date & Time selection step
          if (
            !infoList.date ||
            !infoList.time ||
            infoList.timeSlot === undefined ||
            infoList.timeSlot === null
          ) {
            return {
              isValid: false,
              errorMessage: "Please select date, time and time slot",
            };
          }
          return { isValid: true, errorMessage: "" };

        case 3: // Purchase step
          // Check if payment has been initiated
          if (!currentAppointment || !currentAppointment.id) {
            return {
              isValid: false,
              errorMessage:
                "No appointment has been created. Please go back and create an appointment.",
            };
          }

          // First, check the payment status before proceeding
          return { isValid: true, errorMessage: "" };

        case 4: // Final step - always valid since it's just confirmation
          return { isValid: true, errorMessage: "" };

        default:
          return { isValid: false, errorMessage: "Unknown step" };
      }
    }
  };

  return { validateStep };
};

export default useBookingValidation;
