/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { searchAppointmentsCriteria } from "../redux/slices/appointmentSlice";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import ManualCheckinCard from "../components/common/ManualCheckinCard";
import {
  StatusType,
  updateAppointmentStatus,
} from "../redux/slices/scheduleSlice";
import { TbCheckupList } from "react-icons/tb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios";
import { AuthService } from "../utils/security/services/AuthService";

// Define the enum to match backend
enum AppointmentStatus {
  CHECKED_IN = "CHECKED_IN",
  PENDING = "PENDING",
  // SUCCESS = "SUCCESS",
  CANCELLED = "CANCELLED",
  CONFIRMED = "CONFIRMED",
  // LAB_TEST_REQUIRED = "LAB_TEST_REQUIRED",
  // LAB_TEST_COMPLETED="LAB_TEST_COMPLETED",
}

interface ApiErrorResponse {
  message: string;
  status: number;
  data?: {
    message: string;
  };
}

interface SearchFilters {
  appointmentId?: number;
  appointmentDate?: string;
  appointmentStatus?: AppointmentStatus;
}

// Helper function to format status for display
const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [appointmentStatus, setAppointmentStatus] = useState<
    AppointmentStatus | ""
  >("");

  const handleSearch = () => {
    const filters: SearchFilters = {};
    if (appointmentId) filters.appointmentId = parseInt(appointmentId);
    if (appointmentDate) filters.appointmentDate = appointmentDate;
    if (appointmentStatus) filters.appointmentStatus = appointmentStatus;
    onSearch(filters);
  };

  return (
    <div className='flex flex-col items-center justify-center space-y-4 mb-6 w-9/12'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 w-full'>
        <div className='flex items-center bg-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500'>
          <TbCheckupList className='ml-3 text-gray-500' />
          <input
            type='number'
            placeholder='Appointment ID'
            className='w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-gray-700'
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          />
        </div>

        <div className='flex items-center bg-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500'>
          <FaRegCalendarAlt className='ml-3 text-gray-500' />
          <input
            type='date'
            className='w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-gray-700'
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
        </div>

        <div className='flex items-center bg-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500'>
          <IoSearchOutline className='ml-3 text-gray-500' />
          <select
            className='w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-gray-700'
            value={appointmentStatus}
            onChange={(e) =>
              setAppointmentStatus(e.target.value as AppointmentStatus)
            }
          >
            <option value=''>Select Status</option>
            {Object.values(AppointmentStatus).map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300'
        >
          Search
        </button>
      </div>
    </div>
  );
};

const ManualCheckin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    appointments = [],
    pagination,
    loading,
    error,
  } = useSelector((state: RootState) => state.appointment);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const isDoctor = AuthService.hasRole("ROLE_DOCTOR");
    if (!isDoctor) {
      toast.error("Access denied: Doctor credentials required");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    handleSearch({ appointmentDate: today });
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    // console.log("Search filters:", filters);
    const updatedFilters = {
      ...filters,
      ...(filters.appointmentDate
        ? { appointmentDate: filters.appointmentDate }
        : {}),
    };

    setCurrentFilters(updatedFilters);
    dispatch(
      searchAppointmentsCriteria({
        ...updatedFilters,
        page: 0,
        size: 10,
        sort: "timeSlot,asc",
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const scrollContainer = document.querySelector(".overflow-y-auto");
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }

      dispatch(
        searchAppointmentsCriteria({
          ...currentFilters,
          page: newPage,
          size: 10,
          sort: "timeSlot,asc",
        })
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStatusChange = async (index: number, newStatus: StatusType) => {
    if (index >= 0 && index < appointments.length) {
      const appointment = appointments[index];
      if (!appointment?.id) {
        toast.error("Invalid appointment ID");
        return;
      }

      try {
        const updatePayload = {
          id: appointment.id,
          status: newStatus,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          payId: appointment.payId,
        };

        await dispatch(updateAppointmentStatus(updatePayload)).unwrap();

        // Refresh the appointments list
        dispatch(
          searchAppointmentsCriteria({
            ...currentFilters,
            page: pagination.currentPage,
            size: 10,
            sort: "timeSlot,asc",
          })
        );
      } catch (error) {
        // Type guard to check if error is AxiosError
        if (error instanceof AxiosError && error.response?.data) {
          const apiError = error.response.data as ApiErrorResponse;
          if (apiError.message) {
            toast.error(apiError.message);
          }
        }
        // console.error("Error updating appointment status:", error);
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className='w-full'>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans my-5'>MANUAL CHECKIN</h1>
        </div>

        <div className='my-12 flex flex-col items-center'>
          <SearchBar onSearch={handleSearch} />

          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
            </div>
          ) : error ? (
            <div className='text-red-500 text-center p-4'>
              Error loading appointments: {error}
            </div>
          ) : (
            <div className='flex flex-col items-center w-full'>
              {appointments.length === 0 ? (
                <div className='text-center p-8 bg-gray-100 rounded-lg'>
                  <p className='text-xl text-gray-600'>No appointments found</p>
                  <p className='text-sm text-gray-500 mt-2'>
                    Try adjusting your search filters
                  </p>
                </div>
              ) : (
                <>
                  <div className='w-9/12 space-y-4 h-[20rem] pr-4 overflow-y-auto'>
                    {appointments.map((appointment, index) => (
                      <ManualCheckinCard
                        key={`${appointment.id}-${appointment.appointmentStatus}`}
                        appointment={appointment}
                        index={index}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>

                  <div className='flex justify-center space-x-4 mt-10 mb-5'>
                    <button
                      className='px-4 py-2 bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out'
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 0}
                    >
                      Previous
                    </button>
                    <span className='px-4 py-2'>
                      Page {pagination.currentPage + 1} of{" "}
                      {pagination.totalPages}
                    </span>
                    <button
                      className='px-4 py-2 bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out'
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages - 1
                      }
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
    </>
  );
};

export default ManualCheckin;
