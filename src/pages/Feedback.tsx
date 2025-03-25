import { useEffect, useState } from "react";
import {
  IoCalendarOutline,
  IoInformationCircle,
  IoStarOutline,
} from "react-icons/io5";
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
  // getFeedbackByDoctorId,
  postFeedback,
} from "../redux/slices/feedbackSlice";

const TIME_SLOTS = [
  { id: 1, time: "7AM-8AM", slot: 0, timeSlot: "SLOT_7_TO_8" },
  { id: 2, time: "8AM-9AM", slot: 1, timeSlot: "SLOT_8_TO_9" },
  { id: 3, time: "9AM-10AM", slot: 2, timeSlot: "SLOT_9_TO_10" },
  { id: 4, time: "1PM-2PM", slot: 3, timeSlot: "SLOT_13_TO_14" },
  { id: 5, time: "2PM-3PM", slot: 4, timeSlot: "SLOT_14_TO_15" },
  { id: 6, time: "3PM-4PM", slot: 5, timeSlot: "SLOT_15_TO_16" },
];

const truncateFeedback = (feedback: string | undefined, wordLimit: number) => {
  if (!feedback) return "";
  return feedback.length > wordLimit
    ? feedback.slice(0, wordLimit) + "..."
    : feedback;
};

const Feedback = () => {
  // const currentRole = AuthService.getCurrentRole();
  const dispatch = useDispatch<AppDispatch>();
  // const feedbacks = useSelector((state: RootState) => state.feedback.feedbacks);
  const appointments = useSelector(
    (state: RootState) => state.appointment.appointments
  );
  const auth = useSelector((state: RootState) => state.auth);
  const [feedbacked, setFeedbacked] = useState(false);
  // Initialize with empty arrays - we'll populate them when appointments are loaded
  const [starValues, setStarValues] = useState<number[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<string[]>([]);
  const [activeButtons, setActiveButtons] = useState<boolean[]>([]);

  useEffect(() => {
    const id = AuthService.getIdFromToken();
    if (id) {
      dispatch(setUserId(id));
    }
  }, [dispatch]);

  // useEffect(() => {
  //   const doctorId = Number(auth.id);
  //   dispatch(getFeedbackByDoctorId(doctorId));
  // }, [dispatch, auth.id]);

  useEffect(() => {
    const patientId = Number(auth.id);
    dispatch(searchAppointmentForFeedback({ patientId }));
  }, [dispatch, auth.id]);

  // Initialize state arrays only when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      // Initialize with default values
      setStarValues(new Array(appointments.length).fill(0));
      setUserFeedbacks(new Array(appointments.length).fill(""));
      setActiveButtons(new Array(appointments.length).fill(false));
    }
  }, [appointments.length]); // Only depend on the length

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
        toggleButton(index);
      } else if (postFeedback.rejected.match(result)) {
        const errorPayload = result.payload as { message: string };
        if (errorPayload.message?.includes("Duplicate entry")) {
          setFeedbacked(true);
          clearFeedback(index);
          toggleButton(index);
          toast.error(
            "You have already submitted feedback for this appointment."
          );
        } else {
          toast.error("Failed to submit feedback. Please try again.");
        }
      }
    };

  // If state is not initialized yet, show loading or nothing
  if (starValues.length === 0 || userFeedbacks.length === 0) {
    return (
      <div className='flex justify-center items-center p-10'>
        <p>Loading appointments...</p>
      </div>
    );
  }

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
        {appointments.map((appointment, index) => (
          <div className='my-10' key={appointment.id}>
            <div className='bg-[#fff] w-full h-fit rounded-lg hover:shadow-md transition-shadow duration-300'>
              <div className='grid grid-cols-4 gap-3'>
                <div className='w-full h-[100px] rounded-l-lg col-span-1 overflow-hidden'>
                  <img
                    src='/assets/images/care.png'
                    alt='Feedback'
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='col-span-1'>
                  <div className='ps-3 flex flex-col justify-center h-full'>
                    <p className='text-xl font-bold'>
                      {appointment.doctorName}
                    </p>
                  </div>
                </div>
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
                  <div className='flex flex-col justify-center pr-5'>
                    <button
                      className='w-10 h-10 rounded-full bg-[#6B87C7] hover:bg-[#4567B7] transition-colors duration-300 flex justify-center items-center'
                      onClick={() => toggleButton(index)}
                      // {...(feedbacked && { disabled: true })}
                    >
                      <FaAngleLeft
                        className={`text-white text-2xl ${
                          activeButtons[index]
                            ? "transform -rotate-90 transition-transform duration-300"
                            : "transition-transform duration-300"
                        }`}
                        // {...(feedbacked && { disabled: true })}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/*this is the dropdown*/}
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
                    name={`rating-${appointment.id}`}
                    size='large'
                    value={starValues[index]}
                    onChange={(_, newValue) => {
                      setStarValues((prev) => {
                        const newValues = [...prev];
                        // Ensure newValue is never null
                        newValues[index] = newValue === null ? 0 : newValue;
                        return newValues;
                      });
                    }}
                    {...(feedbacked && { disabled: true })}
                  />
                </div>
                <div className='col-span-2 flex flex-col justify-center items-center'>
                  <span className='font-bold text-xl'>
                    Help Us Improve Our Services With Your Valuable Feedback.
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
                    {...(feedbacked && { disabled: true })}
                  ></textarea>
                </div>
              </div>
              {feedbacked === false ? (
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
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Feedback;
