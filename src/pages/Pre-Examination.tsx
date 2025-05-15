import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchPreExaminationAppointments,
  updateAppointmentStatus,
  StatusType,
  Appointment,
} from "../redux/slices/scheduleSlice";
import AppointmentCard from "../components/common/AppointmentCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthService } from "../utils/security/services/AuthService";

const PreExamination: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const { appointments, loading, error, totalPages } = useAppSelector(
    (state) => state.schedule
  );

  // Sort appointments to prioritize checked-in status
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === 'checked-in' && b.status !== 'checked-in') return -1;
    if (a.status !== 'checked-in' && b.status === 'checked-in') return 1;
    return 0;
  });

  useEffect(() => {
    const fetchPreExaminationData = async () => {
      try {
        const doctorId = AuthService.getIdFromToken();
        const isDoctor = AuthService.hasRole('ROLE_DOCTOR');
        
        if (!doctorId || !isDoctor) {
          toast.error("Access denied: Doctor credentials required");
          navigate('/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        await dispatch(fetchPreExaminationAppointments({
          appointmentDate: today,
          page: currentPage,
          size: pageSize,
          sort: 'timeSlot,desc'
        })).unwrap();

      } catch (err) {
        console.error("Error fetching pre-examination data:", err);
        toast.error("Failed to load appointments. Please try again.");
        
        if (err instanceof Error && err.message.includes('unauthorized')) {
          navigate('/login');
        }
      }
    };

    fetchPreExaminationData();
  }, [dispatch, currentPage, pageSize, navigate]);

  const handlePatientClick = (appointment: Appointment) => {
    if (appointment.status === 'checked-in') {
      navigate(`/pre_exam/${appointment.id}`, {
        state: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          patientName: appointment.patientName,
          doctorName: appointment.doctorName,
          appointmentDate: appointment.appointmentDate
        }
      });
    } else {
      toast.info("This patient's pre-examination has already been completed");
    }
  };

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    const appointment = appointments[index];
    if (appointment) {
      dispatch(updateAppointmentStatus({ id: appointment.id, status: newStatus }))
        .unwrap()
        .then(() => {
          toast.success(`Status updated for ${appointment.patientName}`);
        })
        .catch((error) => {
          toast.error(`Failed to update status: ${error.message || 'Unknown error occurred'}`);
        });
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
    <div className="w-full min-h-screen bg-[#f7f7f7]">
      <ToastContainer/>
      
      <div className="flex flex-col my-3 sm:my-4 md:my-5 mx-4 sm:mx-6 md:mx-10 justify-center items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans my-3 sm:my-4 md:my-5 text-[#4567b7]">
          Pre-Examination List
        </h1>
      </div>

      <div className="my-6 sm:my-8 md:my-12 flex flex-col items-center px-4 sm:px-6 md:px-8">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 w-full sm:w-10/12 md:w-9/12">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#4567b7] mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Checked In</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#34a85a] mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Pre-Examination Completed</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#4567b7]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-3 sm:p-4">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {sortedAppointments.length === 0 ? (
              <div className="text-center p-6 sm:p-7 md:p-8 bg-white rounded-lg mx-4 w-full sm:w-10/12 md:w-9/12 shadow-md">
                <p className="text-lg sm:text-xl text-[#4567b7]">No pre-examination appointments found</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  No patients are currently waiting for pre-examination
                </p>
              </div>
            ) : (
              <>
                <div className="w-full sm:w-10/12 md:w-9/12 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] pr-2 sm:pr-3 md:pr-4 overflow-y-auto">
                  {sortedAppointments.map((appointment, index) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      index={index}
                      onPatientClick={handlePatientClick}
                      onStatusChange={handleStatusChange}
                      disableStatusChange={true}
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
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-[#87ceeb] text-white rounded-lg disabled:opacity-50 hover:bg-[#4567b7] transition duration-300 ease-in-out"
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

export default PreExamination; 