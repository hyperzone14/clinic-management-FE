import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchAppointments,
  updateAppointmentStatus,
  StatusType,
} from "../redux/slices/scheduleSlice";
import { setPatientInfo } from "../redux/slices/treatmentSlice";
import AppointmentCard from "../components/common/AppointmentCard";

const Schedule: React.FC = () => {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const navigate = useNavigate();
  
  const { appointments, loading, error, currentDoctor } = useAppSelector(
    (state) => state.schedule
  );

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handlePatientClick = (appointment: any, index: number) => {
    // Update this condition to check for 'checked-in' status
    if (appointment.status === 'checked-in') {
      try {
        dispatch(
          setPatientInfo({
            name: appointment.patientName,
            dateOfBirth: '',
            gender: appointment.gender as "Male" | "Female",
          })
        );
        navigate('/schedule/medical-service');
      } catch (error) {
        console.error("Error in handlePatientClick:", error);
      }
    }
  };

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    const appointment = appointments[index];
    if (appointment) {
      dispatch(updateAppointmentStatus({ id: appointment.id, status: newStatus }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">SCHEDULE</h1>
        <div className="mb-4">
          <p className="text-gray-600 text-3xl">
            {currentDoctor ? `${currentDoctor}'s today schedule` : "Today's schedule"}
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
            key={appointment.id}
            appointment={appointment}
            index={index}
            onPatientClick={handlePatientClick}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Schedule;