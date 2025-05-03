import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../redux/store";
import {
  getAppointmentById,
  rescheduleAppointment,
} from "../../redux/slices/appointmentSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
// import { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import { fetchSchedule } from "../../redux/slices/checkAvailabilitySlice";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import "../../styles/global.css";
import { getDoctorById } from "../../redux/slices/doctorSlice";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
] as const;

interface RescheduleProps {
  openReschedule: boolean;
  handleCloseReschedule: () => void;
  appointmentId: number | undefined;
  doctorId: number | undefined;
  bookingDate: string | undefined;
  timeSlot: string | undefined;
}

const Reschedule: React.FC<RescheduleProps> = ({
  openReschedule,
  handleCloseReschedule,
  appointmentId,
  doctorId,
  bookingDate,
  timeSlot,
}) => {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(bookingDate || Date.now())
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [view, setView] = useState<"day" | "week">("week");

  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );
  const currentDoctor = useSelector((state: RootState) =>
    state.doctor.doctors.find((doctor) => doctorId === doctor.id)
  );
  const availabilityByDate = useSelector(
    (state: RootState) => state.checkAvailability.availabilityByDate
  );

  useEffect(() => {
    if (
      appointmentId &&
      (!currentAppointment || currentAppointment.id !== appointmentId)
    ) {
      dispatch(getAppointmentById(appointmentId));
    }
  }, [dispatch, appointmentId, currentAppointment]);

  useEffect(() => {
    if (currentAppointment && currentAppointment.doctorId) {
      dispatch(getDoctorById(currentAppointment.doctorId));
    }
  }, [dispatch, currentAppointment]);

  // const handleDateChange: CalendarProps["onChange"] = (value) => {
  //   if (value instanceof Date) {
  //     setSelectedDate(value);
  //   } else if (Array.isArray(value) && value.length > 0) {
  //     const firstDate = value[0];
  //     setSelectedDate(firstDate);
  //   } else {
  //     setSelectedDate(null);
  //   }
  // };

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return "Invalid Date";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("en-GB");
    } catch {
      return "Invalid Date";
    }
  };

  // Combined logic for isDayDisabled
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

    // Map day names to numeric values
    const dayNameToNumber: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const workingDays = (currentDoctor?.workingDays || [])
      .map((day) => {
        if (typeof day === "string") {
          return dayNameToNumber[day.toUpperCase()];
        } else {
          return day;
        }
      })
      .filter((day): day is number => day !== undefined && !isNaN(day));

    return isBeforeToday || isWeekend || !workingDays.includes(dayOfWeek);
  };

  // Combined logic for isSlotAvailable
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
        if (timeDifference <= 4) {
          return false;
        }
      }
    }

    // Check if it's the original appointment slot
    const isOriginalSlot =
      bookingDate &&
      formatDateForApi(date) === bookingDate &&
      slotId === timeSlot;

    if (isOriginalSlot) {
      return false; // Can't reschedule to the same slot
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

  // // For the Calendar component
  // const tileDisabled = ({ date }: { date: Date }) => {
  //   return isDayDisabled(date);
  // };

  useEffect(() => {
    if (selectedDate && currentAppointment?.doctorId) {
      const formattedDate = formatDateForApi(selectedDate);
      dispatch(
        fetchSchedule({
          doctorId: currentAppointment.doctorId,
          date: formattedDate,
        })
      );
    }
  }, [selectedDate, currentAppointment?.doctorId, dispatch]);

  // Week view functions
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

  const prefetchWeekData = (startDate: Date) => {
    if (!currentAppointment?.doctorId) return;

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
          doctorId: currentAppointment.doctorId as number,
          date: formattedDate,
        })
      );
    });
  };

  const getSlotStyle = (slotId: string, date: Date): string => {
    const isAvailable = isSlotAvailable(slotId, date);
    const isDayDisabledValue = isDayDisabled(date);
    const isSelected =
      selectedTime === TIME_SLOTS.find((s) => s.timeSlot === slotId)?.time &&
      selectedDate?.toDateString() === date.toDateString();

    if (isSelected) {
      return "bg-green-500 text-white";
    } else if (isDayDisabledValue) {
      return "bg-gray-200 text-gray-400 cursor-not-allowed";
    } else if (!isAvailable) {
      return "bg-red-200 text-red-600 cursor-not-allowed";
    }
    return "bg-white hover:bg-blue-50 cursor-pointer";
  };

  const handleTimeSlotClick = (timeSlot: string, day: Date) => {
    // Format date for comparison
    const formattedDate = formatDateForApi(day);

    // Find the corresponding time slot
    const slot = TIME_SLOTS.find((s) => s.timeSlot === timeSlot);

    if (slot && isSlotAvailable(timeSlot, day)) {
      setSelectedDate(day);
      setSelectedTime(slot.time);

      // Fetch schedule if necessary
      if (currentAppointment?.doctorId) {
        dispatch(
          fetchSchedule({
            doctorId: currentAppointment.doctorId,
            date: formattedDate,
          })
        );
      }
    }
  };

  const weekDays = selectedDate ? getDaysInWeek(selectedDate) : [];

  // Navigation functions
  const goToNextDay = () => {
    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      setSelectedDate(nextDay);
    }
  };

  const goToPrevDay = () => {
    if (selectedDate) {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(selectedDate.getDate() - 1);
      setSelectedDate(prevDay);
    }
  };

  const goToNextWeek = () => {
    if (selectedDate) {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(selectedDate.getDate() + 7);
      setSelectedDate(nextWeek);

      // Fetch data for all days in the new week
      if (currentAppointment?.doctorId) {
        prefetchWeekData(nextWeek);
      }
    }
  };

  const goToPrevWeek = () => {
    if (selectedDate) {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(selectedDate.getDate() - 7);
      setSelectedDate(prevWeek);

      // Fetch data for all days in the previous week
      if (currentAppointment?.doctorId) {
        prefetchWeekData(prevWeek);
      }
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !appointmentId) {
      toast.error("Please select both date and time for rescheduling");
      return;
    }

    const timeSlotObj = TIME_SLOTS.find(
      (timeSlot) => timeSlot.time === selectedTime
    );

    if (!timeSlotObj) {
      toast.error("Invalid time slot selected");
      return;
    }

    await dispatch(
      rescheduleAppointment({
        appointmentId,
        appointmentDate: formatDateForApi(selectedDate),
        timeSlot: timeSlotObj.slot,
      })
    ).unwrap();

    toast.success("Appointment rescheduled successfully!");
    handleCloseReschedule();
  };

  return (
    <Dialog
      open={openReschedule}
      onClose={(_e, reason) => {
        if (reason === "backdropClick") {
          handleCloseReschedule();
        }
      }}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>Reschedule Appointment</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4 mt-4'>
            <div className='flex items-start space-x-2'>
              <span className='font-semibold min-w-[150px]'>
                Current Appointment:
              </span>
              <span className='text-gray-700'>
                {formatDate(currentAppointment?.appointmentDate)} at{" "}
                {
                  TIME_SLOTS.filter(
                    (time) => currentAppointment?.timeSlot === time.timeSlot
                  )[0].time
                }
              </span>
            </div>

            <div className='font-medium'>Doctor: {currentDoctor?.fullName}</div>

            <div className='font-medium'>
              New Date:{" "}
              {selectedDate
                ? formatDate(selectedDate.toISOString())
                : "Not selected"}
            </div>

            <div className='font-medium'>
              New Time: {selectedTime || "Not selected"}
            </div>
          </div>

          {/* Enhanced Calendar Component */}
          <div className='w-full bg-white rounded-lg shadow-lg p-4 mt-5'>
            <div className='flex justify-between items-center mb-4'>
              <div className='flex space-x-2'>
                <button
                  type='button'
                  onClick={view === "day" ? goToPrevDay : goToPrevWeek}
                  className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                >
                  &lt;
                </button>
                <button
                  type='button'
                  onClick={goToToday}
                  className='px-3 py-1 bg-[#BAE3F3] text-[#1F3658] rounded hover:bg-[#87ceeb] hover:text-white'
                >
                  Today
                </button>
                <button
                  type='button'
                  onClick={view === "day" ? goToNextDay : goToNextWeek}
                  className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                >
                  &gt;
                </button>
              </div>

              <h2 className='text-xl font-bold'>
                {selectedDate &&
                  (view === "day"
                    ? formatDateDisplay(selectedDate)
                    : `${formatDateDisplay(weekDays[0])} - ${formatDateDisplay(
                        weekDays[6]
                      )}`)}
              </h2>

              <div className='flex space-x-2'>
                <button
                  type='button'
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
                  type='button'
                  onClick={() => {
                    setView("week");
                    if (
                      view === "day" &&
                      selectedDate &&
                      currentAppointment?.doctorId
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

            {selectedDate && (
              <div className='border rounded-lg overflow-hidden'>
                {view === "day" ? (
                  // Day view
                  <div>
                    <div
                      className={`p-4 ${
                        isToday(selectedDate) ? "bg-blue-100" : "bg-gray-50"
                      } border-b text-center font-medium`}
                    >
                      {formatDateDisplay(selectedDate)}
                    </div>
                    <div className='grid grid-cols-1 gap-2 p-4'>
                      {TIME_SLOTS.map((timeSlot) => (
                        <div
                          key={timeSlot.id}
                          className={`border rounded-lg p-3 transition-colors ${getSlotStyle(
                            timeSlot.timeSlot,
                            selectedDate
                          )}`}
                          onClick={() =>
                            handleTimeSlotClick(timeSlot.timeSlot, selectedDate)
                          }
                        >
                          <div className='font-medium'>{timeSlot.time}</div>
                          {/* <div className='text-sm text-gray-500'>
                            Price: 70.000 VND
                          </div> */}
                        </div>
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
                            <div
                              key={`${dayIndex}-${timeSlot.id}`}
                              className={`border-b p-2 h-24 transition-colors ${getSlotStyle(
                                timeSlot.timeSlot,
                                day
                              )}`}
                              onClick={() =>
                                handleTimeSlotClick(timeSlot.timeSlot, day)
                              }
                            >
                              <div className='font-medium text-sm'>
                                {timeSlot.time}
                              </div>
                              {/* <div className='text-xs text-gray-500'>
                                Price: 70.000 VND
                              </div> */}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogActions className='mt-6'>
            <Button onClick={handleCloseReschedule} color='error'>
              Cancel
            </Button>
            <Button type='submit' color='primary' variant='contained'>
              Confirm Reschedule
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Reschedule;
