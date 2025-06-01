import React, { useEffect, useState } from "react";
import InformationList from "../../components/common/InformationList";
import "../../styles/global.css";
import Title from "../../components/common/Title";
import { useDispatch, useSelector } from "react-redux";
import { setInfoList } from "../../redux/slices/infoListSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchSchedule } from "../../redux/slices/checkAvailabilitySlice";
import { fetchDepartmentById } from "../../redux/slices/departmentSlice";
import { Tooltip } from "@mui/material";

// Time slots definition
const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
];

const ChooseDateTime: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const infoList = useSelector((state: RootState) => state.infoList);
  const availabilityByDate = useSelector(
    (state: RootState) => state.checkAvailability.availabilityByDate
  );
  const doctorWorkingDays = useSelector(
    (state: RootState) => state.department.departments
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [view, setView] = useState<"day" | "week">("week");
  // const [doctorName] = useState<string>("");

  // Format date for API
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
    // console.log("timeSlot: ", timeSlot);
    const dateString = selectedDate ? selectedDate.toUTCString() : null;

    dispatch(
      setInfoList({
        ...infoList,
        date: dateString,
        time: selectedTime,
        timeSlot: timeSlot,
        // name: doctorName,
      })
    );
  }, [selectedDate, selectedTime, dispatch]);

  // Fetch schedule when date changes
  useEffect(() => {
    if (
      selectedDate &&
      infoList.doctorId &&
      typeof infoList.doctorId === "number"
    ) {
      const formattedDate = formatDateForApi(selectedDate);
      // setDoctorName(infoList.name || "");
      dispatch(
        fetchSchedule({
          doctorId: infoList.doctorId,
          date: formattedDate,
        })
      );
    }
  }, [selectedDate, infoList.doctorId, dispatch]);

  useEffect(() => {
    if (infoList.service === "By date") {
      dispatch(fetchDepartmentById(infoList.departmentId as number));
    }
  }, [infoList.departmentId, dispatch, infoList.service]);

  // Check if a day is disabled
  const isDayDisabled = (date: Date): boolean => {
    // Get current date at midnight
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Get the date to compare at midnight
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Check if date is before today
    const isBeforeToday = compareDate < todayDate;

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();

    // Always disable weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (infoList.service === "By doctor") {
      const workingDays = (infoList.workingDays || [])
        .map((day) => (typeof day === "string" ? parseInt(day, 10) : day))
        .filter((day): day is number => !isNaN(day));

      return isBeforeToday || isWeekend || !workingDays.includes(dayOfWeek);
    } else if (infoList.service === "By date") {
      // console.log(infoList.departmentId, infoList.doctorId);
      const department = doctorWorkingDays.find(
        (dept) => dept.id === infoList.departmentId
      );
      // const doctor = department?.doctors?.find(
      //   (doc) => doc.id === infoList.doctorId
      // );

      // console.log("Department: ", department);

      // const workingDaysArray = department?.doctors
      //   ?.map((doc) => doc.workingDays)
      //   .flat()
      //   .map((day) => (typeof day === "string" ? parseInt(day, 10) : day));

      const workingDaysArray = department?.doctors
        ?.flatMap((doc) => doc.workingDays)
        .filter((day) => day !== null && day !== undefined)
        .map((day) => {
          if (typeof day === "string") {
            // Handle string values like "MONDAY" to numeric days
            if (day === "MONDAY") return 1;
            if (day === "TUESDAY") return 2;
            if (day === "WEDNESDAY") return 3;
            if (day === "THURSDAY") return 4;
            if (day === "FRIDAY") return 5;
            return parseInt(day, 10);
          }
          return day;
        })
        .filter((day) => !isNaN(day));
      // console.log("Working days: ", workingDaysArray);

      if (!workingDaysArray) {
        return true; // Return true or handle the case where workingDaysArray is undefined
      }

      return isBeforeToday || !workingDaysArray.includes(dayOfWeek);
    }
    return isBeforeToday || isWeekend;
  };

  // Check if a time slot is available
  const isSlotAvailable = (slotId: string, date: Date): boolean => {
    // Check if the day is disabled first
    if (isDayDisabled(date)) {
      return false;
    }

    const todayDate = new Date();
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the slot is in the past (for today)
    if (compareDate.getTime() === today.getTime()) {
      const slot = TIME_SLOTS.find((s) => s.timeSlot === slotId);
      if (slot) {
        const [startHour] = slot.time.split("-")[0].split(/AM|PM/);
        const isPM = slot.time.includes("PM");
        const slotTime = new Date();
        slotTime.setHours(
          isPM ? parseInt(startHour) + 12 : parseInt(startHour),
          0,
          0,
          0
        );

        const timeDifference =
          (slotTime.getTime() - todayDate.getTime()) / (1000 * 60 * 60); // Difference in hours
        if (timeDifference <= 1) {
          // If the slot is within 1 hour from now
          return false;
        }
      }
    }

    // Get formatted date for lookup
    const formattedDate = formatDateForApi(date);

    // Check availability from API response for this specific date
    const availableSlots = availabilityByDate[formattedDate] || [];

    if (availableSlots.length === 0) {
      // If no schedule exists, all slots are available
      return true;
    }

    const slot = availableSlots.find((s) => s.timeSlot === slotId);
    if (!slot) {
      return false;
    }
    return slot.currentPatients < slot.maxPatients;
  };

  // Inside the ChooseDateTime component, add a new function to get doctors for a specific day
  const getDoctorsForDay = (date: Date) => {
    if (!date || infoList.service !== "By date") return [];

    const department = doctorWorkingDays.find(
      (dept) => dept.id === infoList.departmentId
    );

    if (!department?.doctors || department.doctors.length === 0) {
      return [];
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();

    // Convert numeric day to string day name or handle numeric representation
    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const selectedDayName = dayNames[dayOfWeek];

    // Filter doctors available on the selected day
    const availableDoctors = department.doctors.filter((doctor) => {
      if (!doctor.workingDays) return false;

      // Handle both string (e.g., "MONDAY") and numeric (e.g., 1) representations
      return doctor.workingDays.some((day) => {
        if (typeof day === "string") {
          return day === selectedDayName;
        } else {
          return day === dayOfWeek;
        }
      });
    });

    // console.log(availableDoctors);

    return availableDoctors;
  };

  // Function to format doctor names for tooltip
  const formatDoctorNamesForTooltip = (date: Date) => {
    const doctors = getDoctorsForDay(date);

    if (doctors.length === 0) {
      return "No doctors available";
    }

    return doctors.map((doc) => `Dr. ${doc.fullName}`).join(", ");
  };

  const prefetchWeekData = (startDate: Date) => {
    if (!infoList.doctorId || typeof infoList.doctorId !== "number") return;

    const weekDays = getDaysInWeek(startDate);
    weekDays.forEach((day) => {
      // Skip weekends and past days
      if (day.getDay() === 0 || day.getDay() === 6) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayToCheck = new Date(day);
      dayToCheck.setHours(0, 0, 0, 0);

      if (dayToCheck < today) return;

      const formattedDate = formatDateForApi(day);
      dispatch(
        fetchSchedule({
          doctorId: infoList.doctorId as number,
          date: formattedDate,
        })
      );
    });
  };

  // Get days for week view
  const getDaysInWeek = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Navigation functions
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
    prefetchWeekData(nextDay);
  };

  const goToPrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDay);
    prefetchWeekData(prevDay);
  };

  // Add initial fetch on component mount
  useEffect(() => {
    if (
      view === "week" &&
      infoList.doctorId &&
      typeof infoList.doctorId === "number"
    ) {
      prefetchWeekData(selectedDate);
    }
  }, [infoList.doctorId]); // Dependency on doctorId so it runs when doctor is selected

  // In the goToNextWeek function
  const goToNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(selectedDate.getDate() + 7);
    setSelectedDate(nextWeek);

    // Fetch data for all days in the new week
    if (infoList.doctorId && typeof infoList.doctorId === "number") {
      const newWeekDays = getDaysInWeek(nextWeek);
      newWeekDays.forEach((day) => {
        const formattedDate = formatDateForApi(day);
        dispatch(
          fetchSchedule({
            doctorId: infoList.doctorId as number,
            date: formattedDate,
          })
        );
      });
    }
  };

  // Similarly for goToPrevWeek
  const goToPrevWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prevWeek);

    // Fetch data for all days in the previous week
    if (infoList.doctorId && typeof infoList.doctorId === "number") {
      const newWeekDays = getDaysInWeek(prevWeek);
      newWeekDays.forEach((day) => {
        const formattedDate = formatDateForApi(day);
        dispatch(
          fetchSchedule({
            doctorId: infoList.doctorId as number,
            date: formattedDate,
          })
        );
      });
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Check if the given date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Handle time slot selection
  const handleSlotClick = (timeSlot: string, day: Date) => {
    // Format date for comparison
    const formattedDate = formatDateForApi(day);

    // Find the corresponding time slot
    const slot = TIME_SLOTS.find((s) => s.timeSlot === timeSlot);

    if (slot && isSlotAvailable(timeSlot, day)) {
      setSelectedDate(day);
      setSelectedTime(slot.time);

      // Fetch schedule if necessary
      if (infoList.doctorId) {
        dispatch(
          fetchSchedule({ doctorId: infoList.doctorId, date: formattedDate })
        );
      }
    }
  };

  // Get slot style based on availability and selection
  const getSlotStyle = (timeSlot: string, day: Date) => {
    const isAvailable = isSlotAvailable(timeSlot, day);
    const isDayDisabledValue = isDayDisabled(day);
    const isSelected =
      selectedTime === TIME_SLOTS.find((s) => s.timeSlot === timeSlot)?.time &&
      selectedDate.toDateString() === day.toDateString();

    if (isSelected) {
      return "bg-green-500 text-white";
    } else if (isDayDisabledValue) {
      return "bg-gray-200 text-gray-400 cursor-not-allowed";
    } else if (!isAvailable) {
      return "bg-red-200 text-red-600 cursor-not-allowed";
    }
    return "bg-white hover:bg-blue-50 cursor-pointer";
  };

  const weekDays = getDaysInWeek(selectedDate);

  // console.log(infoList.date, infoList.time, infoList.timeSlot);

  return (
    <>
      <div className='w-full'>
        <div className='mt-6 grid grid-cols-3'>
          <div className='col-span-2 me-10'>
            <Title id={3} />
            <div className='w-full bg-white rounded-lg shadow-lg p-4 mt-5'>
              <div className='flex justify-between items-center mb-4'>
                <div className='flex space-x-2'>
                  <button
                    onClick={view === "day" ? goToPrevDay : goToPrevWeek}
                    className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                  >
                    &lt;
                  </button>
                  <button
                    onClick={goToToday}
                    className='px-3 py-1 bg-[#BAE3F3] text-[#1F3658] rounded hover:bg-[#87ceeb] hover:text-white'
                  >
                    Today
                  </button>
                  <button
                    onClick={view === "day" ? goToNextDay : goToNextWeek}
                    className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                  >
                    &gt;
                  </button>
                </div>

                <h2 className='text-xl font-bold'>
                  {view === "day"
                    ? formatDate(selectedDate)
                    : `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
                </h2>

                <div className='flex space-x-2'>
                  <button
                    onClick={() => setView("day")}
                    className={`px-3 py-1 rounded ${
                      view === "day"
                        ? "bg-[#BAE3F3] text-[#1F3658]"
                        : "bg-gray-200"
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => {
                      setView("week");
                      if (
                        view === "day" &&
                        infoList.doctorId &&
                        typeof infoList.doctorId === "number"
                      ) {
                        prefetchWeekData(selectedDate);
                      }
                    }}
                    className={`px-3 py-1 rounded ${
                      view === "week"
                        ? "bg-[#BAE3F3] text-[#1F3658]"
                        : "bg-gray-200"
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>

              <div className='border rounded-lg overflow-hidden'>
                {view === "day" ? (
                  // Day view
                  <div>
                    <div
                      className={`p-4 ${
                        isToday(selectedDate) ? "bg-blue-100" : "bg-gray-50"
                      } border-b text-center font-medium`}
                    >
                      {formatDate(selectedDate)}
                    </div>
                    <div className='grid grid-cols-1 gap-2 p-4'>
                      {TIME_SLOTS.map((timeSlot) => (
                        <Tooltip
                          title={
                            infoList.service === "By date"
                              ? isDayDisabled(selectedDate)
                                ? "Not available"
                                : formatDoctorNamesForTooltip(selectedDate)
                              : null
                          }
                          key={timeSlot.id}
                        >
                          <div
                            className={`border rounded-lg p-3 transition-colors ${getSlotStyle(
                              timeSlot.timeSlot,
                              selectedDate
                            )}`}
                            onClick={() =>
                              handleSlotClick(timeSlot.timeSlot, selectedDate)
                            }
                          >
                            <div className='font-medium'>{timeSlot.time}</div>
                            <div className='text-sm text-gray-500'>
                              Price: 70.000 VND
                              {/* {infoList.service === "By doctor"
                              : `Dr. ${getDoctorName()} - Price: 70.000 VND`} */}
                            </div>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Week view
                  <div>
                    {/* Header row with day names */}
                    <div className='grid grid-cols-7 border-b'>
                      {weekDays.map((day, index) => (
                        <div
                          key={index}
                          className={`p-3 text-center font-medium ${
                            isToday(day) ? "bg-blue-100" : "bg-gray-50"
                          }`}
                        >
                          {day.toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Time slots for each day */}
                    <div className='grid grid-cols-7'>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className='border-r last:border-r-0'
                        >
                          {TIME_SLOTS.map((timeSlot) => (
                            <Tooltip
                              title={
                                infoList.service === "By date"
                                  ? isDayDisabled(selectedDate)
                                    ? "Not available"
                                    : formatDoctorNamesForTooltip(selectedDate)
                                  : null
                              }
                              key={`${dayIndex}-${timeSlot.id}`}
                            >
                              <div
                                className={`border-b p-2 h-24 transition-colors ${getSlotStyle(
                                  timeSlot.timeSlot,
                                  day
                                )}`}
                                onClick={() =>
                                  handleSlotClick(timeSlot.timeSlot, day)
                                }
                              >
                                <div className='font-medium text-sm'>
                                  {timeSlot.time}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  Price: 70.000 VND
                                  {/* {infoList.service === "By doctor"
                                  : `Dr. ${getDoctorName()} - Price: 70.000 VND`} */}
                                </div>
                              </div>
                            </Tooltip>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col-span-1'>
            <InformationList />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChooseDateTime;
