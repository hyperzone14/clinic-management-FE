import React, { useRef, useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const reviewsData = [
  {
    id: 1,
    name: "Tommy",
    rating: 4.5,
    review: "Dr. John Doe is very knowledgeable and experienced.",
  },
  {
    id: 2,
    name: "Linda",
    rating: 3.5,
    review: "Skilled but needs better communication.",
  },
  {
    id: 3,
    name: "Michael",
    rating: 4,
    review: "Very knowledgeable but could be more personable.",
  },
  {
    id: 4,
    name: "John",
    rating: 3.5,
    review:
      "Dr. John Doe is a skilled cardiologist, and he answered my questions adequately. However, there is room for improvement in terms of patient engagement and communication.",
  },
  {
    id: 5,
    name: "Terry",
    rating: 1.5,
    review:
      "While Dr. John Doe is clearly experienced, I felt that the level of care provided was lacking. He was somewhat dismissive of my worries and didn’t provide thorough explanations.",
  },
  {
    id: 6,
    name: "Ford",
    rating: 5,
    review:
      "Dr. John Doe is exceptional. He is not only incredibly knowledgeable but also very patient and empathetic. He took the time to answer all my questions thoroughly and made me feel at ease. I highly recommend him to anyone in need of a great cardiologist.",
  },
];

const SlidingBar = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 340; // Adjust this based on card width
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(
    reviewsData.length > 4
  );

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollValue = direction === "left" ? -scrollAmount : scrollAmount;
      scrollContainerRef.current.scrollBy({
        left: scrollValue,
        behavior: "smooth",
      });
    }
  };

  const updateButtonVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener(
        "scroll",
        updateButtonVisibility
      );
      updateButtonVisibility(); // Initial check
    }
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener(
          "scroll",
          updateButtonVisibility
        );
      }
    };
  }, []);

  return (
    <div className='relative flex items-center w-full'>
      {/* Left Button */}
      {showLeftButton && (
        <button
          onClick={() => handleScroll("left")}
          className='bg-gray-300 p-2 rounded-full w-12 h-12 flex items-center justify-center hover:shadow-md transition duration-300 absolute -left-6 z-10'
        >
          <FaAngleLeft size={30} />
        </button>
      )}

      {/* Scrollable Container */}
      <div className='w-full overflow-hidden'>
        <div
          ref={scrollContainerRef}
          className='flex gap-4 overflow-x-scroll scroll-smooth'
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {reviewsData.map((review) => (
            <div
              className='bg-white w-80 rounded-lg p-5 flex-shrink-0'
              key={review.id}
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  <img
                    src='/assets/images/profile.png'
                    alt={review.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='ml-3'>
                  <h1 className='text-xl font-bold'>{review.name}</h1>
                </div>
                <div className='ms-5'>
                  <Rating
                    name='half-rating-read justify-center'
                    value={review.rating}
                    precision={0.5}
                    readOnly
                  />
                </div>
              </div>
              <div className='mt-5'>
                <p className='text-gray-500'>{review.review}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Button */}
      {showRightButton && (
        <button
          onClick={() => handleScroll("right")}
          className='bg-gray-300 p-2 rounded-full w-12 h-12 flex items-center justify-center hover:shadow-md transition duration-300 absolute -right-6 z-10'
        >
          <FaAngleRight size={30} />
        </button>
      )}
    </div>
  );
};

export default SlidingBar;
