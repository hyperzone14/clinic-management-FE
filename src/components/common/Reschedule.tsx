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
import Calendar, { CalendarProps } from "react-calendar";
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  // const currentAppointment = useSelector((state: RootState) => state.appointment.currentAppointment);
  const currentAppointment = useSelector(
    (state: RootState) => state.appointment.currentAppointment
  );
  const currentDoctor = useSelector((state: RootState) =>
    state.doctor.doctors.find((doctor) => doctorId === doctor.id)
  );
  const availableSlots = useSelector(
    (state: RootState) =>
      state.checkAvailability.doctorTimeslotCapacityResponseDTO
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

  // console.log("currentDoctor", currentDoctor);

  const tileDisabled = ({ date }: { date: Date }) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const isBeforeToday = compareDate < todayDate;
    const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
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
      .map((day) => dayNameToNumber[day.toUpperCase()]) // Convert day names to numbers
      .filter((day): day is number => day !== undefined); // Remove undefined values

    console.log("workingDays", workingDays);
    return isBeforeToday || isWeekend || !workingDays.includes(dayOfWeek);
  };

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

  const isSlotAvailable = (slotId: string): boolean => {
    if (availableSlots.length === 0) {
      return true;
    }
    const slot = availableSlots.find((s) => s.timeSlot === slotId);
    if (!slot) {
      return false;
    }
    return slot.currentPatients < slot.maxPatients;
  };

  const getSlotStyle = (slotId: string): string => {
    const isOriginalSlot =
      selectedDate &&
      bookingDate &&
      formatDateForApi(selectedDate) === bookingDate &&
      slotId === timeSlot;

    const isAvailable = isSlotAvailable(slotId);

    if (isOriginalSlot) {
      return "my-3 w-fit h-fit p-3 rounded-lg bg-gray-400 text-gray-600 cursor-not-allowed";
    }

    return isAvailable
      ? "my-3 w-fit h-fit p-3 rounded-lg bg-[#BAE3F3] hover:bg-[#87ceeb] cursor-pointer text-[#1F3658] hover:text-[#fff] hover:shadow-lg transition duration-200 ease-in-out"
      : "my-3 w-fit h-fit p-3 rounded-lg bg-gray-400 text-gray-600 cursor-not-allowed";
  };

  const handleTimeSlotClick = (time: string, slotId: string) => {
    const isOriginalSlot =
      selectedDate &&
      bookingDate &&
      formatDateForApi(selectedDate) === bookingDate &&
      slotId === timeSlot;

    if (isSlotAvailable(slotId) && !isOriginalSlot) {
      setSelectedTime(time);
    }
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

    try {
      await dispatch(
        rescheduleAppointment({
          appointmentId,
          appointmentDate: formatDateForApi(selectedDate),
          timeSlot: timeSlotObj.slot,
        })
      ).unwrap();

      toast.success("Appointment rescheduled successfully!");
      handleCloseReschedule();
    } catch (error) {
      console.error("Rescheduling error:", error);
      toast.error("Failed to reschedule appointment. Please try again.");
    }
  };

  return (
    <Dialog
      open={openReschedule}
      onClose={(_e, reason) => {
        if (reason === "backdropClick") {
          handleCloseReschedule();
        }
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Reschedule Appointment</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <span className="font-semibold min-w-[180px]">
                Current Appointment:
              </span>
              <span className="text-gray-700">
                {formatDate(currentAppointment?.appointmentDate)} at{" "}
                {currentAppointment?.timeSlot}
              </span>
            </div>

            <div className="font-medium">
              New Date:{" "}
              {selectedDate
                ? formatDate(selectedDate.toISOString())
                : "Not selected"}
            </div>

            <div className="font-medium">
              New Time: {selectedTime || "Not selected"}
            </div>

            <div className="flex justify-center mt-6">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDetail="month"
                prevLabel="Previous"
                nextLabel="Next"
                tileDisabled={tileDisabled}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mt-6">
              {TIME_SLOTS.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className="col-span-1 flex justify-center items-center"
                >
                  <div
                    className={getSlotStyle(timeSlot.timeSlot)}
                    onClick={() =>
                      handleTimeSlotClick(timeSlot.time, timeSlot.timeSlot)
                    }
                  >
                    <span className="font-bold">{timeSlot.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogActions className="mt-6">
            <Button onClick={handleCloseReschedule} color="error">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Confirm Reschedule
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Reschedule;
