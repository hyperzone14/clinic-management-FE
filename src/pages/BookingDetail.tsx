import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppDispatch, RootState } from "../redux/store"; // Add RootState
import { useDispatch, useSelector } from "react-redux"; // Add useSelector
import { getAppointmentById } from "../redux/slices/appointmentSlice";
import Title from "../components/common/Title";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Reschedule from "../components/common/Reschedule";

const BookingDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [openReschedule, setOpenReschedule] = useState(false);
  const [appointmentId, setAppointmentId] = React.useState<number | undefined>(
    undefined
  );

  // Get appointment data from Redux store
  const { currentAppointment, loading, error } = useSelector(
    (state: RootState) => state.appointment
  );

  useEffect(() => {
    const id = sessionStorage.getItem("appointmentId");

    if (id === null || isNaN(Number(id))) {
      toast.error("No ID found in sessionStorage");
      navigate("/booking-bill");
      return;
    }

    const numId = Number(id);
    setAppointmentId(numId);
    dispatch(getAppointmentById(numId));
  }, [dispatch, navigate]);

  const formatDate = (date: string | undefined): string => {
    if (!date) return "Invalid Date";

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    } catch {
      return "Invalid Date";
    }
  };

  const getDaysDifference = (appointmentDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appDate = new Date(appointmentDate);
    appDate.setHours(0, 0, 0, 0);

    const differenceInTime = appDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
  };

  const handleOpenReschedule = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!currentAppointment?.appointmentDate) {
      toast.error("Invalid appointment date");
      return;
    }

    const daysDifference = getDaysDifference(
      currentAppointment.appointmentDate
    );

    if (daysDifference <= 2) {
      toast.error(
        "Appointments can only be rescheduled before 2 days of the appointment date"
      );
      return;
    }

    setOpenReschedule(true);
  };

  const handleCloseReschedule = () => {
    setOpenReschedule(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentAppointment) {
    return <div>No appointment found</div>;
  }

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="mt-16">
          <h1 className="text-4xl font-bold font-sans my-5 text-center">
            BOOKING DETAIL
          </h1>
          <div>
            <div className="mt-10 mx-16">
              <Title id={5} />
              <div className="mt-10 mx-16 px-3">
                <div className="flex">
                  <p className="font-bold text-2xl">Full Name: </p>
                  <span className="ms-12 text-2xl text-[#A9A9A9]">
                    {currentAppointment.patientResponseDTO?.fullName}
                  </span>
                </div>
                <div className="mt-7 grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Date of birth: </p>
                    <span className="ms-4 text-2xl text-[#A9A9A9]">
                      {formatDate(
                        currentAppointment.patientResponseDTO?.birthDate
                      )}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Gender: </p>
                    <div className="ms-5 flex">
                      <label className="flex items-center text-2xl">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={
                            currentAppointment.patientResponseDTO?.gender ===
                            "MALE"
                          }
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        Male
                      </label>

                      <label className=" ms-5 flex items-center text-2xl">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={
                            currentAppointment.patientResponseDTO?.gender ===
                            "FEMALE"
                          }
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        Female
                      </label>

                      <label className="ms-5 flex items-center text-2xl">
                        <input
                          type="radio"
                          name="gender"
                          value="Other"
                          checked={
                            currentAppointment.patientResponseDTO?.gender ===
                            "OTHER"
                          }
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        Other
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Citizen ID: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {currentAppointment.patientResponseDTO?.citizenId}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Email: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {currentAppointment.patientResponseDTO?.email}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex">
                  <p className="font-bold text-2xl">Address: </p>
                  <span className="ms-16 text-2xl text-[#A9A9A9]">
                    {currentAppointment.patientResponseDTO?.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="my-10 mx-16">
              <Title id={6} />
              <div className="mt-10 mx-16 px-3">
                <div className="grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Appointment ID: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {currentAppointment.id}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Doctor: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9] ">
                      {currentAppointment.doctorName}
                    </span>
                  </div>
                  <div className=" mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Status: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9] ">
                      {currentAppointment.appointmentStatus}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Date: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {formatDate(currentAppointment.appointmentDate)}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Time Slot: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {currentAppointment.timeSlot}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Price: </p>
                    <span className="ms-10 text-2xl text-[#A9A9A9]">
                      70.000 VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center my-20 gap-x-5">
              <button
                className="bg-[#FF4747] hover:bg-[#FF1F1F] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  handleOpenReschedule();
                }}
              >
                Reschedule
              </button>
              <button
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  navigate("/booking-bill");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  sessionStorage.removeItem("appointmentId");
                }}
              >
                Back to Booking bill
              </button>
            </div>
          </div>
        </div>
        {openReschedule && (
          <Reschedule
            openReschedule={openReschedule}
            handleCloseReschedule={handleCloseReschedule}
            appointmentId={appointmentId}
            doctorId={currentAppointment.doctorId}
          />
        )}
      </div>
    </>
  );
};

export default BookingDetail;
