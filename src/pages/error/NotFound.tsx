import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NotFound: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return () => {
      if (location.pathname !== "/error") {
        nav("/error", { replace: true });
      }
    };
  }, [location, nav]);

  const backToPage = () => {
    nav(-1);
  };
  return (
    <div className="flex flex-col items-center justify-center mt-20 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          404: Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          Well, look who stumbled upon the infamous 404 page! It's like the
          Bermuda Triangle of the internet, swallowing your hopes and dreams of
          finding that one page. Time to hit the "back" button and pretend this
          never happened.
        </p>
        <button
          className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out text-xl"
          onClick={backToPage}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
