import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchAppointmentsWithPagination,
  updateAppointmentStatus,
  StatusType,
  Appointment,
} from "../redux/slices/scheduleSlice";
import { initializeTreatmentAsync } from "../redux/slices/treatmentSlice";
import AppointmentCard from "../components/common/AppointmentCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Schedule: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const { appointments, loading, error, currentDoctor, totalPages } = useAppSelector(
    (state) => state.schedule
  );

  useEffect(() => {
    dispatch(fetchAppointmentsWithPagination({ page: currentPage, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePatientClick = async (appointment: Appointment, index: number) => {
    if (appointment.status === 'checked-in') {
      try {
        if (!appointment.patientId || !appointment.doctorId) {
          toast.error('Missing required appointment data');
          return;
        }

        await dispatch(initializeTreatmentAsync({
          patientId: Number(appointment.patientId),
          patientName: appointment.patientName,
          doctorId: Number(appointment.doctorId),
          doctorName: appointment.doctorName,
          appointmentId: Number(appointment.id),
          appointmentDate: appointment.appointmentDate,
          gender: appointment.gender,
          birthDate: appointment.birthDate
        })).unwrap();

        navigate('/schedule/medical-service');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Error initializing treatment: ${errorMessage}`);
      }
    } else if (appointment.status.toLowerCase() === 'lab_test_completed') {
      try {
        if (!appointment.patientId || !appointment.doctorId) {
          toast.error('Missing required appointment data');
          return;
        }

        
        navigate('/medical-bill-final', {
          state: {
            patientId: Number(appointment.patientId),
            patientName: appointment.patientName,
            doctorId: Number(appointment.doctorId),
            doctorName: appointment.doctorName,
            appointmentId: Number(appointment.id),
            appointmentDate: appointment.appointmentDate
          }
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Error navigating to medical bill: ${errorMessage}`);
      }
    } else {
      switch (appointment.status.toLowerCase()) {
        case 'success':
          toast.info(`This appointment has already been completed for ${appointment.patientName}`);
          break;
        case 'cancelled':
          toast.warning(`This appointment was cancelled for ${appointment.patientName}`);
          break;
        case 'lab_test_completed':
          toast.info(`Lab tests have been completed for ${appointment.patientName}`);
          break;
        default:
          toast.error(`Appointment must be checked-in to proceed.`);
      }
    }
  };

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    const appointment = appointments[index];
    if (appointment) {
      dispatch(updateAppointmentStatus({ id: appointment.id, status: newStatus }))
        .unwrap()
        .then(() => {
          switch (newStatus.toLowerCase()) {
            case 'success':
              toast.success(`Appointment completed successfully for ${appointment.patientName}`);
              break;
            case 'cancelled':
              toast.info(`Appointment cancelled for ${appointment.patientName}`);
              break;
            case 'checked-in':
              toast.success(`${appointment.patientName} has been checked in`);
              break;
            case 'confirmed':
              toast.success(`Appointment confirmed for ${appointment.patientName}`);
              break;
            case 'lab_test_required':
              toast.info(`Lab tests required for ${appointment.patientName}`);
              break;
            case 'lab_test_completed':
              toast.success(`Lab tests completed for ${appointment.patientName}`);
              break;
            default:
              toast.info(`Appointment status updated to ${newStatus} for ${appointment.patientName}`);
          }
        })
        .catch((error) => {
          toast.error(`Failed to update appointment status: ${error.message || 'Unknown error occurred'}`);
        });
    } else {
      toast.error('Failed to update status: Appointment not found');
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
      <ToastContainer/>
      
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">SCHEDULE</h1>
      </div>

      <div className="my-12 flex flex-col items-center">
        {/* Status Legend */}
        <div className="flex gap-4 mb-6 w-9/12 flex-wrap">
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
            {toast.error(`Error loading appointments: ${error}`)}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {appointments.length === 0 ? (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-xl text-gray-600">No appointments found</p>
                <p className="text-sm text-gray-500 mt-2">
                  No appointments scheduled for today
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

export default Schedule;