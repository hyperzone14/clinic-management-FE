import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import Title from "../../components/common/Title";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUsers } from "../../redux/slices/userManageSlice";
import { fetchDepartments } from "../../redux/slices/departmentSlice";

interface Patient {
  id: number;
  fullName: string;
  citizenId: string;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string | null;
  status: string | null;
}

const Finish: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<Patient | null>(null);
  const infoList = useSelector((state: RootState) => state.infoList);
  const users = useSelector((state: RootState) => state.userManage.users);
  const appointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );
  const departments = useSelector(
    (state: RootState) => state.department.departments
  );
  const [departmentInfo, setDepartmentInfo] = useState({
    departmentName: null as string | null,
    doctorName: null as string | null,
  });

  const formatDate = (date: string): string => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date");
      return dateObj.toLocaleDateString("en-GB");
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      await Promise.all([
        dispatch(fetchUsers()).unwrap(),
        dispatch(fetchDepartments()).unwrap(),
      ]);

      setIsLoading(false);
    };

    initializeData();
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && users.length > 0 && appointment?.patientId) {
      const foundUser = users.find((user) => user.id === appointment.patientId);

      if (foundUser) {
        setMatchedUser(foundUser);
      } else {
        setError("Patient information not found.");
        navigate("/booking", { replace: true });
      }
    } else if (!isLoading && (!appointment || !appointment.patientId)) {
      setError("No booking information found.");
      navigate("/booking", { replace: true });
    }
  }, [users, appointment, isLoading, navigate]);

  useEffect(() => {
    // Don't proceed if data isn't ready
    if (isLoading || !appointment || departments.length === 0) return;

    // Initialize default state
    let departmentName = null;
    let doctorName = null;

    // Find the department if we have a departmentId
    const department = departments.find(
      (dept) => dept.id === appointment.departmentId
    );

    // If we found the department, set its name
    if (department) {
      departmentName = department.name;

      // First try to find doctor in the matched department
      const doctorInDept = department.doctors.find(
        (doctor) => doctor.id === appointment.doctorId
      );
      if (doctorInDept) {
        doctorName = doctorInDept.fullName;
      }
    }

    // If we haven't found the doctor yet but have a doctorId,
    // search across all departments
    if (!doctorName && appointment.doctorId) {
      for (const dept of departments) {
        const doctorInfo = dept.doctors.find(
          (doctor) => doctor.id === appointment.doctorId
        );
        if (doctorInfo) {
          doctorName = doctorInfo.fullName;
          // If we didn't find a department earlier, use this doctor's department
          if (!departmentName) {
            departmentName = dept.name;
          }
          break;
        }
      }
    }

    setDepartmentInfo({
      departmentName,
      doctorName,
    });
  }, [departments, appointment, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">{error}</div>
        <button
          className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg"
          onClick={() => navigate("/booking")}
        >
          Return to Booking
        </button>
      </div>
    );
  }

  if (!matchedUser || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">
          Booking information is incomplete.
        </div>
        <button
          className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg"
          onClick={() => navigate("/booking")}
        >
          Return to Booking
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={3} />
        </div>

        <div className="mt-24">
          <h1 className="text-4xl font-bold font-sans my-5 text-center">
            YOUR BOOKING BILL
          </h1>
          <div>
            <div className="mt-10">
              <Title id={5} />
              <div className="mt-10 mx-16 px-3">
                <div className="flex">
                  <p className="font-bold text-2xl">Full Name: </p>
                  <span className="ms-12 text-2xl text-[#A9A9A9]">
                    {matchedUser.fullName}
                  </span>
                </div>
                <div className="mt-7 grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Date of birth: </p>
                    <span className="ms-4 text-2xl text-[#A9A9A9]">
                      {formatDate(matchedUser.birthDate)}
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
                          checked={matchedUser.gender === "MALE"}
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
                          checked={matchedUser.gender === "FEMALE"}
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
                          checked={matchedUser.gender === "OTHER"}
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
                      {matchedUser.citizenId}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Email: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {matchedUser.email}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex">
                  <p className="font-bold text-2xl">Address: </p>
                  <span className="ms-16 text-2xl text-[#A9A9A9]">
                    {matchedUser.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="my-10">
              <Title id={6} />
              <div className="mt-10 mx-16 px-3">
                <div className="flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Service: </p>
                    <div className="ms-5 flex">
                      <label className="flex items-center text-2xl">
                        <input
                          type="radio"
                          name="service"
                          value="By Doctor"
                          checked={infoList.service === "By doctor"}
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        By Doctor
                      </label>

                      <label className=" ms-5 flex items-center text-2xl">
                        <input
                          type="radio"
                          name="service"
                          value="By Date"
                          checked={infoList.service === "By date"}
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        By Date
                      </label>
                    </div>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Appointment ID: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {appointment.id}
                    </span>
                  </div>
                  <div className=" mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Doctor: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9] ">
                      {/* Dr. John Doe */}
                      {departmentInfo?.doctorName}
                    </span>
                  </div>
                  <div className=" mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Department: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9] ">
                      {/* Dr. John Doe */}
                      {departmentInfo?.departmentName}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Date: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {formatDate(appointment.appointmentDate)}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Time Slot: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {appointment.timeSlot}
                    </span>
                  </div>
                  <div className="mt-7 col-span-1 flex">
                    <p className="font-bold text-2xl">Price: </p>
                    <span className="ms-10 text-2xl text-[#A9A9A9]">
                      {infoList.price} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="my-10 mx-16 px-3">
              <div className="mt-7 grid grid-cols-2">
                <div className="col-span-1 flex"> </div>
                <div className="col-span-1 flex">
                  <p className="font-bold text-2xl">Total Price: </p>
                  <span className="ms-12 text-2xl text-[#A9A9A9]">
                    {/* 75.000 VNĐ */}
                    {infoList.price} VNĐ
                  </span>
                </div>
              </div>
              <div className="mt-7 grid grid-cols-2">
                <div className="col-span-1 flex"> </div>
                <div className="col-span-1 flex">
                  <p className="font-bold text-2xl">Note: </p>
                  <span className="ms-4 text-2xl text-[#A9A9A9] text-right w-5/12">
                    {/* Sigma, By doctor, Dr.John Doe, 11/09/2001, 15:30, 75.000 VND{" "} */}
                    {infoList.note}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-5 mb-20">
              <button
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  navigate("/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Finish;
