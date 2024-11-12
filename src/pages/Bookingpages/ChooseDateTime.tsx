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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addAppointmentByDepartment,
  addAppointmentByDoctor,
} from "../../redux/slices/appointmentSlice";
import { AppDispatch, RootState } from "../../redux/store";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Move timeset outside component since it's static
const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0 },
  { id: 2, time: "8AM-9AM", slot: 1 },
  { id: 3, time: "9AM-10AM", slot: 2 },
  { id: 4, time: "1PM-2PM", slot: 3 },
  { id: 5, time: "2PM-3PM", slot: 4 },
  { id: 6, time: "3PM-4PM", slot: 5 },
] as const;

const ChooseDateTime: React.FC = () => {
  // const addApointment = useSelector((state: RootState) => state.appointment);
  const dispatch = useDispatch<AppDispatch>();
  const infoList = useSelector((state: RootState) => state.infoList);
  // const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

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

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Update info list when date or time changes
  useEffect(() => {
    const timeSlot = TIME_SLOTS.find(
      (timeSlot) => timeSlot.time === selectedTime
    )?.slot;
    const dateString = selectedDate ? selectedDate.toUTCString() : null;

    dispatch(
      setInfoList({
        ...infoList,
        date: dateString,
        time: selectedTime,
        timeSlot: timeSlot,
      })
    );
  }, [selectedDate, selectedTime, dispatch]); // Removed infoList from dependencies

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select the date and time for the reservation.");
      return;
    }

    const timeSlotObj = TIME_SLOTS.find(
      (timeSlot) => timeSlot.time === selectedTime
    );
    if (!timeSlotObj) {
      toast.error("Invalid time slot selected");
      return;
    }

    const formattedDate = formatDateForApi(selectedDate);
    const appointmentData = {
      patientId: infoList.patientId ?? 1,
      appointmentDate: formattedDate,
      timeSlot: timeSlotObj.slot,
      status: "PENDING",
    };

    try {
      let result;

      if (infoList.service === "By doctor" && infoList.doctorId) {
        const doctorAppointment = {
          ...appointmentData,
          doctorId: infoList.doctorId,
        };
        result = await dispatch(
          addAppointmentByDoctor(doctorAppointment)
        ).unwrap();
      } else if (infoList.service === "By date" && infoList.departmentId) {
        const departmentAppointment = {
          ...appointmentData,
          departmentId: infoList.departmentId,
        };
        result = await dispatch(
          addAppointmentByDepartment(departmentAppointment)
        ).unwrap();
      } else {
        toast.error("Invalid service type or missing doctor/department ID");
        return;
      }

      if (result) {
        // Update only the date-related info in infoList
        dispatch(
          setInfoList({
            ...infoList,
            date: selectedDate.toISOString(),
            time: selectedTime,
            timeSlot: timeSlotObj.slot,
          })
        );
        toast.success("Appointment created successfully!");
        goToNextStep();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Appointment creation error:", error);
      toast.error("Failed to create appointment. Please try again.");
    }
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Ensure we're comparing dates at midnight local time
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const isBeforeToday = compareDate < todayDate;
    const dayOfWeek = date.getDay();

    // Check for weekends (Saturday and Sunday)
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    if (infoList.service === "By doctor") {
      const workingDays = (infoList.workingDays || [])
        .map((day) => (typeof day === "string" ? parseInt(day, 10) : day))
        .filter((day): day is number => !isNaN(day));

      return isBeforeToday || !workingDays.includes(dayOfWeek) || isWeekend;
    }

    return isBeforeToday;
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={1} />
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
                tileDisabled={tileDisabled}
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {TIME_SLOTS.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className="col-span-1 flex justify-center items-center"
                >
                  <div
                    className="my-3 w-fit h-fit p-3 rounded-lg bg-[#BAE3F3] hover:bg-[#87ceeb] cursor-pointer text-[#1F3658] hover:text-[#fff] hover:shadow-lg transition duration-200 ease-in-out"
                    onClick={() => {
                      setSelectedTime(timeSlot.time);
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
                onClick={handleSubmit}
              >
                Submit
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
