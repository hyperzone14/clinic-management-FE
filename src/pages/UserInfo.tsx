import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState, useAppDispatch } from "../redux/store";
import UserImage from "../components/common/UserImage";
import DatePicker from "react-datepicker";
import { addUserAsync } from "../redux/slices/userManageSlice";
import "react-datepicker/dist/react-datepicker.css";
// import { UserInfo } from "os";

interface userInfoProps {
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const UserInfo = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.signinProfile);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [formData, setFormData] = React.useState<userInfoProps>({
    fullName: userInfo.fullName ? userInfo.fullName : "",
    citizenId: "",
    email: userInfo.email ? userInfo.email : "",
    password: userInfo.password ? userInfo.password : "",
    gender: "",
    address: "",
    birthDate: "",
  });

  const formatDateForBackend = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // const handleDateChange = (date: Date | null) => {
  //   setSelectedDate(date);
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     birthDate: date ? formatDateForBackend(date) : "",
  //   }));
  // };

  const handleDateChange = (date: Date | null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date && date < today) {
      setSelectedDate(date);
      setFormData((prevData) => ({
        ...prevData,
        birthDate: formatDateForBackend(date),
      }));
    } else {
      setSelectedDate(null);
      setFormData((prevData) => ({
        ...prevData,
        birthDate: "", // Clear the birth date
      }));

      // Toast notification for invalid date selection
      toast.error("Please select a valid date");
    }
  };

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters long";
    }

    // Validate citizen ID
    if (!formData.citizenId.trim()) {
      errors.citizenId = "Citizen ID is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    }

    // Validate gender
    if (!formData.gender) {
      errors.gender = "Please select a gender";
    }

    // Validate birth date
    if (!selectedDate) {
      errors.birthDate = "Date of birth is required";
    }

    // Validate address
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    } else if (formData.address.length < 10) {
      errors.address = "Please enter a complete address";
    }

    return errors;
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

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => {
        toast.error(error);
      });
    }

    try {
      const resultPayload = await dispatch(addUserAsync(formData));

      if (resultPayload) {
        toast.success("User information saved successfully");
        navigate("/login");
      } else {
        toast.error("Error saving user information");
      }
    } catch {
      toast.error("An error occurred while saving the profile.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Patient Profile</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 justify-items-center mb-10">
          <UserImage fullName={formData.fullName} />
          <div className="col-span-2 bg-[#fff] rounded-lg shadow-lg w-full">
            <div className="my-5">
              <h1 className="text-3xl font-bold text-center">Profile</h1>
              <div className="mt-3">
                <form className="m-8">
                  <fieldset className="grid grid-cols-2 gap-x-8 gap-y-5">
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
                        {validateForm().fullName && (
                          <span className="text-red-500 text-sm">
                            {validateForm().fullName}
                          </span>
                        )}
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
                        {validateForm().gender && (
                          <span className="text-red-500 text-sm">
                            {validateForm().gender}
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
                        {validateForm().birthDate && (
                          <span className="text-red-500 text-sm">
                            {validateForm().birthDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {[
                      { label: "Citizen ID", name: "citizenId" },
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
                                field.name as keyof userInfoProps
                              ] as string
                            }
                            onChange={handleChange}
                            className="w-full h-10 bg-[#d9d9d9] rounded-md p-2"
                            placeholder={`Enter your ${field.label.toLowerCase()}...`}
                            required
                          />
                        </div>
                        {validateForm()[field.name] && (
                          <span className="text-red-500 text-sm">
                            {validateForm()[field.name]}
                          </span>
                        )}
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
                        {validateForm().address && (
                          <span className="text-red-500 text-sm">
                            {validateForm().address}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
            <div className="mt-5 mb-5 flex justify-end">
              <button
                className="bg-[#34a85a] hover:bg-[#309C54] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out me-8"
                onClick={handleSave}
              >
                Save Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserInfo;
