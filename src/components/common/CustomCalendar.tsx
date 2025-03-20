import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppDispatch, RootState } from "../../redux/store";
import { searchAppointmentForDoctor } from "../../redux/slices/appointmentSlice";
import { setDoctorEvents } from "../../redux/slices/doctorEventsSlice";

interface CustomCalendarProps {
  chosenDate?: Date | null;
  doctorId?: string | null;
}

interface Event {
  id: string;
  title: string;
  patientName: string;
  timeSlot: string;
  // appointmentStatus: string;
  day: string;
  color: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  chosenDate,
  doctorId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("day"); // 'day' or 'week'
  const appointment = useSelector((state: RootState) => state.appointment);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (chosenDate) {
      setCurrentDate(chosenDate);
    }
  }, [chosenDate]);

  useEffect(() => {
    if (doctorId) {
      dispatch(searchAppointmentForDoctor({ doctorId: Number(doctorId) }));
    }
  }, [doctorId, dispatch]);

  // console.log(appointment.appointments);

  // Custom time slots as provided
  const TIME_SLOTS = [
    { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
    { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
    { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
    { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
    { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
    { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
  ];

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (appointment.appointments) {
      // console.log("pass");
      const formattedEvents = appointment.appointments.map((appt) => ({
        id: appt.id?.toString() || "",
        title:
          appt.appointmentStatus === "CANCELLED"
            ? "Meeting Cancelled"
            : appt.appointmentStatus === "CONFIRMED" ||
              appt.appointmentStatus === "CHECKED_IN"
            ? "Meeting Confirmed"
            : appt.appointmentStatus === "LAB_TEST_REQUIRED"
            ? "Lab Test Required"
            : "Meeting Pending",
        patientName: appt.patientResponseDTO?.fullName || "Unknown",
        timeSlot: appt.timeSlot,
        // appointmentStatus: appt.appointmentStatus,
        day: new Date(appt.appointmentDate).toISOString(),
        color:
          appt.appointmentStatus === "CANCELLED"
            ? "#FF0000"
            : appt.appointmentStatus === "CONFIRMED" ||
              appt.appointmentStatus === "CHECKED_IN"
            ? "#008000"
            : "#4567b7",
      }));
      setEvents(formattedEvents);
    }
    // else console.log("fail");
  }, [appointment.appointments]);

  useEffect(() => {
    const matchingEvents = events.filter((event) => {
      const eventDate = new Date(event.day).toDateString();
      const chosenDateString = chosenDate?.toDateString();
      return eventDate === chosenDateString;
    });
    // console.log(matchingEvents);
    if (matchingEvents && matchingEvents.length > 0)
      dispatch(setDoctorEvents(matchingEvents));
  }, [events, chosenDate, dispatch]);

  // Get days for week view
  const getDaysInWeek = (date: Date): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust if the day is Sunday

    startOfWeek.setDate(date.getDate() + diff); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getDaysInWeek(currentDate);

  // Navigation functions
  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToPrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const goToPrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format dates
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get events for specific time slot and day
  const getEventsForTimeSlot = (timeSlot: string, day: Date) => {
    return events.filter((event) => {
      // Check if the time slot matches
      if (event.timeSlot !== timeSlot) {
        return false;
      }

      // Check if the date matches (if event has a day property)
      if (event.day) {
        const eventDate = new Date(event.day);
        return (
          day.getDate() === eventDate.getDate() &&
          day.getMonth() === eventDate.getMonth() &&
          day.getFullYear() === eventDate.getFullYear()
        );
      }

      return true;
    });
  };

  // Get base cell height plus additional height for multiple events
  const getCellHeight = (events: Event[]) => {
    // const baseHeight = 16; // Base height in pixels
    const eventHeight = 28; // Height per event in pixels
    const eventGap = 4; // Gap between events

    if (events.length <= 1) {
      return `h-16`; // Default height
    }

    // Calculate height based on number of events
    const totalEventsHeight =
      events.length * eventHeight + (events.length - 1) * eventGap;
    if (totalEventsHeight <= 64) {
      return `h-16`;
    } else if (totalEventsHeight <= 96) {
      return `h-24`;
    } else if (totalEventsHeight <= 128) {
      return `h-32`;
    } else {
      return `h-40`;
    }
  };

  // Position events within a cell
  const positionEvent = (index: number) => {
    const eventHeight = 28; // Height per event
    const eventGap = 4; // Gap between events
    const top = index * (eventHeight + eventGap);

    return {
      top: `${top}px`,
      height: `${eventHeight}px`,
      left: "4px",
      right: "4px",
    };
  };

  // For drag and drop functionality
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    timeSlot: string,
    day: Date
  ) => {
    e.dataTransfer.setData("timeSlot", timeSlot);
    e.dataTransfer.setData("day", day.toISOString());
  };

  const handleSlotClick = (timeSlot: string, day: Date) => {
    toast.info(`Clicked on ${timeSlot} for ${day.toDateString()}`);
    // Here you could open a modal for creating a new event
  };

  return (
    <>
      <ToastContainer />
      <div className='w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4'>
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
              className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
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
              ? formatDate(currentDate)
              : `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
          </h2>

          <div className='flex space-x-2'>
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1 rounded ${
                view === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 rounded ${
                view === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        <div className='border rounded-lg overflow-hidden'>
          {view === "day" ? (
            // Day view
            <div className='flex'>
              {/* Time labels */}
              <div className='w-24 border-r bg-gray-50'>
                {TIME_SLOTS.map((timeSlot) => {
                  const dayEvents = getEventsForTimeSlot(
                    timeSlot.timeSlot,
                    currentDate
                  );
                  const cellHeight = getCellHeight(dayEvents);

                  return (
                    <div
                      key={timeSlot.id}
                      className={`${cellHeight} border-b px-2 text-xs flex items-center justify-center text-gray-500`}
                    >
                      {timeSlot.time}
                    </div>
                  );
                })}
              </div>

              {/* Day column */}
              <div className='flex-1'>
                {TIME_SLOTS.map((timeSlot) => {
                  const dayEvents = getEventsForTimeSlot(
                    timeSlot.timeSlot,
                    currentDate
                  );
                  const cellHeight = getCellHeight(dayEvents);

                  return (
                    <div
                      key={timeSlot.id}
                      className={`${cellHeight} border-b relative`}
                      onClick={() =>
                        handleSlotClick(timeSlot.timeSlot, currentDate)
                      }
                    >
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className='absolute rounded p-2 text-white cursor-move'
                          style={{
                            backgroundColor: event.color,
                            ...positionEvent(eventIndex),
                          }}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, timeSlot.timeSlot, currentDate)
                          }
                        >
                          <div className='font-semibold text-xs'>
                            {event.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Week view
            <div>
              {/* Header row with day names */}
              <div className='flex border-b'>
                <div className='w-24 border-r bg-gray-100 p-2 text-center font-medium'>
                  Time Slot
                </div>
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={`flex-1 p-2 text-center font-medium ${
                      (day.getDate() === currentDate.getDate() ||
                        day.getDate() === new Date().getDate()) &&
                      (day.getMonth() === currentDate.getMonth() ||
                        day.getDate() === new Date().getMonth()) &&
                      (day.getFullYear() === currentDate.getFullYear() ||
                        day.getDate() === new Date().getFullYear())
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {day.toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </div>
                ))}
              </div>

              {/* Time slots rows */}
              {TIME_SLOTS.map((timeSlot) => {
                // Find the max number of events in any cell for this time slot
                let maxEvents = 0;
                weekDays.forEach((day) => {
                  const events = getEventsForTimeSlot(timeSlot.timeSlot, day);
                  maxEvents = Math.max(maxEvents, events.length);
                });

                // Determine cell height based on max events in row
                const rowHeight =
                  maxEvents <= 1
                    ? "h-16"
                    : maxEvents === 2
                    ? "h-24"
                    : maxEvents === 3
                    ? "h-32"
                    : "h-40";

                return (
                  <div key={timeSlot.id} className='flex border-b'>
                    <div
                      className={`w-24 border-r bg-gray-50 p-2 text-xs flex items-center justify-center ${rowHeight}`}
                    >
                      {timeSlot.time}
                    </div>

                    {/* Days */}
                    {weekDays.map((day, dayIndex) => {
                      const events = getEventsForTimeSlot(
                        timeSlot.timeSlot,
                        day
                      );
                      const isToday =
                        day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth() &&
                        day.getFullYear() === new Date().getFullYear();

                      return (
                        <div
                          key={dayIndex}
                          className={`flex-1 ${rowHeight} border-r relative ${
                            isToday ? "" : ""
                          }`}
                          onClick={() =>
                            handleSlotClick(timeSlot.timeSlot, day)
                          }
                        >
                          {events.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className='absolute rounded p-1 text-white cursor-move overflow-hidden'
                              style={{
                                backgroundColor: event.color,
                                ...positionEvent(eventIndex),
                              }}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, timeSlot.timeSlot, day)
                              }
                            >
                              <div className='text-xs font-semibold truncate'>
                                {event.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomCalendar;
