import React from "react";
import { BsClockHistory } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserCircleLight } from "react-icons/pi";
import { StatusType, Gender } from "../../redux/slices/scheduleSlice";
import StatusCircle from "./StatusCircle";

interface AppointmentCardProps {
  appointment: {
    id: number;
    patientId: number;
    doctorId: number;
    patientName: string;
    status: StatusType;
    doctorName: string;
    timeSlot: string;
    appointmentDate: string;
    appointmentType: string;
    gender?: Gender;
    birthDate: string;
  };
  index: number;
  onPatientClick: (appointment: any, index: number) => void;
  onStatusChange: (index: number, status: StatusType) => void;
  showLabTestStatusesOnly?: boolean;
  disableStatusChange?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  index,
  onPatientClick,
  onStatusChange,
  showLabTestStatusesOnly = false,
  disableStatusChange = false,
}) => {
  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: Record<string, string> = {
      SLOT_7_TO_8: "7am to 8am",
      SLOT_8_TO_9: "8am to 9am",
      SLOT_9_TO_10: "9am to 10am",
      SLOT_13_TO_14: "1pm to 2pm",
      SLOT_14_TO_15: "2pm to 3pm",
      SLOT_15_TO_16: "3pm to 4pm",
    };
    return timeMap[timeSlot] || timeSlot;
  };

  const getBadgeStyles = (status: StatusType) => {
    switch (status) {
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "lab_test_required":
        return "bg-orange-100 text-orange-800";
      case "lab_test_completed":
        return "bg-sky-100 text-sky-800";
      case "pre_examination_completed":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "";
    }
  };

  const getTooltipMessage = (status: StatusType) => {
    if (showLabTestStatusesOnly) {
      switch (status) {
        case "lab_test_required":
          return "Click to perform lab tests";
        case "lab_test_completed":
          return "Lab test results are ready";
        default:
          return "";
      }
    }

    switch (status) {
      case "checked-in":
        return "Click to create medical bill";
      case "pending":
        return "Waiting for confirmation";
      case "success":
        return "Treatment completed";
      case "cancelled":
        return "Appointment cancelled";
      case "confirmed":
        return "Ready for check-in";
      case "lab_test_required":
        return "Laboratory tests are required";
      case "lab_test_completed":
        return "Lab test results are ready";
      case "pre_examination_completed":
        return "Pre-examination completed";
      default:
        return "";
    }
  };

  const getCardStyles = (status: StatusType) => {
    if (showLabTestStatusesOnly) {
      switch (status) {
        case "lab_test_required":
          return "hover:shadow-lg hover:bg-gray-50 cursor-pointer";
        case "lab_test_completed":
          return "";
        default:
          return "";
      }
    }

    switch (status) {
      case "checked-in":
      case "confirmed":
      case "pending":
      case "lab_test_required":
        return "hover:shadow-lg hover:bg-gray-50 cursor-pointer";
      case "success":
      case "lab_test_completed":
        return "";
      case "cancelled":
        return "opacity-75";
      case "pre_examination_completed":
        return "opacity-75";
      default:
        return "";
    }
  };

  return (
    <div
      onClick={() => onPatientClick(appointment, index)}
      className={`
        group relative
        w-full bg-white rounded-lg shadow-md
        p-4 md:p-6 hover:shadow-lg
        transition-all duration-200
        border-l-4 
        ${appointment.status === "checked-in" ? "border-blue-500" : ""}
        ${appointment.status === "pending" ? "border-yellow-400" : ""}
        ${appointment.status === "success" ? "border-green-500" : ""}
        ${appointment.status === "cancelled" ? "border-red-500" : ""}
        ${appointment.status === "confirmed" ? "border-purple-500" : ""}
        ${appointment.status === "lab_test_required" ? "border-orange-500" : ""}
        ${appointment.status === "lab_test_completed" ? "border-sky-500" : ""}
        ${
          appointment.status === "pre_examination_completed"
            ? "border-indigo-500"
            : ""
        }
        ${getCardStyles(appointment.status)}
      `}
    >
      {/* Tooltip */}
      <div
        className={`
          absolute invisible group-hover:visible
          px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2
          text-xs text-white bg-gray-600 z-10
          whitespace-nowrap
        `}
      >
        {getTooltipMessage(appointment.status)}
      </div>

      <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 md:justify-between'>
        {/* Left side - Patient info */}
        <div className='flex-1 w-full md:w-auto'>
          <div className='flex items-center'>
            <PiUserCircleLight className='w-8 h-8 md:w-12 md:h-12 text-green-500' />
            <h2 className='text-lg md:text-2xl font-semibold text-gray-900 ms-2 md:ms-3'>
              {appointment.patientName}
            </h2>
          </div>
          <span
            className={`
              inline-block mt-2 px-2 md:px-3 py-1 rounded-full text-xs font-medium
              ${getBadgeStyles(appointment.status)}
            `}
          >
            {appointment.status
              .split(/[-_]/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        </div>

        {/* Right side - Appointment details */}
        <div className='text-left md:text-right w-full md:w-auto'>
          <div className='flex items-center justify-start md:justify-end mb-2'>
            <p className='text-base md:text-lg font-medium text-gray-700 me-2 md:me-3'>
              Dr. {appointment.doctorName}
            </p>
            <FaUserDoctor className='w-5 h-5 md:w-6 md:h-6' />
          </div>
          <div className='flex items-center justify-start md:justify-end mb-2'>
            <p className='text-xs md:text-base text-gray-600 me-2 md:me-3'>
              {new Date(appointment.appointmentDate).toLocaleDateString()}
            </p>
            <FaRegCalendarAlt className='w-5 h-5 md:w-6 md:h-6' />
          </div>
          <div className='flex items-center justify-start md:justify-end'>
            <p className='text-xs md:text-base text-gray-600 me-2 md:me-3'>
              {formatTimeSlot(appointment.timeSlot)}
            </p>
            <BsClockHistory className='w-5 h-5 md:w-6 md:h-6' />
          </div>
        </div>

        {/* Status Circle */}
        <div
          onClick={(e) => e.stopPropagation()}
          className='flex items-center justify-end md:justify-center w-full md:w-auto md:ms-5'
        >
          <StatusCircle
            status={appointment.status}
            onStatusChange={(newStatus) => onStatusChange(index, newStatus)}
            showLabTestStatusesOnly={showLabTestStatusesOnly}
            disableStatusChange={disableStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
