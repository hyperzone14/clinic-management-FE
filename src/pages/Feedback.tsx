import { useEffect, useState } from "react";
import {
  IoCalendarOutline,
  IoInformationCircle,
  IoStarOutline,
} from "react-icons/io5";
import { GrGroup } from "react-icons/gr";
import { BsClockHistory } from "react-icons/bs";
import { Rating } from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { searchAppointmentForFeedback } from "../redux/slices/appointmentSlice";
import { setUserId } from "../redux/slices/authSlice";
import { AuthService } from "../utils/security/services/AuthService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getFeedbackByDoctorId,
  getFeedbackByPatientId,
  postFeedback,
} from "../redux/slices/feedbackSlice";
import { LuCalendarClock } from "react-icons/lu";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
];

type FeedbackedDoctors = Array<{
  doctorName: string | undefined;
  departmentName: string | undefined;
  appointmentDate: string;
  timeSlot: string;
  rating: number;
  comment: string;
}>;

const truncateFeedback = (feedback: string | undefined, wordLimit: number) => {
  if (!feedback) return "";
  return feedback.length > wordLimit
    ? feedback.slice(0, wordLimit) + "..."
    : feedback;
};

const Feedback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const feedbacks = useSelector((state: RootState) => state.feedback.feedbacks);
  const appointments = useSelector(
    (state: RootState) => state.appointment.appointments
  );
  const auth = useSelector((state: RootState) => state.auth);
  const [starValues, setStarValues] = useState<number[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<string[]>([]);
  const [activeButtons, setActiveButtons] = useState<boolean[]>([]);
  const isDoctor = AuthService.hasRole("ROLE_DOCTOR");
  const [activeNotFeedbackedButtons, setActiveNotFeedbackedButtons] = useState<
    boolean[]
  >([]);
  const [activeFeedbackedButtons, setActiveFeedbackedButtons] = useState<
    boolean[]
  >([]);

  // State to hold categorized appointments
  const [notFeedbackedAppointments, setNotFeedbackedAppointments] = useState<
    typeof appointments
  >([]);
  const [feedbackedDoctors, setFeedbackedDoctors] = useState<FeedbackedDoctors>(
    []
  );

  useEffect(() => {
    const id = AuthService.getIdFromToken();
    if (id) {
      dispatch(setUserId(id));
    }
  }, [dispatch]);

  useEffect(() => {
    const userId = Number(auth.id);
    if (isDoctor) {
      dispatch(getFeedbackByDoctorId(userId));
    } else {
      dispatch(getFeedbackByPatientId(userId));
      dispatch(searchAppointmentForFeedback({ patientId: userId }));
    }
  }, [dispatch, auth.id, isDoctor]);

  useEffect(() => {
    if (!isDoctor) {
      const feedbackedDoctors: FeedbackedDoctors = [];
      const notFeedbackedDoctors: typeof appointments = [];

      appointments.forEach((appointment) => {
        const feedbackIndex = feedbacks.findIndex(
          (feedback) => feedback.doctorResponseDTO?.id === appointment.doctorId
        );

        if (feedbackIndex !== -1) {
          feedbackedDoctors.push({
            doctorName: appointment.doctorName,
            departmentName: appointment.departmentName,
            appointmentDate: appointment.appointmentDate,
            timeSlot: appointment.timeSlot,
            rating: feedbacks[feedbackIndex].rating,
            comment: feedbacks[feedbackIndex].comment,
          });
        } else {
          notFeedbackedDoctors.push(appointment);
        }
      });

      setFeedbackedDoctors(feedbackedDoctors);
      setNotFeedbackedAppointments(notFeedbackedDoctors);
    }
  }, [appointments, feedbacks, isDoctor]);

  useEffect(() => {
    if (!isDoctor && appointments.length > 0) {
      setStarValues(new Array(appointments.length).fill(0));
      setUserFeedbacks(new Array(appointments.length).fill(""));
      setActiveButtons(new Array(appointments.length).fill(false));
    } else if (isDoctor && feedbacks.length > 0) {
      setStarValues(feedbacks.map((feedback) => feedback.rating));
      setUserFeedbacks(feedbacks.map((feedback) => feedback.comment));
      setActiveButtons(new Array(feedbacks.length).fill(false));
    }
  }, [appointments.length, feedbacks, isDoctor]);

  const toggleNotFeedbackedButton = (index: number) => {
    setActiveNotFeedbackedButtons((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleFeedbackedButton = (index: number) => {
    setActiveFeedbackedButtons((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleButton = (index: number) => {
    setActiveButtons((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const formatDate = (date: null | Date | string): string => {
    if (!date) return "N/A";

    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const day = String(parsedDate.getDate()).padStart(2, "0");
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const year = parsedDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    return "N/A";
  };

  const clearFeedback = (index: number) => {
    setStarValues((prev) => {
      const newValues = [...prev];
      newValues[index] = 0;
      return newValues;
    });

    setUserFeedbacks((prev) => {
      const newValues = [...prev];
      newValues[index] = "";
      return newValues;
    });
  };

  const handlePostFeedback =
    (
      appointmentId: number | undefined,
      index: number,
      rating: number,
      comment: string
    ) =>
    async (event: React.MouseEvent) => {
      event.preventDefault();

      if (rating === 0 || !comment) {
        toast.error("Please fill in all fields before submitting feedback.");
        return;
      }

      const result = await dispatch(
        postFeedback({
          appointmentId: appointmentId!,
          feedbackData: { rating, comment },
        })
      );

      if (postFeedback.fulfilled.match(result)) {
        toast.success("Feedback submitted successfully.");
        clearFeedback(index);
        toggleNotFeedbackedButton(index);
      } else {
        clearFeedback(index);
        toggleNotFeedbackedButton(index);
        toast.error(
          "You have already submitted feedback for this appointment."
        );
      }
    };

  if (starValues.length === 0 || userFeedbacks.length === 0) {
    return (
      <div className='flex justify-center items-center p-10'>
        <p>Loading appointments...</p>
      </div>
    );
  }

  const formatDateForApi = (date: string): string => {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <ToastContainer />
      <div>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5 mb-2'>FEEDBACK</h1>
          <span className='text-[#808080] text-xl'>
            Your Voice, Our Improvement
          </span>
        </div>

        {/* If not a doctor, render both not-feedbacked and feedbacked */}
        {!isDoctor ? (
          <>
            {/* Render Not-Feedbacked Appointments */}
            {notFeedbackedAppointments.map((appointment, index) => (
              <div className='my-10' key={appointment.id}>
                {/* Render logic for not-feedbacked appointments */}
                <div className='bg-[#fff] w-full h-fit rounded-lg hover:shadow-md transition-shadow duration-300'>
                  <div className='grid grid-cols-4 gap-3'>
                    {/*image section*/}
                    <div className='w-full h-[100px] rounded-l-lg col-span-1 overflow-hidden'>
                      <img
                        src='/assets/images/care.png'
                        alt='Feedback'
                        className='w-full h-full object-cover'
                      />
                    </div>

                    {/*doctor info section*/}
                    <div className='col-span-1'>
                      <div className='ps-3 flex flex-col justify-center h-full'>
                        <p className='text-xl font-bold'>
                          {appointment.doctorName}
                        </p>
                        <div className='flex mt-1 items-center'>
                          <GrGroup className='text-lg mr-2' />
                          <p className='text-md font-bold'>
                            {appointment.departmentName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/*appointment info section*/}
                    <div className='col-span-1'>
                      <div className='flex flex-col justify-center h-full'>
                        <div className='flex items-center'>
                          <IoCalendarOutline className='text-lg mr-2' />
                          <span className='text-md'>
                            {formatDate(appointment.appointmentDate)}
                          </span>
                        </div>
                        <div className='flex mt-1 items-center'>
                          <BsClockHistory className='text-lg mr-2' />
                          <span className='text-md'>
                            {
                              TIME_SLOTS.find(
                                (slot) => slot.timeSlot === appointment.timeSlot
                              )?.time
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*feedback section*/}
                    <div className='col-span-1 flex justify-between'>
                      <div className='flex flex-col justify-center h-full'>
                        <div className='flex items-center'>
                          <IoStarOutline className='text-lg mr-2' />
                          <span className='text-md'>{starValues[index]}/5</span>
                        </div>
                        <div className='flex mt-1 items-center'>
                          <IoInformationCircle className='text-lg mr-2' />
                          <span className='text-md'>
                            {truncateFeedback(userFeedbacks[index], 15)}
                          </span>
                        </div>
                      </div>

                      {/*dropdown area*/}
                      <div className='flex flex-col justify-center pr-5'>
                        <button
                          className='w-10 h-10 rounded-full bg-[#6B87C7] hover:bg-[#4567B7] transition-colors duration-300 flex justify-center items-center'
                          onClick={() => toggleNotFeedbackedButton(index)}
                        >
                          <FaAngleLeft
                            className={`text-white text-2xl ${
                              activeButtons[index]
                                ? "transform -rotate-90 transition-transform duration-300"
                                : "transition-transform duration-300"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    activeNotFeedbackedButtons[index]
                      ? "max-h-screen duration-[1.25s]"
                      : "max-h-0 duration-[0.25s]"
                  } overflow-hidden bg-[#f0f0f0] w-full rounded-lg transition-all`}
                >
                  <div className='grid grid-cols-3 p-5 gap-3'>
                    <div className='col-span-1 flex flex-col justify-center items-center'>
                      <span className='font-bold text-xl'>
                        How Did Your Visit Feel?
                      </span>
                      <Rating
                        name={`rating-${appointment.id}`}
                        size='large'
                        value={starValues[index]}
                        onChange={(_, newValue) => {
                          setStarValues((prev) => {
                            const newValues = [...prev];
                            newValues[index] = newValue === null ? 0 : newValue;
                            return newValues;
                          });
                        }}
                      />
                    </div>
                    <div className='col-span-2 flex flex-col justify-center items-center'>
                      <span className='font-bold text-xl'>
                        Help Us Improve Our Services With Your Valuable
                        Feedback.
                      </span>
                      <textarea
                        className='w-full h-20 p-3 rounded-lg mt-3'
                        placeholder='Your feedback here...'
                        value={userFeedbacks[index]}
                        onChange={(e) => {
                          setUserFeedbacks((prev) => {
                            const newValues = [...prev];
                            newValues[index] = e.target.value;
                            return newValues;
                          });
                        }}
                      ></textarea>
                    </div>
                  </div>

                  {/*Buttons section*/}
                  <div className='flex justify-end mb-5 pr-4 gap-3'>
                    <button
                      className='bg-[#6B87C7] hover:bg-[#4567B7] text-white text-lg py-2 px-4 rounded-lg transition duration-300 ease-in-out'
                      onClick={handlePostFeedback(
                        appointment.id,
                        index,
                        starValues[index],
                        userFeedbacks[index]
                      )}
                    >
                      Submit
                    </button>
                    <button
                      className='bg-[#D3D3D3] hover:bg-[#A9A9A9] text-black text-lg py-2 px-4 rounded-lg transition duration-300 ease-in-out'
                      onClick={() => clearFeedback(index)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Render Feedbacked Doctors */}
            {feedbackedDoctors.map((feedback, index) => (
              <div className='my-10' key={index}>
                <div className='bg-[#fff] w-full h-fit rounded-lg hover:shadow-md transition-shadow duration-300'>
                  <div className='grid grid-cols-4 gap-3'>
                    {/*image section*/}
                    <div className='w-full h-[100px] rounded-l-lg col-span-1 overflow-hidden'>
                      <img
                        src='/assets/images/care.png'
                        alt='Feedback'
                        className='w-full h-full object-cover'
                      />
                    </div>

                    {/*doctor info section*/}
                    <div className='col-span-1'>
                      <div className='ps-3 flex flex-col justify-center h-full'>
                        <p className='text-xl font-bold'>
                          {feedback.doctorName}
                        </p>
                        <div className='flex mt-1 items-center'>
                          <GrGroup className='text-lg mr-2' />
                          <p className='text-md font-bold'>
                            {feedback.departmentName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/*appointment info section*/}
                    <div className='col-span-1'>
                      <div className='flex flex-col justify-center h-full'>
                        <div className='flex items-center'>
                          <IoCalendarOutline className='text-lg mr-2' />
                          <span className='text-md'>
                            {formatDate(feedback.appointmentDate)}
                          </span>
                        </div>
                        <div className='flex mt-1 items-center'>
                          <BsClockHistory className='text-lg mr-2' />
                          <span className='text-md'>
                            {
                              TIME_SLOTS.find(
                                (slot) => slot.timeSlot === feedback.timeSlot
                              )?.time
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*feedback section*/}
                    <div className='col-span-1 flex justify-between'>
                      <div className='flex flex-col justify-center h-full'>
                        <div className='flex items-center'>
                          <IoStarOutline className='text-lg mr-2' />
                          <span className='text-md'>{feedback.rating}/5</span>
                        </div>
                        <div className='flex mt-1 items-center'>
                          <IoInformationCircle className='text-lg mr-2' />
                          <span className='text-md'>
                            {truncateFeedback(feedback.comment, 15)}
                          </span>
                        </div>
                      </div>
                      {/*dropdown area*/}
                      <div className='flex flex-col justify-center pr-5'>
                        <button
                          className='w-10 h-10 rounded-full bg-[#6B87C7] hover:bg-[#4567B7] transition-colors duration-300 flex justify-center items-center'
                          onClick={() => toggleFeedbackedButton(index)}
                        >
                          <FaAngleLeft
                            className={`text-white text-2xl ${
                              activeFeedbackedButtons[index]
                                ? "transform -rotate-90 transition-transform duration-300"
                                : "transition-transform duration-300"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`${
                    activeFeedbackedButtons[index]
                      ? "max-h-screen duration-[1.25s]"
                      : "max-h-0 duration-[0.25s]"
                  } overflow-hidden bg-[#f0f0f0] w-full rounded-lg transition-all`}
                >
                  <div className='grid grid-cols-3 p-5 gap-3'>
                    <div className='col-span-1 flex flex-col justify-center items-center'>
                      <span className='font-bold text-xl'>
                        How Did Your Visit Feel?
                      </span>
                      <Rating
                        name={`rating-${index}`}
                        size='large'
                        value={feedback.rating}
                        disabled
                      />
                    </div>
                    <div className='col-span-2 flex flex-col justify-center items-center'>
                      <span className='font-bold text-xl'>
                        Help Us Improve Our Services With Your Valuable
                        Feedback.
                      </span>
                      <textarea
                        className='w-full h-20 p-3 rounded-lg mt-3'
                        placeholder='Your feedback here...'
                        value={feedback.comment}
                        disabled
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          /* If a doctor, render normal feedbacks */
          feedbacks.map((feedback, index) => (
            <div className='my-10' key={index}>
              <div className='bg-[#fff] w-full h-fit rounded-lg hover:shadow-md transition-shadow duration-300'>
                <div className='grid grid-cols-3 gap-3'>
                  <div className='w-full h-[100px] rounded-l-lg col-span-1 overflow-hidden'>
                    <img
                      src='/assets/images/care.png'
                      alt='Feedback'
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='col-span-1'>
                    <div className='ps-3 flex flex-col justify-center h-full'>
                      <div className='flex items-center'>
                        <LuCalendarClock className='text-2xl mr-2' />
                        <p className='text-lg font-bold'>
                          Created date: {formatDateForApi(feedback.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='col-span-1 flex justify-between'>
                    <div className='flex flex-col justify-center h-full'>
                      <div className='flex items-center'>
                        <IoStarOutline className='text-lg mr-2' />
                        <span className='text-md'>{feedback.rating}/5</span>
                      </div>
                      <div className='flex mt-1 items-center'>
                        <IoInformationCircle className='text-lg mr-2' />
                        <span className='text-md'>
                          {truncateFeedback(feedback.comment, 15)}
                        </span>
                      </div>
                    </div>
                    {/*dropdown area*/}
                    <div className='flex flex-col justify-center pr-5'>
                      <button
                        className='w-10 h-10 rounded-full bg-[#6B87C7] hover:bg-[#4567B7] transition-colors duration-300 flex justify-center items-center'
                        onClick={() => toggleButton(index)}
                      >
                        <FaAngleLeft
                          className={`text-white text-2xl ${
                            activeButtons[index]
                              ? "transform -rotate-90 transition-transform duration-300"
                              : "transition-transform duration-300"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  activeButtons[index]
                    ? "max-h-screen duration-[1.25s]"
                    : "max-h-0 duration-[0.25s]"
                } overflow-hidden bg-[#f0f0f0] w-full rounded-lg transition-all`}
              >
                <div className='grid grid-cols-3 p-5 gap-3'>
                  <div className='col-span-1 flex flex-col justify-center items-center'>
                    <span className='font-bold text-xl'>
                      How Did Your Visit Feel?
                    </span>
                    <Rating
                      name={`rating-${index}`}
                      size='large'
                      value={feedback.rating}
                      disabled
                    />
                  </div>
                  <div className='col-span-2 flex flex-col justify-center items-center'>
                    <span className='font-bold text-xl'>
                      Help Us Improve Our Services With Your Valuable Feedback.
                    </span>
                    <textarea
                      className='w-full h-20 p-3 rounded-lg mt-3'
                      placeholder='Your feedback here...'
                      value={feedback.comment}
                      disabled
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Feedback;
