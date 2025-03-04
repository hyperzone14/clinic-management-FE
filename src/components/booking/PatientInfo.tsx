import React from "react";
import Title from "../common/Title";
import DatePicker from "react-datepicker";
// import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import {
  addUserAsync,
  retrieveLatestPatientId,
} from "../../redux/slices/userManageSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import InformationList from "../common/InformationList";

interface patientInfoProps {
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  birthDate: string;
}

const PatientInfo = () => {
  const dispatch = useAppDispatch();
  //   const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [patientId, setPatientId] = React.useState<string | null>(null);
  // const { error } = useSelector((state: RootState) => state.userManage);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof patientInfoProps, string>>
  >({});
  const [formData, setFormData] = React.useState<patientInfoProps>({
    fullName: "",
    citizenId: "",
    email: "",
    password: "",
    gender: "",
    address: "",
    birthDate: "",
  });

  const formatDateForBackend = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof patientInfoProps, string>> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters long";
    }

    // Validate citizen ID
    if (!formData.citizenId.trim()) {
      newErrors.citizenId = "Citizen ID is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    // Validate birth date
    if (!selectedDate) {
      newErrors.birthDate = "Date of birth is required";
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    if (!/^\d{10}$/.test(formData.citizenId)) {
      newErrors.citizenId = "Citizen ID must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userData = {
        ...formData,
        birthDate: formData.birthDate
          ? formData.birthDate.split("/").reverse().join("-")
          : "",
      };

      const result = await dispatch(addUserAsync(userData));

      // Check if there's an error in the result
      if (addUserAsync.rejected.match(result)) {
        // Access the payload returned by rejectWithValue
        const errorPayload = result.payload as {
          message: string;
          email: string;
        };

        if (
          errorPayload.message?.includes("Duplicate entry") &&
          errorPayload.message?.includes("email")
        ) {
          toast.error(
            `Email ${errorPayload.email} has already been registered, please choose another email.`
          );
        } else {
          // Generic system error message
          toast.error(
            "Something wrong is happening with the system, please try again later"
          );
        }
      } else {
        const latestPatientId = await dispatch(retrieveLatestPatientId());
        if (retrieveLatestPatientId.fulfilled.match(latestPatientId)) {
          setPatientId(latestPatientId.payload?.toString() || null);
          toast.success("Profile is saved!");
        }
      }
    } catch (err) {
      // Handle any other errors that may occur
      toast.error(
        (err as Error).message || "An error occurred while saving the profile."
      );
    }
  };

  return (
    <>
      <ToastContainer />
      <div className='my-12 mx-16'>
        <Title id={8} />
        <div className='mt-6 grid grid-cols-3 gap-x-4'>
          <div className='col-span-2 bg-gray-50 rounded-lg shadow-lg w-full h-fit'>
            <div className='my-5'>
              <h1 className='text-3xl font-bold text-center'>Profile</h1>
              <div className='mt-3'>
                <form className='m-8' onSubmit={handleSubmit}>
                  <fieldset className='grid grid-cols-2 gap-x-8 gap-y-5'>
                    <div className=' col-span-1'>
                      <div className='flex flex-col'>
                        <label className='font-bold text-2xl mb-1'>Name</label>
                        <input
                          type='text'
                          id='name'
                          name='fullName'
                          value={formData.fullName}
                          onChange={handleChange}
                          className='w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2'
                          placeholder='Enter your name...'
                          required
                        />
                        {errors.fullName && (
                          <span className='text-red-500 text-sm'>
                            {errors.fullName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className=' col-span-1'>
                      <div className='flex flex-col'>
                        <label className='font-bold text-2xl mb-1'>
                          Gender
                        </label>
                        <div className='flex gap-5 mt-1'>
                          <label className='flex items-center text-2xl'>
                            <input
                              type='radio'
                              name='gender'
                              value='MALE'
                              checked={formData.gender === "MALE"}
                              onChange={handleChange}
                              className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            />
                            MALE
                          </label>

                          <label className='flex items-center text-2xl'>
                            <input
                              type='radio'
                              name='gender'
                              value='FEMALE'
                              checked={formData.gender === "FEMALE"}
                              onChange={handleChange}
                              className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            />
                            FEMALE
                          </label>

                          <label className='flex items-center text-2xl'>
                            <input
                              type='radio'
                              name='gender'
                              value='OTHER'
                              checked={formData.gender === "OTHER"}
                              onChange={handleChange}
                              className='mr-2 cursor-pointer w-[1.5rem] h-[1.5rem]'
                            />
                            OTHER
                          </label>
                        </div>
                        {errors.gender && (
                          <span className='text-red-500 text-sm'>
                            {errors.gender}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='col-span-1'>
                      <div className='flex flex-col'>
                        <label className='font-bold text-2xl mb-1'>
                          Date of birth
                        </label>
                        <DatePicker
                          id='DoB'
                          name='DoB'
                          selected={selectedDate}
                          onChange={handleDateChange}
                          dateFormat='dd/MM/yyyy'
                          className='w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2'
                          placeholderText='DD/MM/YYYY'
                          isClearable
                          required
                        />
                        {errors.birthDate && (
                          <span className='text-red-500 text-sm'>
                            {errors.birthDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {[
                      { label: "Citizen ID", name: "citizenId" },
                      { label: "Email", name: "email", type: "email" },
                      { label: "Password", name: "password", type: "password" },
                    ].map((field) => (
                      <div key={field.name} className='col-span-1'>
                        <div className='flex flex-col'>
                          <label className='font-bold text-2xl mb-1'>
                            {field.label}
                          </label>
                          <input
                            type={field.type || "text"}
                            name={field.name}
                            value={
                              formData[
                                field.name as keyof patientInfoProps
                              ] as string
                            }
                            onChange={handleChange}
                            className='w-full h-10 bg-[#d9d9d9] rounded-md p-2'
                            placeholder={`Enter your ${field.label.toLowerCase()}...`}
                            required
                          />
                        </div>
                        {errors[field.name as keyof patientInfoProps] && (
                          <span className='text-red-500 text-sm'>
                            {errors[field.name as keyof patientInfoProps]}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className='col-span-2'>
                      <div className='flex flex-col'>
                        <label className='font-bold text-2xl mb-1'>
                          Address
                        </label>
                        <input
                          type='text'
                          id='address'
                          name='address'
                          value={formData.address}
                          onChange={handleChange}
                          className='w-full h-[2.5rem] bg-[#d9d9d9] rounded-md p-2'
                          placeholder='Enter your Address...'
                          required
                        />
                        {errors.address && (
                          <span className='text-red-500 text-sm'>
                            {errors.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  <div className='mt-10 flex justify-center'>
                    <button
                      className='bg-[#34a85a] hover:bg-[#309C54] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out'
                      type='submit'
                    >
                      Save Information
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className='col-span-1 mb-10'>
            <InformationList patientId={patientId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientInfo;
