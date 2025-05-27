import React, { useEffect, useState, useRef } from "react";
import { FaRegUser } from "react-icons/fa";
import { PiUserCircleLight } from "react-icons/pi";
import { IoCalendarOutline, IoNewspaperOutline } from "react-icons/io5";
import { PiClockCountdown } from "react-icons/pi";
import { RiCalendarCheckLine } from "react-icons/ri";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { AuthService } from "../../utils/security/services/AuthService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlinePayments } from "react-icons/md";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  onLogout,
  // userName,
  userEmail,
}) => {
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  const [roles, setRoles] = useState<string[] | null>(null);
  const isDoctor = roles?.includes("ROLE_DOCTOR");
  const isNurse = roles?.includes("ROLE_NURSE");

  const handleReduce = (data: string | null | undefined) => {
    if (data == null) return ""; // handles both null and undefined
    if (data.length > 15) {
      return data.slice(0, 15) + "...";
    }
    return data; // return full string if 8 characters or less
  };

  useEffect(() => {
    try {
      const userRoles = AuthService.getRolesFromToken();
      setRoles(userRoles);
      if (!userRoles) {
        toast.error("No roles found or user is not authenticated");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error(
        `Error fetching roles: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }, []);

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

  // Common menu items that both doctor and patient have
  const commonMenuItems = (
    <>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/profile");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <FaRegUser size={25} className='text-black font-bold' />
          <span className='ms-5'>Profile</span>
        </div>
      </li>
      {/* <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/booking-bill");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <IoNewspaperOutline size={25} className='text-black font-bold' />
          <span className='ms-5'>Booking Bill</span>
        </div>
      </li> */}
    </>
  );

  const nurseMemuItems = (
    <>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/manual-booking");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <IoCalendarOutline size={25} className='text-black font-bold' />
          <span className='ms-5'>Manual Booking</span>
        </div>
      </li>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/lab-test-payment");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <MdOutlinePayments size={25} className='text-black font-bold' />
          <span className='ms-5'>Lab Test Payment</span>
        </div>
      </li>
    </>
  );

  // Doctor-specific menu items
  const doctorMenuItems = (
    <>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/booking-bill");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <IoNewspaperOutline size={25} className='text-black font-bold' />
          <span className='ms-5'>Booking Bill</span>
        </div>
      </li>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/doctor-calendar");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <RiCalendarCheckLine size={25} className='text-black font-bold' />
          <span className='ms-5'>Doctor Calendar</span>
        </div>
      </li>
      {/* <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/manual-checkin");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <PiClockCountdown size={25} className='text-black font-bold' />
          <span className='ms-5'>Manual Check-in</span>
        </div>
      </li> */}
    </>
  );

  // Patient-specific menu items
  const patientMenuItems = (
    <>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/booking-bill");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <IoNewspaperOutline size={25} className='text-black font-bold' />
          <span className='ms-5'>Booking Bill</span>
        </div>
      </li>
      <li
        className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors'
        onClick={() => {
          navigate("/medical-history");
          onClose();
        }}
      >
        <div className='flex items-center my-1'>
          <PiClockCountdown size={25} className='text-black font-bold' />
          <span className='ms-5'>Medical History</span>
        </div>
      </li>
    </>
  );

  return (
    <>
      <ToastContainer />
      <div
        ref={dropdownRef}
        className={`absolute right-2 mt-2 w-60 bg-white rounded-lg shadow-lg z-10
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        transition-all duration-300 ease-in-out`}
      >
        <ul className='pt-2'>
          {/* User Profile Section */}
          <li className='px-4 py-2 mb-2'>
            <div className='flex items-center'>
              {profile.imageURL ? (
                <img
                  src={profile.imageURL}
                  alt='Profile'
                  className='w-16 h-16 rounded-full object-cover'
                />
              ) : (
                <PiUserCircleLight
                  size={55}
                  className='bg-[#4567B7] text-white font-bold p-1.5 rounded-full'
                />
              )}
              <div className='flex flex-col'>
                {/* <span className='ms-5'>{handleReduce(userName)}</span> */}
                <span className='ms-5'>{handleReduce(userEmail)}</span>
              </div>
            </div>
          </li>
          <hr />

          {/* Common Menu Items */}
          {commonMenuItems}

          {/* Role-specific Menu Items */}
          {isDoctor
            ? doctorMenuItems
            : isNurse
            ? nurseMemuItems
            : patientMenuItems}

          <hr />
          {/* Logout Section */}
          <li
            className='px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors rounded-b-lg'
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            <div className='flex items-center mt-1'>
              <IoMdLogOut size={25} className='text-black font-bold' />
              <span className='ms-5'>Log out</span>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Dropdown;
