import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  getDoctorById,
  updateDoctor,
} from "../../redux/slices/doctorManageSlice";
import { Button } from "@mui/material";

const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

// Mapping for display
const WEEKDAY_DISPLAY_NAMES: { [key: string]: string } = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

interface Profile {
  id: number;
  fullName: string;
  gender: string;
  birthDate: string | null;
  citizenId: string;
  address: string;
  email: string;
  password: string;
  departmentId: number;
  workingDays: string[];
}

interface DoctorProfileProps {
  id: string;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ id }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { doctors } = useSelector((state: RootState) => state.doctorManage);
  const [formData, setFormData] = useState<Profile>({
    id: 0,
    fullName: "",
    gender: "",
    birthDate: null,
    citizenId: "",
    address: "",
    email: "",
    password: "",
    departmentId: 0,
    workingDays: [],
  });
  const [initData, setInitData] = useState<Profile>(formData);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>(
    {}
  );

  useEffect(() => {
    if (id) {
      dispatch(getDoctorById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    // Update form data when user data is fetched
    if (doctors.length > 0) {
      const doctorData = doctors[0]; // Assuming the first user is the target user
      const formattedDoctorData: Profile = {
        id: doctorData.id || 0,
        fullName: doctorData.fullName || "",
        gender: doctorData.gender || "",
        birthDate: doctorData.birthDate || null,
        citizenId: doctorData.citizenId || "",
        address: doctorData.address || "",
        email: doctorData.email || "",
        password: doctorData.password || "",
        departmentId: doctorData.departmentId || 0,
        workingDays: doctorData.workingDays || [],
      };

      setFormData(formattedDoctorData);
      setInitData(formattedDoctorData);
      setSelectedDate(
        doctorData.birthDate ? new Date(doctorData.birthDate) : null
      );
    }
  }, [doctors]);

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
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.workingDays || formData.workingDays.length === 0) {
      newErrors.workingDays = "At least one working day is required";
    } else if (formData.workingDays.length > 5) {
      newErrors.workingDays = "Cannot select more than 5 working days";
    }

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
      DoB: date ? date.toUTCString() : null,
    }));
    setErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(initData);
    setErrors({});
    setSelectedDate(initData.birthDate ? new Date(initData.birthDate) : null);
    toast.error("Profile editing canceled!");
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) toast.error("Invalid input, please check again");

    const updatedData = {
      ...formData,
      birthDate: formData.birthDate
        ? formData.birthDate.split("/").reverse().join("-")
        : "",
    };

    dispatch(updateDoctor(updatedData));
    setIsEditing(false);
    toast.success("Profile is saved!");
  };

  const handleWorkingDaysChange = (day: string) => {
    setFormData((prev) => {
      const currentWorkingDays = prev.workingDays;

      // If day is already selected, remove it
      if (currentWorkingDays.includes(day)) {
        return {
          ...prev,
          workingDays: currentWorkingDays.filter((d) => d !== day),
        };
      }

      // If day is not selected and we haven't reached max selection, add it
      if (currentWorkingDays.length < 5) {
        return {
          ...prev,
          workingDays: [...currentWorkingDays, day],
        };
      }

      // If max selection reached, do not add new day
      return prev;
    });
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
                    {errors.birthDate && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.birthDate}
                      </span>
                    )}
                  </div>
                </div>
                {[
                  { label: "Citizen ID", name: "citizenId", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Password", name: "password", type: "password" },
                  {
                    label: "Department ID",
                    name: "departmentId",
                    type: "number",
                  },
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
              <div className="col-span-2 mt-5">
                <div className="flex flex-col">
                  <label className="font-bold text-2xl mb-1">
                    Working Days
                  </label>
                  <div className="flex gap-5 mt-1">
                    {WEEKDAYS.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={
                          formData.workingDays.includes(day)
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          isEditing ? handleWorkingDaysChange(day) : null
                        }
                        className="w-full"
                      >
                        {WEEKDAY_DISPLAY_NAMES[day]}
                      </Button>
                    ))}
                  </div>
                  {errors.workingDays && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workingDays}
                    </p>
                  )}
                </div>
              </div>
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

export default DoctorProfile;
