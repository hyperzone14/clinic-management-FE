import React from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { PiUserCircleLight } from "react-icons/pi";

const AdminSideBar = () => {
  return (
    <>
      <div className="w-1/5 bg-[#87ceeb]">
        <div className="mt-10">
          <img
            src="/assets/images/medpal.png"
            alt="MedPal"
            className="w-40 mx-5"
          />
          <div className="mt-16">
            <div className="flex items-center hover:text-[#4567B7] transition duration-300 ease-in-out cursor-pointer">
              <LuLayoutDashboard className="w-12 h-12 ms-5 text-[#8a8d56]" />
              <h1 className="font-bold font-sans text-3xl ms-6">Dashboard</h1>
            </div>
            <div className="flex items-center hover:text-[#4567B7] transition duration-300 ease-in-out cursor-pointer mt-12">
              <PiUserCircleLight className="w-16 h-16 ms-4 text-[#8a8d56]" />
              <h1 className="font-bold font-sans text-3xl ms-4">
                User management
              </h1>
            </div>
            <div className="flex items-center hover:text-[#4567B7] transition duration-300 ease-in-out cursor-pointer mt-12">
              <LuLayoutDashboard className="w-12 h-12 ms-5 text-[#8a8d56]" />
              <h1 className="font-bold font-sans text-3xl ms-6">Dashboard</h1>
            </div>
            <div className="flex items-center hover:text-[#4567B7] transition duration-300 ease-in-out cursor-pointer mt-12">
              <LuLayoutDashboard className="w-12 h-12 ms-5 text-[#8a8d56]" />
              <h1 className="font-bold font-sans text-3xl ms-6">Dashboard</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
