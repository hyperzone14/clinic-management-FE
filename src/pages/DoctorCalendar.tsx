import Calendar, { CalendarProps } from "react-calendar";
import CustomCalendar from "../components/common/CustomCalendar";
import "react-calendar/dist/Calendar.css";
import "../styles/calendar.css";
import React, { useEffect, useState } from "react";
import Occasions from "../components/common/Occasions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setUserId } from "../redux/slices/authSlice";
import { AuthService } from "../utils/security/services/AuthService";

const DoctorCalendar = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const id = AuthService.getIdFromToken();
    if (id) {
      dispatch(setUserId(id));
    }
  }, [dispatch]);

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

  // console.log(selectedDate);

  return (
    <>
      <div>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5 mb-2'>
            DOCTOR CALENDAR
          </h1>
        </div>
        <div className='my-10 grid grid-cols-4 gap-3'>
          <div className='col-span-3'>
            <CustomCalendar chosenDate={selectedDate} doctorId={auth.id} />
          </div>
          <div className='col-span-1 h-fit w-full bg-white shadow-lg rounded-lg'>
            <div className='mb-2'>
              <Calendar
                minDetail='year'
                className=' border-none bg-gray-100'
                tileClassName='rounded-lg hover:bg-gray-100'
                //   navigationClassName='rounded-lg'
                nextLabel='>'
                next2Label={null}
                prevLabel='<'
                prev2Label={null}
                onChange={handleDateChange}
              />
            </div>
            <hr />
            <div className='mt-6 mb-12 px-5'>
              <Occasions chosenDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorCalendar;
