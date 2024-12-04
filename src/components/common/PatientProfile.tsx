import React, { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  clearUser,
  getUserById,
  updateUserAsync,
} from "../../redux/slices/userManageSlice";

interface Profile {
  id: number;
  fullName: string;
  gender: string;
  birthDate: string | null;
  citizenId: string;
  address: string;
  email: string;
  password: string;
}

interface PatientProfileProps {
  id: string;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ id }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.userManage);
  const [formData, setFormData] = useState<Profile>({
    id: 0,
    fullName: "",
    gender: "",
    birthDate: null,
    citizenId: "",
    address: "",
    email: "",
    password: "",
  });
  const [initData, setInitData] = useState<Profile>(formData);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>(
    {}
  );

  const fetchUserData = useCallback(() => {
    // Clear previous user data before fetching new data
    dispatch(clearUser());

    if (id) {
      dispatch(getUserById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    // Update form data when user data is fetched
    if (users.length > 0) {
      const userData = users[0]; // Assuming the first user is the target user
      const formattedUserData: Profile = {
        id: userData.id || 0,
        fullName: userData.fullName || "",
        gender: userData.gender || "",
        birthDate: userData.birthDate || null,
        citizenId: userData.citizenId || "",
        address: userData.address || "",
        email: userData.email || "",
        password: userData.password || "",
      };

      setFormData(formattedUserData);
      setInitData(formattedUserData);
      setSelectedDate(userData.birthDate ? new Date(userData.birthDate) : null);
    }
  }, [users]);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Profile, string>> = {};

    if (!formData.fullName) newErrors.fullName = "Name is required";
    if (!formData.citizenId) newErrors.citizenId = "Citizen ID is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.birthDate) newErrors.birthDate = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!/^\d{10}$/.test(formData.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setInitData(formData);
    toast.success("Profile is now editable!");
  };

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
      birthDate: date ? date.toUTCString() : null,
    }));
    setErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedData = {
      ...formData,
      birthDate: formData.birthDate
        ? formData.birthDate.split("/").reverse().join("-")
        : "",
    };

    dispatch(updateUserAsync(updatedData));
    setIsEditing(false);
    toast.success("Profile is saved!");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(initData);
    setErrors({});
    setSelectedDate(initData.birthDate ? new Date(initData.birthDate) : null);
    toast.error("Profile editing canceled!");
  };

  return (
    <>
      <ToastContainer />
      <div className=" bg-[#fff] rounded-lg shadow-lg w-full py-3">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-center">
            Profile Information
          </h1>
          <div className="mt-3">
            <form className="m-8" onSubmit={handleSaveProfile}>
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
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your name..."
                      required
                    />
                    {errors.fullName && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </span>
                    )}
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
                          value="MALE"
                          checked={formData.gender === "MALE"}
                          onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                        />
                        MALE
                      </label>

                      <label className="flex items-center text-2xl">
                        <input
                          type="radio"
                          name="gender"
                          value="FEMALE"
                          checked={formData.gender === "FEMALE"}
                          onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                        />
                        FEMALE
                      </label>

                      <label className="flex items-center text-2xl">
                        <input
                          type="radio"
                          name="gender"
                          value="OTHER"
                          checked={formData.gender === "OTHER"}
                          onChange={handleChange}
                          className="mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]"
                        />
                        OTHER
                      </label>
                    </div>
                    {errors.gender && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.gender}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex flex-col">
                    <label className="font-bold text-2xl mb-1">
                      Date of birth
                    </label>
                    <DatePicker
                      id="birthDate"
                      name="birthDate"
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholderText="DD/MM/YYYY"
                      isClearable
                      required
                    />
                    {errors.birthDate && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.birthDate}
                      </span>
                    )}
                  </div>
                </div>
                {[
                  { label: "Citizen ID", name: "citizenId" },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    disabled: true,
                  },
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
                        value={formData[field.name as keyof Profile] as string}
                        onChange={handleChange}
                        className="w-full h-10 bg-[#d9d9d9] rounded-md p-2"
                        placeholder={`Enter your ${field.label.toLowerCase()}...`}
                        disabled={field.disabled}
                        required
                      />
                      {errors[field.name as keyof Profile] && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof Profile]}
                        </span>
                      )}
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
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your Address..."
                      required
                    />
                  </div>
                </div>
              </fieldset>
              <div className="mt-12 mb-3 flex justify-end">
                {!isEditing ? (
                  <button
                    className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex justtify-between items-center">
                    <button
                      className="bg-[#34a85a] hover:bg-[#309C54] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out me-8"
                      type="submit"
                    >
                      Save
                    </button>
                    <button
                      className="bg-[#D84846] hover:bg-[#D43835] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientProfile;
