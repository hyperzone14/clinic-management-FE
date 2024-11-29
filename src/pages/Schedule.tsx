import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchDoctorAppointments,
  updateAppointmentStatus,
  StatusType,
  Appointment,
} from "../redux/slices/scheduleSlice";
import { initializeTreatmentAsync } from "../redux/slices/treatmentSlice";
import AppointmentCard from "../components/common/AppointmentCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthService } from "../utils/security/services/AuthService";

// Define status order for sorting
const STATUS_ORDER: Record<StatusType, number> = {
  'checked-in': 1,
  'lab_test_completed': 2,
  'lab_test_required': 3,
  'success': 4,
  'cancelled': 5,
  'pending': 6,
  'confirmed': 7
};

const Schedule: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const { appointments, loading, error, totalPages } = useAppSelector(
    (state) => state.schedule
  );

  // Sort appointments based on status order
  const sortedAppointments = [...appointments].sort((a, b) => {
    const statusOrderA = STATUS_ORDER[a.status as StatusType] || 999;
    const statusOrderB = STATUS_ORDER[b.status as StatusType] || 999;
    return statusOrderA - statusOrderB;
  });

  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      try {
        const doctorId = AuthService.getIdFromToken();
        const isDoctor = AuthService.hasRole('ROLE_DOCTOR');
        
        if (!doctorId || !isDoctor) {
          toast.error("Access denied: Doctor credentials required");
          navigate('/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const validatedPage = Math.max(0, currentPage);
        const validatedSize = Math.max(1, Math.min(100, pageSize));

        await dispatch(fetchDoctorAppointments({
          doctorId: Number(doctorId),
          appointmentDate: today,
          page: validatedPage,
          size: validatedSize,
          sort: 'timeSlot,desc'
        })).unwrap();

      } catch (err) {
        console.error("Error fetching doctor schedule:", err);
        toast.error("Failed to load appointments. Please try again.");
        
        if (err instanceof Error && err.message.includes('unauthorized')) {
          navigate('/login');
        }
      }
    };

    fetchDoctorSchedule();
  }, [dispatch, currentPage, pageSize, navigate]);

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
        case 'lab_test_required':
          toast.info(`Please go the lab for ${appointment.patientName} tests.`);
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
              toast.error(`${appointment.patientName} can not check-in by doctor`);
              break;
            case 'lab_test_required':
              toast.info(`Lab tests required for ${appointment.patientName}`);
              break;
            case 'lab_test_completed':
              toast.success(`Lab tests completed for ${appointment.patientName}`);
              break;
            // default:
            //   toast.info(`Appointment status updated to ${newStatus} for ${appointment.patientName}`);
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
    <div className="w-full min-h-screen bg-gray-50">
      <ToastContainer/>
      
      <div className="flex flex-col my-3 sm:my-4 md:my-5 mx-4 sm:mx-6 md:mx-10 justify-center items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans my-3 sm:my-4 md:my-5">
          Today's Schedule
        </h1>
      </div>

      <div className="my-6 sm:my-8 md:my-12 flex flex-col items-center px-4 sm:px-6 md:px-8">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 w-full sm:w-10/12 md:w-9/12">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Check-in</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-sky-500 mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Lab Test Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500 mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Lab Test Required</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Cancelled</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-3 sm:p-4">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {sortedAppointments.length === 0 ? (
              <div className="text-center p-6 sm:p-7 md:p-8 bg-gray-100 rounded-lg mx-4 w-full sm:w-10/12 md:w-9/12">
                <p className="text-lg sm:text-xl text-gray-600">No appointments found</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <>
                <div className="w-full sm:w-10/12 md:w-9/12 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] pr-2 sm:pr-3 md:pr-4 overflow-y-auto">
                  {sortedAppointments.map((appointment, index) => (
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

                <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4 mt-6 sm:mt-8 md:mt-10 mb-4 sm:mb-5">
                  <button
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out"
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