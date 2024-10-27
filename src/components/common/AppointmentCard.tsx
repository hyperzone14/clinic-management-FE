// src/components/common/AppointmentCard.tsx

import React from 'react';
import { StatusType } from '../../redux/slices/scheduleSlice';
import StatusCircle from './StatusCircle';

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
  onStatusChange 
}) => {
  return (
    <div 
      onClick={() => onPatientClick(appointment, index)}
      className={`
        group relative
        flex items-center bg-white p-4 rounded-lg shadow-md transition-all duration-200
        ${appointment.status === 'pending' 
          ? 'hover:shadow-lg hover:bg-gray-50 cursor-pointer border-l-4 border-yellow-400' 
          : appointment.status === 'completed'
          ? 'border-l-4 border-green-500'
          : 'border-l-4 border-red-500 opacity-75'
        }
      `}
    >
      {/* Tooltip */}
      <div className={`
        absolute invisible group-hover:visible
        px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2
        text-sm text-white
        ${appointment.status === 'pending' 
          ? 'bg-blue-600'
          : 'bg-gray-600'
        }
      `}>
        {appointment.status === 'pending' 
          ? 'Click to start treatment'
          : appointment.status === 'completed'
          ? 'Treatment completed'
          : 'Appointment cancelled'
        }
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
        <span className={`
          inline-block mt-2 px-2 py-1 rounded-full text-sm
          ${appointment.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-800'
            : appointment.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }
        `}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      <div onClick={e => e.stopPropagation()}>
        <StatusCircle 
          status={appointment.status}
          onStatusChange={(newStatus) => onStatusChange(index, newStatus)} 
        />
      </div>
    </div>
  );
};

export default AppointmentCard;  // Added this line