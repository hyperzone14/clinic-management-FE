/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { BsClockHistory } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserCircleLight } from "react-icons/pi";
import StatusCircle from "./StatusCircle";
import { StatusType } from "../../redux/slices/scheduleSlice";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
];

// Define the enum to match backend
export enum AppointmentStatus {
  CHECKED_IN = "CHECKED_IN",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  CANCELLED = "CANCELLED",
  CONFIRMED = "CONFIRMED",
  LAB_TEST_REQUIRED = "LAB_TEST_REQUIRED",
  LAB_TEST_COMPLETED = "LAB_TEST_COMPLETED",
}

// Map AppointmentStatus to StatusType
const mapAppointmentStatusToStatusType = (
  status: string = AppointmentStatus.PENDING
): StatusType => {
  const enumStatus = parseAppointmentStatus(status);
  switch (enumStatus) {
    case AppointmentStatus.CHECKED_IN:
      return "checked-in" as StatusType;
    case AppointmentStatus.PENDING:
      return "pending" as StatusType;
    case AppointmentStatus.SUCCESS:
      return "success" as StatusType;
    case AppointmentStatus.CANCELLED:
      return "cancelled" as StatusType;
    case AppointmentStatus.CONFIRMED:
      return "confirmed" as StatusType;
    case AppointmentStatus.LAB_TEST_REQUIRED:
      return "lab_test_required" as StatusType;
    case AppointmentStatus.LAB_TEST_COMPLETED:
      return "lab_test_completed" as StatusType;
    default:
      return "pending" as StatusType;
  }
};

interface PatientResponseDTO {
  fullName: string;
}

interface AppointmentData {
  id?: number;
  patientResponseDTO?: PatientResponseDTO;
  appointmentStatus: string;
  doctorName?: string;
  appointmentDate: string;
  timeSlot?: string;
  doctorId?: number;
  departmentId?: number;
  patientId?: number;
  payId?: number;
}

export interface ManualCheckinProps {
  appointment?: AppointmentData;
  index: number;
  onStatusChange: (index: number, status: StatusType) => void;
}

const parseAppointmentStatus = (status: string): AppointmentStatus => {
  const upperStatus = status.toUpperCase() as keyof typeof AppointmentStatus;
  return AppointmentStatus[upperStatus] || AppointmentStatus.PENDING;
};

const getBadgeStyles = (status: string = AppointmentStatus.PENDING): string => {
  const enumStatus = parseAppointmentStatus(status);
  switch (enumStatus) {
    case AppointmentStatus.CHECKED_IN:
      return "bg-blue-100 text-blue-800";
    case AppointmentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case AppointmentStatus.SUCCESS:
      return "bg-green-100 text-green-800";
    case AppointmentStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case AppointmentStatus.CONFIRMED:
      return "bg-purple-100 text-purple-800";
    case AppointmentStatus.LAB_TEST_REQUIRED:
      return "bg-orange-100 text-orange-800";
    case AppointmentStatus.LAB_TEST_COMPLETED:
      return "bg-sky-100 text-sky-800";
    default:
      return "";
  }
};

const getCardStyles = (status: string = AppointmentStatus.PENDING): string => {
  const enumStatus = parseAppointmentStatus(status);
  switch (enumStatus) {
    case AppointmentStatus.CHECKED_IN:
    case AppointmentStatus.CONFIRMED:
    case AppointmentStatus.PENDING:
      return "hover:shadow-lg hover:bg-gray-50 cursor-pointer";
    case AppointmentStatus.SUCCESS:
      return "";
    case AppointmentStatus.CANCELLED:
      return "opacity-75";
    case AppointmentStatus.LAB_TEST_REQUIRED:
      return "hover:shadow-lg hover:bg-gray-50 cursor-pointer";
    case AppointmentStatus.LAB_TEST_COMPLETED:
      return "";
    default:
      return "";
  }
};

const getTooltipMessage = (
  status: string = AppointmentStatus.PENDING
): string => {
  const enumStatus = parseAppointmentStatus(status);
  switch (enumStatus) {
    case AppointmentStatus.CHECKED_IN:
      return "Patient has checked in";
    case AppointmentStatus.PENDING:
      return "Waiting for check-in";
    case AppointmentStatus.SUCCESS:
      return "Appointment completed";
    case AppointmentStatus.CANCELLED:
      return "Appointment cancelled";
    case AppointmentStatus.CONFIRMED:
      return "Appointment confirmed";
    default:
      return "";
  }
};

const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleDateString("en-US", options);
};

const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const ManualCheckinCard: React.FC<ManualCheckinProps> = ({
  appointment,
  index,
  onStatusChange,
}) => {
  // If appointment is undefined, return null or a loading state
  if (!appointment) {
    return null; // or return a loading placeholder
  }

  const enumStatus = parseAppointmentStatus(appointment.appointmentStatus);

  return (
    <div
      className={`
                group relative
                w-full bg-white rounded-lg shadow-md p-6 
                transition-all duration-200
                border-l-4
                ${
                  enumStatus === AppointmentStatus.CHECKED_IN
                    ? "border-blue-500"
                    : ""
                }
                ${
                  enumStatus === AppointmentStatus.PENDING
                    ? "border-yellow-400"
                    : ""
                }
                ${
                  enumStatus === AppointmentStatus.SUCCESS
                    ? "border-green-500"
                    : ""
                }
                ${
                  enumStatus === AppointmentStatus.CANCELLED
                    ? "border-red-500"
                    : ""
                }
                ${
                  enumStatus === AppointmentStatus.CONFIRMED
                    ? "border-purple-500"
                    : ""
                }
                ${
                  enumStatus === AppointmentStatus.LAB_TEST_REQUIRED
                    ? "border-orange-500"
                    : ""
                }${
        enumStatus === AppointmentStatus.LAB_TEST_COMPLETED
          ? "border-sky-500"
          : ""
      }
                ${getCardStyles(appointment.appointmentStatus)}
            `}
    >
      <div
        className={`
                    absolute invisible group-hover:visible
                    px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2
                    text-sm text-white bg-gray-600 z-10
                    whitespace-nowrap
                `}
      >
        {getTooltipMessage(appointment.appointmentStatus)}
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='flex items-center'>
            <PiUserCircleLight className='w-12 h-12 text-green-500' />
            <h2 className='text-2xl font-semibold text-gray-900 ms-3'>
              {appointment.patientResponseDTO?.fullName || "N/A"}
            </h2>
          </div>
          <span
            className={`
                            inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium
                            ${getBadgeStyles(appointment.appointmentStatus)}
                        `}
          >
            {formatStatus(appointment.appointmentStatus)}
          </span>
        </div>

        <div className='text-right'>
          <div className='flex items-center justify-end mb-2'>
            <p className='text-lg font-medium text-gray-700 me-3'>
              {appointment.doctorName || "Not assigned"}
            </p>
            <FaUserDoctor className='w-6 h-6' />
          </div>
          <div className='flex items-center justify-end mb-2'>
            <p className='text-gray-600 me-3'>
              {formatDate(appointment.appointmentDate)}
            </p>
            <FaRegCalendarAlt className='w-6 h-6' />
          </div>
          <div className='flex items-center justify-end'>
            <p className='text-gray-600 me-3'>
              {TIME_SLOTS.find((time) => appointment.timeSlot == time.timeSlot)
                ?.time || "N/A"}
            </p>
            <BsClockHistory className='w-6 h-6' />
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className='flex items-center ms-5'
        >
          <StatusCircle
            status={mapAppointmentStatusToStatusType(
              appointment.appointmentStatus
            )}
            onStatusChange={(newStatus) => onStatusChange(index, newStatus)}
            isManualCheckin={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ManualCheckinCard;
