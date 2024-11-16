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
import { toast } from "react-toastify";

const Schedule: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const { appointments, loading, error, currentDoctor, totalPages, totalElements } = useAppSelector(
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
    } else {
      console.log('Appointment not in checked-in status:', appointment.status);
    }
  };

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    const appointment = appointments[index];
    if (appointment) {
      dispatch(updateAppointmentStatus({ id: appointment.id, status: newStatus }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    

    return (
      <div className="flex items-center justify-center mt-6 mb-8">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {"<<"}
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {"<"}
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {">"}
        </button>
        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {">>"}
        </button>
      </div>
    );
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    toast.error(`Error: ${error}`);
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">SCHEDULE</h1>
        <div className="mb-4">
          <p className="text-gray-600 text-3xl">
            {currentDoctor ? `${currentDoctor}'s today schedule` : "Today's schedule"}
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Showing {appointments.length} appointments (Page {currentPage + 1} of {totalPages})
          </p>
        </div>
      </div>

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

      <div className="space-y-4 mt-6 mx-10">
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
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;