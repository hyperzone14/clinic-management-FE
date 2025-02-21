import React, { useState } from "react";
import { IoMdPricetags } from "react-icons/io";
import { MdOutlineGroup } from "react-icons/md";
import {
  IoCalendarOutline,
  IoInformationCircle,
  IoStarOutline,
} from "react-icons/io5";
import { BsClockHistory } from "react-icons/bs";
import { Rating } from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";

const feedbackData = [
  {
    id: 1,
    doctorName: "Dr. John Doe",
    specialty: "Cardiologist",
    date: "18/2/2025",
    duration: "8AM-9AM",
    price: "70.000VNĐ",
    rating: "0",
    feedback: "...",
  },
  {
    id: 2,
    doctorName: "Dr. Jane Doe",
    specialty: "Dermatology",
    date: "05/02/2025",
    duration: "10AM-11AM",
    price: "70.000VNĐ",
    rating: "3",
    feedback: "Good doctor but the waiting time is too long",
  },
  {
    id: 3,
    doctorName: "Dr. Joe",
    specialty: "Cardiologist",
    date: "23/01/2025",
    duration: "3PM-4PM",
    price: "70.000VNĐ",
    rating: "4",
    feedback: "Excellent service",
  },
];

const truncateFeedback = (feedback: string, wordLimit: number) => {
  return feedback.length > wordLimit
    ? feedback.slice(0, wordLimit) + "..."
    : feedback;
};

const Feedback = () => {
  const [starValue, setStarValue] = useState<number[]>(
    feedbackData.map(() => 0)
  );
  const [userFeedback, setUserFeedback] = useState<string[]>(
    feedbackData.map(() => "")
  );
  const [activeButtons, setActiveButtons] = useState<boolean[]>(
    feedbackData.map(() => false)
  );
  // const [isClearClicked, setIsClearClicked] = useState<boolean>(false);

  const toggleButton = (index: number) => {
    setActiveButtons((prev) =>
      prev.map((isActive, i) => (i === index ? !isActive : isActive))
    );
  };

  const clearFeedback = (index: number) => {
    setStarValue((prev) => {
      const updatedValues = [...prev];
      updatedValues[index] = 0;
      return updatedValues;
    });
    setUserFeedback((prev) => {
      const updatedValues = [...prev];
      updatedValues[index] = "";
      return updatedValues;
    });
  };

  return (
    <>
      <div>
        <div className='flex flex-col my-5 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5 mb-2'>FEEDBACK</h1>
          <span className='text-[#808080] text-xl'>
            Your Voice, Our Improvement
          </span>
        </div>
        {feedbackData.map((feedback, index) => (
          <div className='my-10' key={feedback.id}>
            <div className='bg-[#fff] w-full h-fit rounded-lg hover:shadow-md transition-shadow duration-300'>
              <div className='grid grid-cols-5 gap-3'>
                <div className='w-full h-[100px] rounded-l-lg col-span-1 overflow-hidden'>
                  <img
                    src='/assets/images/care.png'
                    alt='Feedback'
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='col-span-1'>
                  <div className='ps-3 flex flex-col justify-center h-full'>
                    <p className='text-xl font-bold'>{feedback.doctorName}</p>
                    <div className='flex mt-1 items-center'>
                      <MdOutlineGroup className='text-lg mr-2' />
                      <span className='text-md'>{feedback.specialty}</span>
                    </div>
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className='flex flex-col justify-center h-full'>
                    <div className='flex items-center'>
                      <IoCalendarOutline className='text-lg mr-2' />
                      <span className='text-md'>{feedback.date}</span>
                    </div>
                    <div className='flex mt-1 items-center'>
                      <BsClockHistory className='text-lg mr-2' />
                      <span className='text-md'>{feedback.duration}</span>
                    </div>
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className='flex flex-col justify-center h-full'>
                    <div className='flex items-center'>
                      <IoMdPricetags className='text-lg mr-2' />
                      <span className='text-md'>{feedback.price}</span>
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
                        {truncateFeedback(feedback.feedback, 15)}
                      </span>
                    </div>
                  </div>
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
                    name='half-rating-read justify-center'
                    size='large'
                    value={starValue[index]}
                    onChange={(event, newValue) => {
                      setStarValue((prev) => {
                        const updatedValues = [...prev];
                        updatedValues[index] = newValue ?? 0;
                        feedback.rating = newValue?.toString() ?? "0";
                        return updatedValues;
                      });
                    }}
                    precision={0.5}
                  />
                </div>
                <div className='col-span-2 flex flex-col justify-center items-center'>
                  <span className='font-bold text-xl'>
                    Help Us Improve Our Services With Your Valuable Feedback.
                  </span>
                  <textarea
                    className='w-full h-20 p-3 rounded-lg mt-3'
                    placeholder='Your feedback here...'
                    value={userFeedback[index]}
                    onChange={(e) => {
                      setUserFeedback((prev) => {
                        const updatedValues = [...prev];
                        updatedValues[index] = e.target.value;
                        feedback.feedback = e.target.value;
                        return updatedValues;
                      });
                    }}
                  ></textarea>
                </div>
              </div>
              <div className='flex justify-end mb-5 pr-4 gap-3'>
                <button className='bg-[#6B87C7] hover:bg-[#4567B7] text-white text-lg py-2 px-4 rounded-lg transition duration-300 ease-in-out'>
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
      </div>
    </>
  );
};

export default Feedback;
