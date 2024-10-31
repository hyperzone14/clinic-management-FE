import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserImage from "../components/common/UserImage";
import { useDispatch } from "react-redux";
import { setProfile } from "../redux/slices/profileSlide";

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
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
  const [initData, setInitData] = useState<PatientProfile>(formData);

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

  const handleEditProfile = () => {
    setIsEditing(true);
    setInitData(formData);
    toast.success("Profile is now editable!");
  };

  const handleSaveProfile = () => {
    dispatch(setProfile(formData));
    setIsEditing(false);
    toast.success("Profile is now saved!");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(initData);
    toast.error("Profile editing canceled!");
  };
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    // Convert Date to string format for Redux
    setFormData((prevData) => ({
      ...prevData,
      DoB: date ? date.toUTCString() : null,
    }));
  };

  useEffect(() => {
    dispatch(
      setProfile({
        name: formData.name,
        gender: formData.gender,
        DoB: formData.DoB,
        citizenId: formData.citizenId,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: formData.email,
        password: formData.password,
      })
    );
  }, [dispatch, formData]);

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Patient Profile</h1>
        </div>

        <div className="flex grid grid-cols-3 gap-4 justify-items-center mb-10">
          <UserImage isEditing={isEditing} />
          <div className="col-span-2 bg-[#fff] rounded-lg shadow-lg w-full">
            <div className="my-5">
              <h1 className="text-3xl font-bold text-center">Profile</h1>
              <div className="mt-3">
                <form className="m-8">
                  <fieldset
                    disabled={!isEditing}
                    className="grid grid-cols-2 gap-x-8 gap-y-5"
                  >
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
                        <label className="font-bold text-2xl mb-1">
                          Gender
                        </label>
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
                        <label className="font-bold text-2xl mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                          placeholder="Enter your Address..."

                          required
                        />
                      </div>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
            <div className="mt-5 mb-5 flex justify-end">
              {!isEditing ? (
                <button
                  className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out me-8"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex justtify-between items-center">
                  <button
                    className="bg-[#34a85a] hover:bg-[#309C54] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out me-8"
                    onClick={handleSaveProfile}
                  >
                    Save
                  </button>
                  <button
                    className="bg-[#D84846] hover:bg-[#D43835] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out me-8"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
