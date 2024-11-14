import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchAppointmentPagination } from "../redux/slices/appointmentSlice";
import { BsClockHistory } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserCircleLight } from "react-icons/pi";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="flex items-center justify-center">
    <div className="mb-6 w-9/12">
      <div className="flex items-center bg-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
        <IoSearchOutline className="ml-3 text-gray-500" size={20} />
        <input
          type="text"
          value={value}
          placeholder="Search..."
          className="w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-gray-700"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    appointments = [],
    pagination,
    loading,
    error,
  } = useSelector((state: RootState) => state.appointment);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAppointmentPagination(pagination.currentPage));
  }, [dispatch, pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      dispatch(fetchAppointmentPagination(newPage));
    }
  };

  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((appointment) => {
      const hasPatientId = appointment?.id?.toString().includes(searchTerm);
      const hasPatientName = appointment?.patientResponseDTO?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const hasDoctorName = appointment?.doctorName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return hasPatientId || hasPatientName || hasDoctorName;
    })
    : [];

  const timeSlotMap: { [key: string]: string } = {
    SLOT_7_TO_8: "07:00 - 08:00",
    SLOT_8_TO_9: "08:00 - 09:00",
    SLOT_9_TO_10: "09:00 - 10:00",
    SLOT_13_TO_14: "13:00 - 14:00",
    SLOT_14_TO_15: "14:00 - 15:00",
    SLOT_15_TO_16: "15:00 - 16:00",
  };

  const formatTime = (timeSlot: string) => {
    return timeSlotMap[timeSlot] || "Invalid time slot";
  };

  const formatDate = (date: string | null): string => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAppointmentClick = (appointmentId: number | undefined) => {
    sessionStorage.setItem("appointmentId", String(appointmentId));
    navigate('/booking-bill/booking-detail');
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING BILL</h1>
        </div>

        <div className="my-12">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              Error loading appointments: {error}
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {filteredAppointments.length === 0 ? (
                <div className="text-center p-8 bg-gray-100 rounded-lg">
                  <p className="text-xl text-gray-600">No appointments found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "There are no appointments to display"}
                  </p>
                </div>
              ) : (
                <div className="w-9/12 space-y-4 max-h-[70vh] pr-4 overflow-y-auto">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white w-full rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer items-center p-4"
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      {/* <PiUserCircleLight className="w-20 h-20 text-green-500 ms-5" /> */}
                      <div className="ms-5 mt-3 flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <PiUserCircleLight className="w-12 h-12 text-green-500" />
                          <h1 className="font-bold text-3xl ms-3">
                            {appointment.patientResponseDTO?.fullName || "N/A"}
                          </h1>
                        </div>
                        <div className="flex flex-col items-end me-5">
                          <div className="flex my-2 items-center">
                            <p className="me-3 text-xl">
                              {appointment.doctorName || "Not assigned"}
                            </p>
                            <FaUserDoctor className="w-8 h-8" />
                          </div>
                          <div className="flex my-2 items-center">
                            <p className="me-3 text-xl">
                              {formatDate(appointment.appointmentDate) || "N/A"}
                            </p>
                            <FaRegCalendarAlt className="w-8 h-8" />
                          </div>
                          <div className="flex my-2 items-center">
                            <p className="me-3 text-xl">
                              {appointment.timeSlot
                                ? formatTime(appointment.timeSlot)
                                : "N/A"}
                            </p>
                            <BsClockHistory className="w-8 h-8" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center space-x-4 my-4">
                <button
                  className="px-4 py-2 bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </span>
                <button
                  className="px-4 py-2 bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages - 1
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div >
    </>
  );
};

export default AppointmentList;
