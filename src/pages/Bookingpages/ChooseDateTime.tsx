import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import InformationList from "../../components/common/InformationList";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/global.css";
import Title from "../../components/common/Title";
import { useDispatch, useSelector } from "react-redux";
import { setInfoList } from "../../redux/slices/infoListSlice";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const ChooseDateTime: React.FC = () => {
  const dispatch = useDispatch();
  const infoList = useSelector((state: RootState) => state.infoList);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [disabledSlots, setDisabledSlots] = useState<number[]>([]);

  const workingDays = (infoList.workingDays || []).map(Number);
  // console.log(workingDays);

  const timeset = [
    {
      id: 1,
      time: "7AM-8AM",
    },
    {
      id: 2,
      time: "8AM-9AM",
    },
    {
      id: 3,
      time: "9AM-10AM",
    },
    {
      id: 4,
      time: "1PM-2PM",
    },
    {
      id: 5,
      time: "2PM-3PM",
    },
    {
      id: 6,
      time: "3PM-4PM",
    },
  ];

  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours()); // Add 7 hours to the current time

    const disableIds = timeset
      .map((timeSlot) => {
        const [end] = timeSlot.time.split("-");
        // const startDate = parseTime(start, now);
        const endDate = parseTime(end, now);

        return now > endDate ? timeSlot.id : null;
      })
      .filter((id) => id !== null) as number[];

    setDisabledSlots(disableIds);
  }, []);

  const parseTime = (time: string, baseDate: Date) => {
    const [hour, period] = time.match(/(\d+)([AP]M)/)!.slice(1);
    const date = new Date(baseDate);
    date.setHours(
      (parseInt(hour) % 12) + (period.toUpperCase() === "PM" ? 12 : 0),
      0,
      0,
      0
    );
    return date;
  };

  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value.length > 0) {
      const firstDate = value[0];
      setSelectedDate(firstDate);
    } else {
      setSelectedDate(null);
    }
  };

  useEffect(() => {
    dispatch(
      setInfoList({
        date: selectedDate ? selectedDate.toUTCString() : null,
        time: selectedTime,
      })
    );
  }, [dispatch, selectedDate, selectedTime]);

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={0} />
        </div>

        <div className="mt-24 grid grid-cols-3">
          <div className="col-span-2 me-10">
            <Title id={3} />
            <div className="mt-20 mb-10 flex justify-center items-center gap-3">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDetail="month"
                prevLabel="Previous"
                nextLabel="Next"
                // tileDisabled={({ date }) => date < today}
                tileDisabled={({ date }) => {
                  if (infoList.service === "By doctor") {
                    const dayOfWeek = date.getDay();
                    const isInWorkingDay = workingDays.includes(dayOfWeek);
                    return date < today || !isInWorkingDay; // Disables dates before today and any non-working days
                  } else {
                    return date < today; // Disables dates before today for other services
                  }
                }}
              />
            </div>
            {/* <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {timeset.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className="col-span-1 flex justify-center items-center"
                >
                  <div
                    className="my-3 w-fit h-fit p-3 rounded-lg bg-[#BAE3F3] hover:bg-[#87ceeb] transition duration-200 ease-in-out cursor-pointer text-[#1F3658] hover:text-[#fff] hover:shadow-lg"
                    onClick={() => setTime(timeSlot.time)}
                  >
                    <span className="font-bold">{timeSlot.time}</span>
                  </div>
                </div>
              ))}
            </div> */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {timeset.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className={`col-span-1 flex justify-center items-center ${
                    disabledSlots.includes(timeSlot.id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div
                    className={`my-3 w-fit h-fit p-3 rounded-lg ${
                      disabledSlots.includes(timeSlot.id)
                        ? "bg-gray-300 text-gray-500"
                        : "bg-[#BAE3F3] hover:bg-[#87ceeb] cursor-pointer text-[#1F3658] hover:text-[#fff] hover:shadow-lg"
                    } transition duration-200 ease-in-out`}
                    onClick={() => {
                      if (!disabledSlots.includes(timeSlot.id)) {
                        setSelectedTime(timeSlot.time);
                      }
                    }}
                  >
                    <span className="font-bold">{timeSlot.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 mb-20 flex justify-center items-center gap-3">
              <button
                className="bg-[#34a85a] hover:bg-[#2e8b57] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  goToPreviousStep();
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Previous
              </button>
              <button
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={() => {
                  if (selectedDate && selectedTime) {
                    goToNextStep();
                  } else {
                    toast.error(
                      "Please select the date and time for the reservation."
                    );
                  }
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Next
              </button>
            </div>
          </div>
          <div className="col-span-1">
            <InformationList />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChooseDateTime;
