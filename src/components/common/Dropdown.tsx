import React from "react";
import styles from "../../styles/dropdown.module.css";
import { FaRegUser } from "react-icons/fa";
import { PiUserCircleLight } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { PiClockCountdown } from "react-icons/pi";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";

interface DropdownProps {
  isOpen: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  // const displayEmail =
  //   userEmail.length > emailLimit
  //     ? `${userEmail.slice(0, emailLimit)}...`
  //     : userEmail;
  return (
    <div
      className={`${styles.dropdownMenu} ${
        isOpen ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <ul className="pt-2">
        <li className="px-4 py-2 mb-2">
          <div className="flex items-center">
            <PiUserCircleLight
              size={55}
              className="bg-[#4567B7] text-white font-bold p-2 rounded-full"
            />
            <div className="flex flex-col">
              <span className="ms-5">User name</span>
              <span className="ms-5">example@gma...</span>
            </div>
          </div>
        </li>
        <hr />
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="flex items-center my-1">
            <FaRegUser size={25} className="text-black font-bold " />
            <span className="ms-5">Patient Profile</span>
          </div>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center my-1">
            <IoNewspaperOutline size={25} className="text-black font-bold " />
            <span className="ms-5">Appointments</span>
          </div>
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center my-1">
            <PiClockCountdown size={25} className="text-black font-bold " />
            <span className="ms-5">Medical History</span>
          </div>
        </li>
        <hr />
        <li className="px-4 py-3 hover:rounded-b-lg  hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center mt-1">
            <IoMdLogOut size={25} className="text-black font-bold " />
            <span className="ms-5">Log out</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;
