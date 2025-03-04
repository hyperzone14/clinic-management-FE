import React, { useEffect, useState } from "react";
import InformationList from "../../components/common/InformationList";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/global.css";
import Title from "../../components/common/Title";
import { useDispatch, useSelector } from "react-redux";
import { setInfoList } from "../../redux/slices/infoListSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchSchedule } from "../../redux/slices/checkAvailabilitySlice";
// import WeeklyCalendar from "../common/WeeklyCalendar";

// Move timeset outside component since it's static
const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
] as const;

const ChooseDateTime: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const infoList = useSelector((state: RootState) => state.infoList);
  const availableSlots = useSelector(
    (state: RootState) =>
      state.checkAvailability.doctorTimeslotCapacityResponseDTO
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value.length > 0) {
      const firstDate = value[0];
      setSelectedDate(firstDate);
    } else {
      setSelectedDate(null);
    }
    setSelectedTime("");
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
  }, [selectedDate, selectedTime, dispatch]);

  useEffect(() => {
    if (selectedDate && infoList.doctorId) {
      const formattedDate = formatDateForApi(selectedDate);
      dispatch(
        fetchSchedule({ doctorId: infoList.doctorId, date: formattedDate })
      );
    }
  }, [selectedDate, infoList.doctorId, dispatch]);

  const tileDisabled = ({ date }: { date: Date }) => {
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
    }
    return isBeforeToday || isWeekend;
  };

  // Check if a time slot is available
  const isSlotAvailable = (slotId: string): boolean => {
    const todayDate = new Date();
    const compareDate = new Date();
    compareDate.setHours(0, 0, 0, 0);

    if (selectedDate && selectedDate.getTime() === compareDate.getTime()) {
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
        if (timeDifference <= 4) {
          return false;
        }
      }
    }

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

  // Get slot style based on availability
  const getSlotStyle = (slotId: string): string => {
    const isAvailable = isSlotAvailable(slotId);
    return isAvailable
      ? "my-3 w-fit h-fit p-3 rounded-lg bg-[#BAE3F3] hover:bg-[#87ceeb] cursor-pointer text-[#1F3658] hover:text-[#fff] hover:shadow-lg transition duration-200 ease-in-out"
      : "my-3 w-fit h-fit p-3 rounded-lg bg-gray-400 text-gray-600 cursor-not-allowed";
  };

  // Handle time slot click
  const handleTimeSlotClick = (time: string, slotId: string) => {
    if (isSlotAvailable(slotId)) {
      setSelectedTime(time);
    }
  };

  return (
    <>
      {/* <ToastContainer /> */}
      <div className='w-full'>
        {/* Removed ProgressBar since it's handled in the parent component */}
        <div className='mt-6 grid grid-cols-3'>
          <div className='col-span-2 me-10'>
            <Title id={3} />
            <div className='mt-10 mb-10 flex justify-center items-center gap-3'>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDetail='year'
                prevLabel='Previous'
                nextLabel='Next'
                tileDisabled={tileDisabled}
              />
            </div>
            <div className='mt-5 grid grid-cols-3 gap-3 text-center'>
              {TIME_SLOTS.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className='col-span-1 flex justify-center items-center'
                >
                  <div
                    className={getSlotStyle(timeSlot.timeSlot)}
                    onClick={() =>
                      handleTimeSlotClick(timeSlot.time, timeSlot.timeSlot)
                    }
                  >
                    <span className='font-bold'>{timeSlot.time}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Removed navigation buttons - they'll be handled in BookingTest */}
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
// import React, { useEffect, useState } from "react";
// import InformationList from "../../components/common/InformationList";
// import "../../styles/global.css";
// import Title from "../../components/common/Title";
// import { useDispatch, useSelector } from "react-redux";
// import { setInfoList } from "../../redux/slices/infoListSlice";
// import { AppDispatch, RootState } from "../../redux/store";
// import { fetchSchedule } from "../../redux/slices/checkAvailabilitySlice";

// // Move timeset outside component since it's static
// const TIME_SLOTS = [
//   { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
//   { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
//   { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
//   { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
//   { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
//   { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
// ] as const;

// const ChooseDateTime: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const infoList = useSelector((state: RootState) => state.infoList);
//   const availableSlots = useSelector(
//     (state: RootState) =>
//       state.checkAvailability.doctorTimeslotCapacityResponseDTO
//   );

//   // State for current date and selected date/time
//   const [currentDate, setCurrentDate] = useState<Date>(new Date());
//   const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
//   const [selectedDay, setSelectedDay] = useState<Date | null>(null);

//   // Format date for API
//   const formatDateForApi = (date: Date): string => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // Update Redux state when selection changes
//   useEffect(() => {
//     if (selectedDay && selectedSlot) {
//       const timeSlotObj = TIME_SLOTS.find((ts) => ts.timeSlot === selectedSlot);

//       const timeDisplay = timeSlotObj ? timeSlotObj.time : "";
//       const timeSlotId = timeSlotObj ? timeSlotObj.slot : undefined;

//       dispatch(
//         setInfoList({
//           ...infoList,
//           date: selectedDay.toUTCString(),
//           time: timeDisplay,
//           timeSlot: timeSlotId,
//         })
//       );
//     }
//   }, [selectedDay, selectedSlot, dispatch]);

//   // Fetch available slots when selected day changes
//   useEffect(() => {
//     if (selectedDay && infoList.doctorId) {
//       const formattedDate = formatDateForApi(selectedDay);
//       dispatch(
//         fetchSchedule({ doctorId: infoList.doctorId, date: formattedDate })
//       );
//     }
//   }, [selectedDay, infoList.doctorId, dispatch]);

//   // Get days for week view
//   const getDaysInWeek = (date: Date) => {
//     const days = [];
//     // Start from Monday (1) instead of Sunday (0)
//     const startOfWeek = new Date(date);
//     const day = date.getDay();
//     const diff = date.getDate() - day + (day === 0 ? -6 : 1);
//     startOfWeek.setDate(diff);

//     for (let i = 0; i < 7; i++) {
//       const day = new Date(startOfWeek);
//       day.setDate(startOfWeek.getDate() + i);
//       days.push(day);
//     }

//     return days;
//   };

//   const weekDays = getDaysInWeek(currentDate);

//   // Navigation functions
//   const goToNextWeek = () => {
//     const nextWeek = new Date(currentDate);
//     nextWeek.setDate(currentDate.getDate() + 7);
//     setCurrentDate(nextWeek);
//     // Clear selection when changing weeks
//     setSelectedSlot(null);
//     setSelectedDay(null);
//   };

//   const goToPrevWeek = () => {
//     const prevWeek = new Date(currentDate);
//     prevWeek.setDate(currentDate.getDate() - 7);
//     setCurrentDate(prevWeek);
//     // Clear selection when changing weeks
//     setSelectedSlot(null);
//     setSelectedDay(null);
//   };

//   const goToToday = () => {
//     setCurrentDate(new Date());
//     // Clear selection when going to today
//     setSelectedSlot(null);
//     setSelectedDay(null);
//   };

//   // Format dates
//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // Combined function to check if a tile is disabled or unavailable
//   const getTileStatus = (timeSlot: string, day: Date) => {
//     // Get current date at midnight
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Get the day to compare at midnight
//     const compareDate = new Date(day);
//     compareDate.setHours(0, 0, 0, 0);

//     // Check if date is before today
//     const isBeforeToday = compareDate < today;

//     // Get day of week (0 = Sunday, 6 = Saturday)
//     const dayOfWeek = day.getDay();

//     // Check if it's a weekend
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//     // Check working days if service is "By doctor"
//     let isNonWorkingDay = false;
//     if (infoList.service === "By doctor") {
//       const workingDays = (infoList.workingDays || [])
//         .map((day) => (typeof day === "string" ? parseInt(day, 10) : day))
//         .filter((day): day is number => !isNaN(day));

//       isNonWorkingDay = !workingDays.includes(dayOfWeek);
//     }

//     // If the day is disabled
//     if (isBeforeToday || isWeekend || isNonWorkingDay) {
//       return "disabled";
//     }

//     // Check if the time slot is available
//     // 1. Check same-day time constraint (4 hours ahead)
//     const now = new Date();
//     if (compareDate.getTime() === today.getTime()) {
//       const slot = TIME_SLOTS.find((s) => s.timeSlot === timeSlot);
//       if (slot) {
//         const startHourStr = slot.time.split("-")[0].replace(/AM|PM/, "");
//         const isPM = slot.time.includes("PM");
//         let startHour = parseInt(startHourStr);
//         if (isPM && startHour !== 12) startHour += 12;

//         const slotTime = new Date();
//         slotTime.setHours(startHour, 0, 0, 0);

//         // Check if slot is within 4 hours from now
//         const timeDifference =
//           (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
//         if (timeDifference <= 4) {
//           return "unavailable";
//         }
//       }
//     }

//     // console.log(availableSlots);

//     // 2. Check availability based on capacity
//     if (availableSlots.length > 0) {
//       const slot = availableSlots.find((s) => s.timeSlot === timeSlot);
//       if (!slot || slot.currentPatients === slot.maxPatients) {
//         return "unavailable";
//       }
//     }

//     // The slot is available
//     return "available";
//   };

//   // Check if a tile is selected
//   const isTileSelected = (timeSlot: string, day: Date) => {
//     if (!selectedSlot || !selectedDay) return false;

//     return (
//       timeSlot === selectedSlot &&
//       day.getDate() === selectedDay.getDate() &&
//       day.getMonth() === selectedDay.getMonth() &&
//       day.getFullYear() === selectedDay.getFullYear()
//     );
//   };

//   // Handle date and time selection
//   const handleDateAndTimeChange = (timeSlot: string, day: Date) => {
//     const status = getTileStatus(timeSlot, day);

//     // Skip if tile is disabled or unavailable
//     if (status !== "available") {
//       return;
//     }

//     // Update selected slot and day
//     setSelectedSlot(timeSlot);
//     setSelectedDay(new Date(day));
//   };

//   return (
//     <>
//       <div className='w-full'>
//         <div className='mt-6 grid grid-cols-3'>
//           <div className='col-span-2 me-10'>
//             <Title id={3} />
//             <div className='w-full mx-auto bg-white rounded-lg shadow-lg p-4 mt-6'>
//               <div className='flex justify-between items-center mb-4'>
//                 <div className='flex space-x-2'>
//                   <button
//                     onClick={goToPrevWeek}
//                     className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
//                   >
//                     &lt;
//                   </button>
//                   <button
//                     onClick={goToToday}
//                     className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
//                   >
//                     Today
//                   </button>
//                   <button
//                     onClick={goToNextWeek}
//                     className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
//                   >
//                     &gt;
//                   </button>
//                 </div>

//                 <h2 className='text-xl font-bold'>
//                   {`${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
//                 </h2>
//               </div>

//               <div className='border rounded-lg overflow-hidden'>
//                 {/* Week view */}
//                 <div>
//                   {/* Header row with day names */}
//                   <div className='flex border-b'>
//                     <div className='w-24 border-r bg-gray-100 p-2 text-center font-medium'>
//                       Time Slot
//                     </div>
//                     {weekDays.map((day, index) => {
//                       const dayOfWeek = day.getDay();
//                       const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//                       const isToday =
//                         day.getDate() === new Date().getDate() &&
//                         day.getMonth() === new Date().getMonth() &&
//                         day.getFullYear() === new Date().getFullYear();

//                       return (
//                         <div
//                           key={index}
//                           className={`flex-1 p-2 text-center font-medium ${
//                             isWeekend
//                               ? "bg-gray-200 text-gray-400"
//                               : isToday
//                               ? "bg-blue-100"
//                               : "bg-gray-100"
//                           }`}
//                         >
//                           {day.toLocaleDateString("en-US", {
//                             weekday: "short",
//                             day: "numeric",
//                           })}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Time slots rows */}
//                   {TIME_SLOTS.map((timeSlot) => (
//                     <div key={timeSlot.id} className='flex border-b'>
//                       <div className='w-24 border-r bg-gray-50 p-2 text-xs flex items-center justify-center'>
//                         {timeSlot.time}
//                       </div>

//                       {/* Days */}
//                       {weekDays.map((day, dayIndex) => {
//                         const tileStatus = getTileStatus(
//                           timeSlot.timeSlot,
//                           day
//                         );
//                         const isToday =
//                           day.getDate() === new Date().getDate() &&
//                           day.getMonth() === new Date().getMonth() &&
//                           day.getFullYear() === new Date().getFullYear();
//                         const isSelected = isTileSelected(
//                           timeSlot.timeSlot,
//                           day
//                         );

//                         let tileClass = "flex-1 h-16 border-r relative ";

//                         // Apply styling based on status
//                         if (isSelected) {
//                           tileClass += "bg-green-200 cursor-pointer";
//                         } else if (tileStatus === "disabled") {
//                           tileClass += "bg-gray-200 cursor-not-allowed";
//                         } else if (tileStatus === "unavailable") {
//                           tileClass += "bg-red-200 cursor-not-allowed";
//                         } else {
//                           tileClass += isToday
//                             ? "bg-blue-50 cursor-pointer"
//                             : "bg-white cursor-pointer";
//                         }

//                         return (
//                           <div
//                             key={dayIndex}
//                             className={tileClass}
//                             onClick={() =>
//                               tileStatus === "available" &&
//                               handleDateAndTimeChange(timeSlot.timeSlot, day)
//                             }
//                           >
//                             {/* Could add events here if needed */}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Display selected date and time information */}
//               {selectedSlot && selectedDay && (
//                 <div className='mt-4 p-3 bg-green-100 rounded-lg border border-green-300'>
//                   <h3 className='font-medium'>Selected Time:</h3>
//                   <p>
//                     {selectedDay.toLocaleDateString("en-US", {
//                       weekday: "long",
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}
//                     {" at "}
//                     {(() => {
//                       const slot = TIME_SLOTS.find(
//                         (ts) => ts.timeSlot === selectedSlot
//                       );
//                       return slot ? slot.time : "";
//                     })()}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className='col-span-1'>
//             <InformationList />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChooseDateTime;
