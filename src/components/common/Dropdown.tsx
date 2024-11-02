import React, { useEffect, useState, useRef } from "react";
import { FaRegUser } from "react-icons/fa";
import { PiUserCircleLight } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { PiClockCountdown } from "react-icons/pi";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen, onClose }) => {
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-2 mt-2 w-60 bg-white rounded-lg shadow-lg z-10
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        transition-all duration-300 ease-in-out`}
    >
      <ul className="pt-2">
        <li className="px-4 py-2 mb-2">
          <div className="flex items-center">
            {/* <PiUserCircleLight
              size={55}
              className="bg-[#4567B7] text-white font-bold p-2 rounded-full"
            /> */}
            {profile.imageURL ? (
              <img
                src={profile.imageURL}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <PiUserCircleLight
                size={55}
                className="bg-[#4567B7] text-white font-bold p-1.5 rounded-full"
              />
            )}
            <div className="flex flex-col">
              <span className="ms-5">User name</span>
              <span className="ms-5">example@gma...</span>
            </div>
          </div>
        </li>
        <hr />
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => {
            navigate("/profile");
            onClose();
          }}
        >
          <div className="flex items-center my-1">
            <FaRegUser size={25} className="text-black font-bold" />
            <span className="ms-5">Patient Profile</span>
          </div>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center my-1">
            <IoNewspaperOutline size={25} className="text-black font-bold" />
            <span className="ms-5">Appointments</span>
          </div>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center my-1">
            <PiClockCountdown size={25} className="text-black font-bold" />
            <span className="ms-5">Medical History</span>
          </div>
        </li>
        <hr />
        <li
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors rounded-b-lg"
          onClick={onClose}
        >
          <div className="flex items-center mt-1">
            <IoMdLogOut size={25} className="text-black font-bold" />
            <span className="ms-5">Log out</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;
