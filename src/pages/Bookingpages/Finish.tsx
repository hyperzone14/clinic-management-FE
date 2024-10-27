import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import Title from "../../components/common/Title";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setBooking } from "../../redux/slices/bookingSlide";

interface BookingState {
  patientName: string | null;
  patientGender: string | null;
  patientDoB: string | null;
  patientCitizenId: string | null;
  patientPhoneNumber: string | null;
  patientAddress: string | null;
  service: string | null;
  type: string | null;
  date: string | null;
  time: string | null;
  price: string | null;
  note: string | null;
}

const Finish: React.FC = () => {
  const [bookingId, setBookingId] = useState<number>(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookingInfo = useSelector(
    (state: RootState) => state.bookingInfo
  ) as BookingState;
  const formatDate = (date: string | null): string => {
    if (!date) return "N/A";
    console.log("Date string:", date); // Add this line
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    } catch {
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const nextBookingId = bookingId + 1;
    setBookingId(nextBookingId);
    dispatch(
      setBooking({
        bookingId: nextBookingId,
      })
    );
  }, [dispatch]);

  console.log(bookingInfo.date);
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
                    {bookingInfo.patientName}
                  </span>
                </div>
                <div className="mt-7 flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Date of birth: </p>
                    <span className="ms-4 text-2xl text-[#A9A9A9]">
                      {/* DD/MM/YYYY */}
                      {formatDate(bookingInfo.patientDoB)}
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
                          checked={bookingInfo.patientGender === "Male"}
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
                          checked={bookingInfo.patientGender === "Female"}
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
                          checked={bookingInfo.patientGender === "Other"}
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        Other
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-7 flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Citizen ID: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {/* 123456789 */}
                      {bookingInfo.patientCitizenId}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Phone number: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9]">
                      {/* 0987654321 */}
                      {bookingInfo.patientPhoneNumber}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex">
                  <p className="font-bold text-2xl">Address: </p>
                  <span className="ms-16 text-2xl text-[#A9A9A9]">
                    {/* 123 abc road, district d city xyz */}
                    {bookingInfo.patientAddress}
                  </span>
                </div>
              </div>
            </div>
            <div className="my-10">
              <Title id={6} />
              <div className="mt-10 mb-10 mx-16 px-3">
                <div className="flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Service: </p>
                    <div className="ms-5 flex">
                      <label className="flex items-center text-2xl">
                        <input
                          type="radio"
                          name="service"
                          value="By Doctor"
                          checked={bookingInfo.service === "By doctor"}
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
                          checked={bookingInfo.service === "By date"}
                          // onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          disabled
                        />
                        By Date
                      </label>
                    </div>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Booking ID: </p>
                    <span className="ms-12 text-2xl text-[#A9A9A9]">
                      {bookingId}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    {bookingInfo.service === "By doctor" ? (
                      <p className="font-bold text-2xl">Doctor: </p>
                    ) : (
                      <p className="font-bold text-2xl">Specialty: </p>
                    )}
                    <span className="ms-5 text-2xl text-[#A9A9A9] ">
                      {/* Dr. John Doe */}
                      {bookingInfo.type}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Booking date: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9] text-right">
                      {/* DD/MM/YYYY */}
                      {formatDate(bookingInfo.date)}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex grid grid-cols-2 justify-between">
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Booking time: </p>
                    <span className="ms-5 text-2xl text-[#A9A9A9]">
                      {/* 13:50 */}
                      {bookingInfo.time}
                    </span>
                  </div>
                  <div className="col-span-1 flex">
                    <p className="font-bold text-2xl">Price: </p>
                    <span className="ms-28 text-2xl text-[#A9A9A9]">
                      {/* 75.000 VNĐ */}
                      {bookingInfo.price} VNĐ
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
                    {bookingInfo.price} VNĐ
                  </span>
                </div>
              </div>
              <div className="mt-7 grid grid-cols-2">
                <div className="col-span-1 flex"> </div>
                <div className="col-span-1 flex">
                  <p className="font-bold text-2xl">Note: </p>
                  <span className="ms-4 text-2xl text-[#A9A9A9] text-right w-5/12">
                    {/* Sigma, By doctor, Dr.John Doe, 11/09/2001, 15:30, 75.000 VND{" "} */}
                    {bookingInfo.note}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-5 mb-20">
              <button
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  navigate("/");
                  // Navigate to home and scroll to top
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
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
