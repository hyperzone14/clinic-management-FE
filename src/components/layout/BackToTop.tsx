import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";

export const BackToTop = () => {
  const [backToTop, setBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setBackToTop(true);
      } else {
        setBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {backToTop && (
        <button
          className="fixed bottom-5 right-5 bg-[#4567b7] text-white p-3 rounded-full shadow-lg hover:bg-[#3E5CA3] transition-colors duration-300"
          onClick={scrollUp}
          aria-label="Back to top"
        >
          <FaChevronUp />
        </button>
      )}
    </>
  );
};
