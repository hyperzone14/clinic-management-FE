import { useRef, useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getFeedbackByDoctorId } from "../../redux/slices/feedbackSlice";
import { AppDispatch, RootState } from "../../redux/store";

interface SlidingBarProps {
  feedbackId: string | null;
}

const SlidingBar: React.FC<SlidingBarProps> = ({ feedbackId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 340; // Adjust this based on card width
  const [showLeftButton, setShowLeftButton] = useState(false);

  const feedbacks = useSelector((state: RootState) => state.feedback.feedbacks);
  const [showRightButton, setShowRightButton] = useState(feedbacks.length > 4);

  useEffect(() => {
    if (feedbackId) {
      dispatch(getFeedbackByDoctorId(Number(feedbackId)));
    }
  }, [dispatch, feedbackId]);

  // console.log(feedbacks);
  // console.log(feedbacks.length);

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
      <div ref={scrollContainerRef} className='flex overflow-x-auto space-x-4'>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <div key={index} className='w-full flex-shrink-0'>
              <div className='flex flex-col items-center'>
                <div className='flex items-center'>
                  <Rating
                    name='half-rating-read justify-center'
                    value={feedback.rating}
                    precision={0.5}
                    readOnly
                  />
                </div>
                <div className='mt-5'>
                  <p className='text-gray-500'>{feedback.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='w-full flex justify-center items-center'>
            <h1 className='text-2xl text-gray-500 text-center w-full'>
              No feedbacks available
            </h1>
          </div>
        )}
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
