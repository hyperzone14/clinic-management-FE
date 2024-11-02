import React from "react";
import { BsXCircle } from "react-icons/bs";

const Rollcall = () => {
  const dates = Array(7).fill({
    month: "November",
    year: "2024",
    day: 2,
    status: "Absent",
  });
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">ROLL CALL</h1>
        </div>

        <div className="mt-10">
          <div className="flex gap-x-3 col-span-7">
            {dates.map((date, index) => (
              <div
                key={index}
                className="bg-[#fff] w-fit h-fit rounded-xl hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer"
              >
                <div className="flex gap-x-5 py-3 px-5">
                  <span className="text-md font-bold font-sans">
                    {date.month}
                  </span>
                  <span className="text-md font-bold font-sans">
                    {date.year}
                  </span>
                </div>
                <p className="text-center text-6xl font-bold font-sans mt-5">
                  {date.day}
                </p>
                <div className="my-5 flex justify-center items-center">
                  <BsXCircle className="w-5 h-5" />
                  <span className="text-lg font-sans ms-3">{date.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center my-3">
            <img
              src="/assets/images/arrow-down.png"
              alt="arrow"
              className="w-28 h-32"
            />
          </div>
          <div className="flex justify-center my-5">
            <div className="bg-[#fff] px-5 py-3 rounded-lg w-7/12 h-fit">
              <h1 className="text-3xl font-bold font-sans text-center">
                Attendance
              </h1>
              <div className="mt-5"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rollcall;
