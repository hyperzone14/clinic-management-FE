import React from "react";
import { PiUserCircleLight } from "react-icons/pi";

const Profile = () => {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Patient Profile</h1>
        </div>

        <div className="flex grid grid-cols-3 gap-4 justify-items-center">
          <div className="col-span-1 bg-[#fff] rounded-lg shadow-lg w-full">
            <div className="flex flex-col justify-center items-center">
              <PiUserCircleLight
                size={100}
                className="bg-[#4567B7] text-white font-bold p-2 rounded-full mt-5 mb-3"
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="text-2xl font-bold">Patient Name</span>
              <span className="text-lg text-[#A9A9A9] font-bold mt-1 mb-3">
                Role
              </span>
            </div>
          </div>
          <div className="col-span-2 bg-[#fff] rounded-lg shadow-lg w-full">
            <div className="my-3">
              <h1 className="text-3xl font-bold text-center">Profile</h1>
              <div className="mt-3 grid grid-cols-2">
                <form className="mt-8 mx-8">
                  <div className="gap-14 flex col-span-1">
                    <div className="flex flex-col">
                      <label className="font-bold text-2xl mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        //   value={formData.name}
                        //   onChange={handleChange}
                        className="w-[39.5rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                        placeholder="Enter your name..."
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
