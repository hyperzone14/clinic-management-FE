import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ProgressBar from "../../components/common/ProgressBar";
import Title from "../../components/common/Title";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", timeSlot: "SLOT_15_TO_16" },
] as const;

const Finish: React.FC = () => {
  const navigate = useNavigate();
  const { currentAppointment } = useSelector(
    (state: RootState) => state.appointment
  );
  const infoList = useSelector((state: RootState) => state.infoList);
  const departments = useSelector(
    (state: RootState) => state.department.departments
  );
  const [departmentInfo, setDepartmentInfo] = useState({
    departmentName: null as string | null,
  });

  useEffect(() => {
    if (!currentAppointment) {
      navigate("/");
    }
  }, [currentAppointment, navigate]);

  const formatPrice = (price: string | undefined): string => {
    if (!price || price === "N/A") return "N/A";
    const cleanPrice = price.replace(/[.,\s]/g, "");
    return cleanPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (date: string): string => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    } catch {
      return "Invalid Date";
    }
  };

  useEffect(() => {
    if (!currentAppointment || departments.length === 0) return;
    let departmentName = null;

    // Find department by searching through all departments and their doctors
    const department = departments.find((dept) =>
      dept.doctors.some((doctor) => doctor.id === currentAppointment.doctorId)
    );

    if (department) {
      departmentName = department.name;
    }

    setDepartmentInfo({
      departmentName,
    });
  }, [departments, currentAppointment]);

  if (!currentAppointment) {
    return null;
  }

  const { patientResponseDTO, appointmentDate, timeSlot, doctorName, id } =
    currentAppointment;

  return (
    <>
      <ToastContainer />
      <div className='w-full'>
        {/* <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans my-5'>BOOKING CENTER</h1>
          <ProgressBar currentStep={3} />
        </div> */}

        {/* <div className='mt-24'> */}
        {/* <h1 className='text-4xl font-bold font-sans my-5 text-center'>
            YOUR BOOKING BILL
          </h1> */}
        <div>
          <div className='mt-10 mx-16'>
            <Title id={5} />
            <div className='mt-10 mx-16 px-3'>
              {patientResponseDTO && (
                <>
                  <div className='flex'>
                    <p className='font-bold text-2xl'>Full Name: </p>
                    <span className='ms-12 text-2xl text-[#A9A9A9]'>
                      {patientResponseDTO.fullName}
                    </span>
                  </div>
                  <div className='mt-7 grid grid-cols-2 justify-between'>
                    <div className='col-span-1 flex'>
                      <p className='font-bold text-2xl'>Date of birth: </p>
                      <span className='ms-4 text-2xl text-[#A9A9A9]'>
                        {formatDate(patientResponseDTO.birthDate)}
                      </span>
                    </div>
                    <div className='col-span-1 flex'>
                      <p className='font-bold text-2xl'>Gender: </p>
                      <div className='ms-5 flex'>
                        <label className='flex items-center text-2xl'>
                          <input
                            type='radio'
                            name='gender'
                            value='Male'
                            checked={patientResponseDTO.gender === "MALE"}
                            // onChange={handleChange}
                            className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            disabled
                          />
                          Male
                        </label>

                        <label className=' ms-5 flex items-center text-2xl'>
                          <input
                            type='radio'
                            name='gender'
                            value='Female'
                            checked={patientResponseDTO.gender === "FEMALE"}
                            // onChange={handleChange}
                            className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            disabled
                          />
                          Female
                        </label>

                        <label className='ms-5 flex items-center text-2xl'>
                          <input
                            type='radio'
                            name='gender'
                            value='Other'
                            checked={patientResponseDTO.gender === "OTHER"}
                            // onChange={handleChange}
                            className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            disabled
                          />
                          Other
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='mt-7 grid grid-cols-2 justify-between'>
                    <div className='col-span-1 flex'>
                      <p className='font-bold text-2xl'>Citizen ID: </p>
                      <span className='ms-12 text-2xl text-[#A9A9A9]'>
                        {patientResponseDTO.citizenId}
                      </span>
                    </div>
                    <div className='col-span-1 flex'>
                      <p className='font-bold text-2xl'>Email: </p>
                      <span className='ms-12 text-2xl text-[#A9A9A9]'>
                        {patientResponseDTO.email}
                      </span>
                    </div>
                  </div>
                  <div className='mt-7 flex'>
                    <p className='font-bold text-2xl'>Address: </p>
                    <span className='ms-16 text-2xl text-[#A9A9A9]'>
                      {patientResponseDTO.address}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='my-10 mx-16'>
            <Title id={6} />
            <div className='mt-10 mx-16 px-3'>
              <div className='grid grid-cols-2 justify-between'>
                <div className='col-span-1 flex'>
                  <p className='font-bold text-2xl'>Service: </p>
                  <div className='ms-5 flex'>
                    <label className='flex items-center text-2xl'>
                      <input
                        type='radio'
                        name='service'
                        value='By Doctor'
                        checked={infoList.service === "By doctor"}
                        // onChange={handleChange}
                        className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                        disabled
                      />
                      By Doctor
                    </label>

                    <label className=' ms-5 flex items-center text-2xl'>
                      <input
                        type='radio'
                        name='service'
                        value='By Date'
                        checked={infoList.service === "By date"}
                        // onChange={handleChange}
                        className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                        disabled
                      />
                      By Date
                    </label>
                  </div>
                </div>
                <div className='col-span-1 flex'>
                  <p className='font-bold text-2xl'>Appointment ID: </p>
                  <span className='ms-12 text-2xl text-[#A9A9A9]'>{id}</span>
                </div>
                <div className=' mt-7 col-span-1 flex'>
                  <p className='font-bold text-2xl'>Doctor: </p>
                  <span className='ms-5 text-2xl text-[#A9A9A9] '>
                    {/* Dr. John Doe */}
                    {doctorName}
                  </span>
                </div>
                <div className=' mt-7 col-span-1 flex'>
                  <p className='font-bold text-2xl'>Department: </p>
                  <span className='ms-5 text-2xl text-[#A9A9A9] '>
                    {departmentInfo?.departmentName}
                  </span>
                </div>
                <div className='mt-7 col-span-1 flex'>
                  <p className='font-bold text-2xl'>Date: </p>
                  <span className='ms-12 text-2xl text-[#A9A9A9]'>
                    {formatDate(appointmentDate)}
                  </span>
                </div>
                <div className='mt-7 col-span-1 flex'>
                  <p className='font-bold text-2xl'>Time Slot: </p>
                  <span className='ms-12 text-2xl text-[#A9A9A9]'>
                    {
                      TIME_SLOTS.find((slot) => slot.timeSlot === timeSlot)
                        ?.time
                    }
                  </span>
                </div>
                <div className='mt-7 col-span-1 flex'>
                  <p className='font-bold text-2xl'>Price: </p>
                  <span className='ms-10 text-2xl text-[#A9A9A9]'>
                    {formatPrice(infoList.price)} VNĐ
                  </span>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className='my-10 mx-16 px-3'>
            <div className='mt-7 grid grid-cols-2'>
              <div className='col-span-1 flex'> </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Total Price: </p>
                <span className='ms-12 text-2xl text-[#A9A9A9]'>
                  {formatPrice(infoList.price)} VNĐ
                </span>
              </div>
            </div>
            <div className='mt-7 grid grid-cols-2'>
              <div className='col-span-1 flex'> </div>
              <div className='col-span-1 flex'>
                <p className='font-bold text-2xl'>Note: </p>
                <span className='ms-4 text-2xl text-[#A9A9A9] text-right w-5/12'>
                  {/* Sigma, By doctor, Dr.John Doe, 11/09/2001, 15:30, 75.000 VND{" "} */}
                  {infoList.note}
                </span>
              </div>
            </div>
          </div>
          <div className='flex justify-center items-center mt-5 mb-20'>
            <button
              className='bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out'
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
        {/* </div> */}
      </div>
    </>
  );
};

export default Finish;
