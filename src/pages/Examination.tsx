import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchLabTestAppointments,
  updateAppointmentStatus,
  StatusType,
  Appointment,
} from "../redux/slices/scheduleSlice";
import AppointmentCard from "../components/common/AppointmentCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Examination: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { appointments, loading, error, totalPages } = useAppSelector(
    (state) => state.schedule
  );

  const fetchAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    dispatch(fetchLabTestAppointments({
      appointmentDate: today,
      page: currentPage,
      size: pageSize,
      sort: 'timeSlot,desc',
    }));
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, pageSize]); 

  const handlePatientClick = (appointment: Appointment, index: number) => {
    console.log('Clicked appointment:', appointment);
    console.log('Current status:', appointment.status);
    
    switch (appointment.status) {
      case 'lab_test_required':
        navigate(`/examination/${appointment.id}`, {
          state: { 
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            appointmentId: appointment.id
          }
        });
        break;
      case 'lab_test_completed':
        toast.info(`Lab test results are ready for ${appointment.patientName}`);
        navigate(`/medical-history?id=${appointment.patientId}`);
        break;
      default:
        toast.warning(`Invalid status for lab examination`);
    }
  };

  const handleStatusChange = async (index: number, newStatus: StatusType) => {
    const appointment = appointments[index];
    if (appointment) {
      try {
        await dispatch(updateAppointmentStatus({ 
          id: appointment.id, 
          status: newStatus 
        })).unwrap();
        
        // Refresh the appointments list after status update
        fetchAppointments();
        
        switch (newStatus) {
          case 'lab_test_completed':
            toast.success(`Lab tests completed for ${appointment.patientName}`);
            break;
          case 'lab_test_required':
            toast.info(`Lab tests required for ${appointment.patientName}`);
            break;
          default:
            toast.info(`Status updated to ${newStatus} for ${appointment.patientName}`);
        }
      } catch (error: any) {  
        toast.error(`Failed to update status: ${error?.message || 'Unknown error occurred'}`);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Invalid page number');
    }
  };

  return (
    <div className="w-full">
      <ToastContainer />

      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">LABORATORY EXAMINATION</h1>
      </div>

      <div className="my-12 flex flex-col items-center">
        {/* Status Legend */}
        <div className="flex gap-4 mb-6 w-9/12 flex-wrap">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm text-gray-600">Lab Test Required</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-sky-500 mr-2"></div>
            <span className="text-sm text-gray-600">Lab Test Completed</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            {toast.error(`Error loading lab test appointments: ${error}`)}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {appointments.length === 0 ? (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-xl text-gray-600">No lab test appointments found</p>
                <p className="text-sm text-gray-500 mt-2">
                  No laboratory examinations scheduled for today
                </p>
              </div>
            ) : (
              <>
                <div className="w-9/12 space-y-4 max-h-[70vh] pr-4 overflow-y-auto">
                  {appointments.map((appointment, index) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={{
                        id: appointment.id,
                        patientId: appointment.patientId,
                        doctorId: appointment.doctorId,
                        patientName: appointment.patientName,
                        status: appointment.status,
                        doctorName: appointment.doctorName,
                        timeSlot: appointment.timeSlot,
                        appointmentDate: appointment.appointmentDate,
                        appointmentType: appointment.appointmentType,
                        gender: appointment.gender,
                        birthDate: appointment.patientResponseDTO?.birthDate || ''
                      }}
                      index={index}
                      onPatientClick={handlePatientClick}
                      onStatusChange={handleStatusChange}
                      showLabTestStatusesOnly={true}
                    />
                  ))}
                </div>

                <div className="flex justify-center space-x-4 mt-10 mb-5">
                  <button
                    className="px-4 py-2 bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Examination;