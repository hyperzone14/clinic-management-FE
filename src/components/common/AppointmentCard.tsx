import React from "react";
import { StatusType } from "../../redux/slices/scheduleSlice";
import StatusCircle from "./StatusCircle";

interface AppointmentCardProps {
  appointment: {
    patientName: string;
    patientImage: string;
    gender: string;
    appointmentType: string;
    status: StatusType;
  };
  index: number;
  onPatientClick: (appointment: any, index: number) => void;
  onStatusChange: (index: number, status: StatusType) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  index,
  onPatientClick,
  onStatusChange,
}) => {
  // Helper function to get border color and hover state based on status
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'check-in':
        return "border-blue-500 hover:shadow-lg hover:bg-gray-50 cursor-pointer";
      case 'pending':
        return "border-yellow-400 hover:shadow-lg hover:bg-gray-50 cursor-pointer";
      case 'completed':
        return "border-green-500";
      case 'cancelled':
        return "border-red-500 opacity-75";
      case 'confirm':
        return "border-purple-500 hover:shadow-lg hover:bg-gray-50 cursor-pointer";
      default:
        return "";
    }
  };

  // Helper function to get badge styles based on status
  const getBadgeStyles = (status: StatusType) => {
    switch (status) {
      case 'check-in':
        return "bg-blue-100 text-blue-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      case 'confirm':
        return "bg-purple-100 text-purple-800";
      default:
        return "";
    }
  };

  // Helper function to get tooltip message
  const getTooltipMessage = (status: StatusType) => {
    switch (status) {
      case 'check-in':
        return "Click to create medical bill";
      case 'pending':
        return "Waiting for check-in";
      case 'completed':
        return "Treatment completed";
      case 'cancelled':
        return "Appointment cancelled";
      case 'confirm':
        return "Waiting for confirmation";
      default:
        return "";
    }
  };

  return (
    <div
      onClick={() => onPatientClick(appointment, index)}
      className={`
        group relative
        flex items-center bg-white p-4 rounded-lg shadow-md transition-all duration-200
        border-l-4 ${getStatusStyles(appointment.status)}
      `}
    >
      {/* Tooltip */}
      <div
        className={`
        absolute invisible group-hover:visible
        px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2
        text-sm text-white bg-gray-600
        `}
      >
        {getTooltipMessage(appointment.status)}
      </div>

      <img
        src={appointment.patientImage}
        alt={appointment.patientName}
        className="w-[150px] h-[150px] rounded-full object-cover"
      />
      
      <div className="ml-6 flex-grow">
        <h3 className="text-xl font-semibold text-black">
          {appointment.patientName}
        </h3>
        <p className="text-gray-600 mt-1">{appointment.gender}</p>
        <p className="text-gray-500">{appointment.appointmentType}</p>
        
        {/* Status Badge */}
        <span
          className={`
          inline-block mt-2 px-2 py-1 rounded-full text-sm
          ${getBadgeStyles(appointment.status)}
        `}
        >
          {appointment.status.charAt(0).toUpperCase() + 
            appointment.status.slice(1).replace('-', ' ')}
        </span>
      </div>

      {/* Status Circle - Stop event propagation to prevent card click */}
      <div onClick={(e) => e.stopPropagation()}>
        <StatusCircle
          status={appointment.status}
          onStatusChange={(newStatus) => onStatusChange(index, newStatus)}
        />
      </div>
    </div>
  );
};

export default AppointmentCard;