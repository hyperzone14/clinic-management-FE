import { useState, useEffect, useRef } from "react";
import { headerRoutes } from "../../utils/pageRoutes.ts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown from "../common/Dropdown.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.ts";
import { PiUserCircleLight } from "react-icons/pi";

export const Header = () => {
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.profile);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 transition-all duration-300 z-10 ${
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

          <div className="mx-8" ref={dropdownRef}>
            {/* this will lead to the login page (for unauthorized users)*/}
            <button
              className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out w-28"
              onClick={() => {
                navigate("/login");
              }}
            >
              Log in
            </button>

            {/* this will be for authorized users*/}
            {/* {profile.imageURL ? (
              <img
                src={profile.imageURL}
                alt="Profile"
                className="w-28 h-[3.25rem] rounded-full transition duration-300 ease-in-out object-cover cursor-pointer"
                onClick={toggleDropdown}
              />
            ) : (
              <PiUserCircleLight
                size={55}
                className="bg-[#6B87C7] hover:bg-[#4567B7] text-white font-bold p-1.5 rounded-full transition duration-300 ease-in-out"
                onClick={toggleDropdown}
              />
            )} */}

            <Dropdown isOpen={isOpen} onClose={closeDropdown} />
          </div>
        </div>
      </nav>
    </header>
  );
};
