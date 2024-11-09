import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import Title from "../../components/common/Title";
import InformationList from "../../components/common/InformationList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setInfoList } from "../../redux/slices/infoListSlice";
import { useDispatch } from "react-redux";
// import { RootState } from "../../redux/store";
import { setBooking } from "../../redux/slices/bookingSlice";
// import { formatDate } from "react-datepicker/dist/date_utils";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

interface PatientInfo {
  name: string;
  gender: string;
  DoB: string | null;
  citizenId: string;
  phoneNumber: string;
  address: string;
}

const BookInfo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const dispatch = useDispatch();
  // const bookingInfo = useSelector((state: RootState) => state.bookingInfo);
  const price = "95000";
  const [formData, setFormData] = useState<PatientInfo>({
    name: "",
    gender: "",
    DoB: null,
    citizenId: "",
    phoneNumber: "",
    address: "",
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

  const checkAvailability = () => {
    if (
      formData.name === "" ||
      !formData.name.trim() ||
      formData.gender === "" ||
      !formData.gender ||
      formData.DoB === null ||
      formData.citizenId === "" ||
      !formData.citizenId.trim() ||
      formData.phoneNumber === "" ||
      !formData.phoneNumber.trim() ||
      formData.address === ""
    ) {
      return false;
    }
  };

  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  useEffect(() => {
    dispatch(
      setInfoList({
        name: formData.name,
        price: "95000",
      })
    );
  }, [dispatch, formData.name, price]);

  dispatch(
    setBooking({
      patientName: formData.name.trim(),
      patientGender: formData.gender,
      patientDoB: formData.DoB,
      patientCitizenId: formData.citizenId.trim(),
      patientPhoneNumber: formData.phoneNumber.trim(),
      patientAddress: formData.address.trim(),
    })
  );

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={1} />
        </div>

        <div className="mt-24 grid grid-cols-3">
          <div className="col-span-2">
            <div>
              <Title id={4} />
              <form className="mt-8 mx-8">
                <div className="gap-14 flex">
                  <div className="flex flex-col">
                    <label className="font-bold text-2xl mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-[39.5rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your name..."
                      required
                    />
                  </div>
                </div>
                <div className="gap-14 flex">
                  <div className="flex flex-col mt-6">
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
                  <div className="flex flex-col mt-6">
                    <label className="font-bold text-2xl mb-1">
                      Date of birth
                    </label>
                    <DatePicker
                      id="DoB"
                      name="DoB"
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      className="w-[15rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholderText="DD/MM/YYYY"
                      isClearable
                      required
                    />
                  </div>
                </div>
                <div className="gap-14 flex mt-6">
                  <div className="flex flex-col">
                    <label className="font-bold text-2xl mb-1">
                      Citizen ID
                    </label>
                    <input
                      type="text"
                      id="citizenId"
                      name="citizenId"
                      value={formData.citizenId}
                      onChange={handleChange}
                      className="w-[16rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your Citizen ID..."
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold text-2xl mb-1">
                      Phone number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-[20rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your Phone number..."
                      required
                    />
                  </div>
                </div>
                <div className="gap-14 flex mt-6">
                  <div className="flex flex-col">
                    <label className="font-bold text-2xl mb-1">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-[39.5rem] h-[2.5rem] bg-[#d9d9d9] rounded-md p-2"
                      placeholder="Enter your address..."
                      required
                    />
                  </div>
                </div>
              </form>
              <div className="mt-16 mb-20 flex justify-center items-center gap-3">
                <button
                  className="bg-[#34a85a] hover:bg-[#2e8b57] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                  onClick={() => {
                    if (checkAvailability() === false) {
                      alert("Please fill in the form first!");
                    } else {
                      goToPreviousStep();
                    }
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  Previous
                </button>
                <button
                  className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                  onClick={() => {
                    if (checkAvailability() === false)
                      alert("Please fill in the form first!");
                    else goToNextStep();
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <InformationList />
          </div>
        </div>
      </div>
    </>
  );
};

export default BookInfo;
