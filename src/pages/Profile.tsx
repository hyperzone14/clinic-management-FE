import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { PiUserCircleLight } from "react-icons/pi";
import "react-datepicker/dist/react-datepicker.css";

interface PatientProfile {
  name: string;
  gender: string;
  DoB: string | null;
  citizenId: string;
  phoneNumber: string;
  address: string;
  email: string;
  password: string;
}

const Profile = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const dispatch = useDispatch();
  // const bookingInfo = useSelector((state: RootState) => state.bookingInfo);
  // const price = "95000";
  const [formData, setFormData] = useState<PatientProfile>({
    name: "",
    gender: "",
    DoB: null,
    citizenId: "",
    phoneNumber: "",
    address: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newFormData = {
        ...prevData,
        [name]: value,
      };

      return newFormData;
    });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    // Convert Date to string format for Redux
    setFormData((prevData) => ({
      ...prevData,
      DoB: date ? date.toUTCString() : null,
    }));
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Patient Profile</h1>
        </div>

        <div className="flex grid grid-cols-3 gap-4 justify-items-center mb-10">
          <div className="col-span-1 bg-[#fff] rounded-lg shadow-lg w-full h-fit">
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
              <div className="mt-3">
                <form className="m-8 grid grid-cols-2 gap-x-8 gap-y-5">
                  <div className=" col-span-1">
                    <div className="flex flex-col">
                      <label className="font-bold text-2xl mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                        placeholder="Enter your name..."
                        required
                      />
                    </div>
                  </div>
                  <div className=" col-span-1">
                    <div className="flex flex-col">
                      <label className="font-bold text-2xl mb-1">Gender</label>
                      <div className="flex gap-5 mt-1">
                        <label className="flex items-center text-2xl">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender === "Male"}
                            onChange={handleChange}
                            className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          />
                          Male
                        </label>

                        <label className="flex items-center text-2xl">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={formData.gender === "Female"}
                            onChange={handleChange}
                            className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          />
                          Female
                        </label>

                        <label className="flex items-center text-2xl">
                          <input
                            type="radio"
                            name="gender"
                            value="Other"
                            checked={formData.gender === "Other"}
                            onChange={handleChange}
                            className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                          />
                          Other
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="flex flex-col">
                      <label className="font-bold text-2xl mb-1">
                        Date of birth
                      </label>
                      <DatePicker
                        id="DoB"
                        name="DoB"
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        required
                      />
                    </div>
                  </div>
                  {[
                    { label: "Citizen ID", name: "citizenId" },
                    { label: "Phone number", name: "phoneNumber" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Password", name: "password", type: "password" },
                  ].map((field) => (
                    <div key={field.name} className="col-span-1">
                      <div className="flex flex-col">
                        <label className="font-bold text-2xl mb-1">
                          {field.label}
                        </label>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={
                            formData[
                              field.name as keyof PatientProfile
                            ] as string
                          }
                          onChange={handleChange}
                          className="w-full h-10 bg-[#d9d9d9] rounded-md p-2"
                          placeholder={`Enter your ${field.label.toLowerCase()}...`}
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <div className="flex flex-col">
                      <label className="font-bold text-2xl mb-1">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                        placeholder="Enter your Address..."
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="my-10 flex justify-end">
              <button>Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
