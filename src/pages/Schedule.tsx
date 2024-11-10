import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchAppointments,
  updateAppointmentStatus,
  StatusType,
  Appointment
} from "../redux/slices/scheduleSlice";
import { initializeTreatment } from "../redux/slices/treatmentSlice";
import AppointmentCard from "../components/common/AppointmentCard";

const Schedule: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { appointments, loading, error, currentDoctor } = useAppSelector(
    (state) => state.schedule
  );

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handlePatientClick = (appointment: Appointment, index: number) => {
    // Check if the appointment is in a state that allows proceeding to medical service
    if (appointment.status === 'checked-in') {
      try {
        // Initialize treatment data
        dispatch(
          initializeTreatment({
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            appointmentId: appointment.id,
            appointmentDate: appointment.appointmentDate,
            gender: appointment.gender || 'Male' // Default to 'Male' if gender is not provided
          })
        );
        // Navigate to medical service page
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
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

      {/* Appointments List */}
      <div className="space-y-4 mt-6 mb-20 mx-10">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments found
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={{
                id: appointment.id,
                patientName: appointment.patientName,
                status: appointment.status,
                doctorName: appointment.doctorName,
                timeSlot: appointment.timeSlot,
                appointmentDate: appointment.appointmentDate,
                appointmentType: appointment.appointmentType
              }}
              index={index}
              onPatientClick={handlePatientClick}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        style={{ display: window.pageYOffset > 300 ? 'block' : 'none' }}
      >
        ↑
      </button>
    </div>
  );
};

export default Schedule;