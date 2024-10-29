import { useState, useEffect } from "react";
import { headerRoutes } from "../../utils/pageRoutes.ts";
import { Link, useLocation } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import Dropdown from "../common/Dropdown.tsx";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <header
        className={`sticky top-0 transition-all duration-300 ${
          isScrolled ? "bg-[#87ceeb]" : "bg-transparent"
        }`}
      >
        <nav>
          <div className="flex justify-between items-center w-full py-5 px-16">
            <div className="logo">
              <Link to="/">
                <img
                  src="/assets/images/medpal.png"
                  alt="Medpal"
                  className="w-2/12 ms-11"
                />
              </Link>
            </div>

            <div className="flex justify-center">
              <ul className="flex gap-10 me-10">
                {headerRoutes.map((route) => (
                  <li key={route.id}>
                    <Link
                      to={route.path}
                      className={`font-bold font-sans text-lg hover:text-[#4567b7] hover:underline transition duration-50 ease-in-out ${
                        location.pathname === route.path
                          ? "text-[#4567b7] underline"
                          : ""
                      }`}
                    >
                      {route.location}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-8">
              {/* this will lead to the login page (for unauthorized users)*/}
              {/* <button className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out w-28">
                Log in
              </button> */}

              {/*this will be the icon for patient (for authorized users)*/}
              <button
                onClick={toggleDropdown}
                className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-3 rounded-full transition duration-300 ease-in-out"
              >
                <FaRegUser size={30} />
              </button>

              <Dropdown isOpen={isOpen} />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
