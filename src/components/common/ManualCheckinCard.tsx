import React from 'react';
import { BsClockHistory } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserCircleLight } from "react-icons/pi";
import StatusCircle from './StatusCircle';
import { StatusType } from '../../redux/slices/scheduleSlice';

// Define the enum to match backend
export enum AppointmentStatus {
    CHECKED_IN = "CHECKED_IN",
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    CANCELLED = "CANCELLED",
    CONFIRMED = "CONFIRMED"
}

// Map AppointmentStatus to StatusType
const mapAppointmentStatusToStatusType = (status: string = AppointmentStatus.PENDING): StatusType => {
    const enumStatus = parseAppointmentStatus(status);
    switch (enumStatus) {
        case AppointmentStatus.CHECKED_IN:
            return 'checked-in' as StatusType;
        case AppointmentStatus.PENDING:
            return 'pending' as StatusType;
        case AppointmentStatus.SUCCESS:
            return 'success' as StatusType;
        case AppointmentStatus.CANCELLED:
            return 'cancelled' as StatusType;
        case AppointmentStatus.CONFIRMED:
            return 'confirmed' as StatusType;
        default:
            return 'pending' as StatusType;
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
        default:
            return "";
    }
};

const getTooltipMessage = (status: string = AppointmentStatus.PENDING): string => {
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

const formatStatus = (status: string): string => {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const ManualCheckinCard: React.FC<ManualCheckinProps> = ({
    appointment,
    index,
    onStatusChange
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
                ${enumStatus === AppointmentStatus.CHECKED_IN ? 'border-blue-500' : ''}
                ${enumStatus === AppointmentStatus.PENDING ? 'border-yellow-400' : ''}
                ${enumStatus === AppointmentStatus.SUCCESS ? 'border-green-500' : ''}
                ${enumStatus === AppointmentStatus.CANCELLED ? 'border-red-500' : ''}
                ${enumStatus === AppointmentStatus.CONFIRMED ? 'border-purple-500' : ''}
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

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center">
                        <PiUserCircleLight className="w-12 h-12 text-green-500" />
                        <h2 className="text-2xl font-semibold text-gray-900 ms-3">
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

                <div className="text-right">
                    <div className="flex items-center justify-end mb-2">
                        <p className="text-lg font-medium text-gray-700 me-3">
                            {appointment.doctorName || "Not assigned"}
                        </p>
                        <FaUserDoctor className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-end mb-2">
                        <p className="text-gray-600 me-3">
                            {appointment.appointmentDate}
                        </p>
                        <FaRegCalendarAlt className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-end">
                        <p className="text-gray-600 me-3">
                            {appointment.timeSlot || "N/A"}
                        </p>
                        <BsClockHistory className="w-6 h-6" />
                    </div>
                </div>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center ms-5"
                >
                    <StatusCircle
                        status={mapAppointmentStatusToStatusType(appointment.appointmentStatus)}
                        onStatusChange={(newStatus) => onStatusChange(index, newStatus)}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManualCheckinCard;