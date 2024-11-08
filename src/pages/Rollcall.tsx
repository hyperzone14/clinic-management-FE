import React from "react";
import { BsXCircle } from "react-icons/bs";

// Define the type for each date
interface DateInfo {
  month: string;
  year: number;
  day: number;
  status: string;
}

const Rollcall = () => {
  // State to store weeks of dates
  const [weeks, setWeeks] = React.useState<DateInfo[][]>([]);

  // Function to generate dates for the current week, starting from today's date
  const generateWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

    const weekArray: DateInfo[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        month: date.toLocaleString("default", { month: "long" }),
        year: date.getFullYear(),
        day: date.getDate(),
        status: "Absent",
      };
    });
    setWeeks([weekArray]); // Wrap in an array to represent weeks
  };

  React.useEffect(() => {
    // Initial generation of dates
    generateWeekDates();

    // Set interval to update dates at midnight
    const intervalId = setInterval(() => {
      generateWeekDates();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">ROLL CALL</h1>
      </div>

      <div className="mt-10">
        {weeks.map((week: DateInfo[], weekIndex: number) => (
          <div key={weekIndex} className="flex gap-x-3 col-span-7">
            {week.map((date: DateInfo, index: number) => (
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
        ))}
        <div className="flex justify-center my-3">
          <img
            src="/assets/images/arrow-down.png"
            alt="arrow"
            className="w-28 h-28"
          />
        </div>
        <div className="flex justify-center mt-3 my-12">
          <div className="bg-[#fff] px-5 py-3 rounded-lg w-6/12 h-fit">
            <h1 className="text-3xl font-bold font-sans text-center">
              Attendance
            </h1>
            <div className="mt-5 px-3">
              <div className="flex justify-between">
                <p className="font-bold text-2xl">Attendance date:</p>
                <p className=" text-2xl">03/11/2024</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="font-bold text-2xl">Doctor:</p>
                <p className=" text-2xl">Dr. John Doe</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="font-bold text-2xl">Checking in time:</p>
                <p className=" text-2xl">08:00 AM</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="font-bold text-2xl">Checking out time:</p>
                <p className=" text-2xl">16:00 PM</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="font-bold text-2xl">Status:</p>
                <p className=" text-2xl">Pending</p>
              </div>
            </div>
            <div className="flex justify-center my-5">
              <button
                className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out text-xl"
                onClick={() => {}}
              >
                Checking in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rollcall;
