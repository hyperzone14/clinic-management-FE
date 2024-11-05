import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/common/AppointmentCard";
import { RootState } from "../redux/store";
import {
  updateAppointmentStatus,
  StatusType,
  Appointment
} from "../redux/slices/scheduleSlice";
import { setPatientInfo } from "../redux/slices/treatmentSlice";

const Schedule: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentDoctor, appointments } = useSelector(
    (state: RootState) => state.schedule
  );

  const handlePatientClick = (appointment: Appointment, index: number) => {
    // Only allow creating medical bill for checked-in patients
    if (appointment.status === 'check-in') {
      try {
        dispatch(
          setPatientInfo({
            name: appointment.patientName,
            dateOfBirth: '', // You might want to add this to your appointment data
            gender: appointment.gender as "Male" | "Female",
          })
        );
        
        // Navigate to medical service
        navigate('/schedule/medical-service');
      } catch (error) {
        console.error("Error in handlePatientClick:", error);
      }
    }
  };

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    const currentStatus = appointments[index].status;
    
    // Define valid status transitions
    const validTransitions: Record<StatusType, StatusType[]> = {
      'pending': ['check-in', 'cancelled'],
      'check-in': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'confirm': ['check-in', 'cancelled']
    };

    if (validTransitions[currentStatus]?.includes(newStatus)) {
      dispatch(updateAppointmentStatus({ index, newStatus }));
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">SCHEDULE</h1>
          <div className="mb-4">
            <p className="text-gray-600 text-3xl">
              {currentDoctor}'s today schedule
            </p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-4 mx-10 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Check-in</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-sm text-gray-600">Confirm</span>
          </div>
        </div>

        <div className="space-y-4 mt-6 mb-20 mx-10">
          {appointments.map((appointment, index) => (
            <AppointmentCard
              key={index}
              appointment={appointment}
              index={index}
              onPatientClick={handlePatientClick}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Schedule;