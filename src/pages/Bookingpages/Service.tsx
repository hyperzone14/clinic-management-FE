import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor, FaNotesMedical } from "react-icons/fa6";
import Title from "../../components/common/Title";
import { IoSearchOutline } from "react-icons/io5";
import { BsGenderAmbiguous } from "react-icons/bs";
// import { doctorInfo, specialtiesInfo } from "../../utils/Information";
import InformationList from "../../components/common/InformationList";
import { useDispatch, useSelector } from "react-redux";
import { resetInfoList, setInfoList } from "../../redux/slices/infoListSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchDepartments } from "../../redux/slices/departmentSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { set } from "react-datepicker/dist/date_utils";
// import { fetchDepartments } from "../../redux/slices/departmentSlice";

interface DoctorInfo {
  id: number;
  fullName: string;
  citizenId: number;
  email: string;
  gender: string;
  address: string;
  birthDate: string;
  role: string;
  status: string;
  departmentId: number;
  workingDays: string[];
}

interface Department {
  id: number;
  name: string;
  doctors: DoctorInfo[];
}

interface DoctorWithDepartment {
  doctor: DoctorInfo;
  department: Department;
}

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const ServiceOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <div
    className="cursor-pointer flex flex-col justify-center items-center"
    aria-label={label}
    onClick={onClick}
  >
    <div className="w-24 h-24">{icon}</div>
    <span className="mt-5 font-bold text-3xl">{label}</span>
  </div>
);

const SearchBar: React.FC<{
  onChange: (value: string) => void;
}> = ({ onChange }) => (
  <div className="flex items-center justify-center">
    <div className="mb-6 w-9/12">
      <div className="flex items-center bg-[#D9D9D9] rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
        <IoSearchOutline className="ml-3 text-[#808080]" size={20} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-[#808080]"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

const DoctorCard: React.FC<{
  doctor: DoctorWithDepartment;
  onClick: (doctorId: number, doctorName: string) => void;
  handleWorkingDaysChange: (workingDays: string[]) => void;
}> = ({ doctor, onClick, handleWorkingDaysChange }) => {
  const handleClick = () => {
    handleWorkingDaysChange(doctor.doctor.workingDays);
    onClick(doctor.doctor.id, doctor.doctor.fullName);
  };

  return (
    <div
      className="bg-[#fff] w-full h-fit rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <img
        src="https://via.placeholder.com/150"
        alt="no image"
        className="rounded-l-lg"
      />
      <div className="ms-5 mt-3">
        <h1 className="font-bold text-3xl">{doctor.doctor.fullName}</h1>
        <div className="mb-3 mt-5">
          <div className="flex my-3">
            <BsGenderAmbiguous className="w-8 h-8" />
            <p className="ms-5 text-2xl">{doctor.doctor.gender}</p>
          </div>
          <div className="flex my-3">
            <FaUserDoctor className="w-8 h-8" />
            <p className="ms-5 text-2xl">{doctor.department.name}</p>
          </div>
          <div className="flex my-3">
            <FaRegCalendarAlt className="w-8 h-8" />
            <p className="ms-5 text-2xl">
              {doctor.doctor.workingDays.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentCard: React.FC<{
  department: Department;
  onClick: (departmentId: number, departmentName: string) => void;
}> = ({ department, onClick }) => (
  <div
    className="bg-[#fff] w-full h-fit rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onClick(department.id, department.name)}
  >
    <img
      src="https://via.placeholder.com/150"
      alt="no image"
      className="rounded-l-lg"
    />
    <div className="ms-5 mt-3">
      <h1 className="font-bold text-3xl">{department.name}</h1>
      <div className="mb-3 mt-5">
        <div className="flex my-3">
          <FaNotesMedical className="w-12 h-12" />
          <p className="ms-5 text-lg">
            Expert Care for Every Body Part: From Heartbeats to Healing Hands
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Service: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const departments = useSelector(
    (state: RootState) => state.department.departments || []
  );
  const [workingDays, setWorkingDays] = React.useState<string[]>([]);
  const [serviceType, setServiceType] = React.useState<string>("");
  const [type, setType] = React.useState<string>("");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { goToNextStep } = useOutletContext<BookingStepProps>();

  useEffect(() => {
    dispatch(resetInfoList());
  }, []);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const doctorsWithDepartments: DoctorWithDepartment[] = departments.flatMap(
    (dept) =>
      dept.doctors.map((doctor) => ({
        doctor,
        department: dept,
      }))
  );

  const filterByDoctors = doctorsWithDepartments.filter((item) =>
    item.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterByDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWorkingDaysChange = (
    days: string[]
  ): string[] | null | undefined => {
    const dayMapping: { [key: string]: string } = {
      MONDAY: "1",
      TUESDAY: "2",
      WEDNESDAY: "3",
      THURSDAY: "4",
      FRIDAY: "5",
    };

    if (serviceType === "By doctor" && days.length > 0) {
      return days.map((day) => dayMapping[day.trim().toUpperCase()]);
    } else {
      return [];
    }
  };

  const handleServiceTypeSelect = (newServiceType: string) => {
    setServiceType(newServiceType);
    setType("");
    setWorkingDays([]);
    // Reset the info list when changing service type
    dispatch(
      setInfoList({
        service: newServiceType,
        type: "",
        workingDays: null,
        doctorId: null,
        departmentId: null,
      })
    );
  };

  const handleDoctorSelect = (doctorId: number, doctorName: string) => {
    const doctor = doctorsWithDepartments.find((d) => d.doctor.id === doctorId);
    if (doctor) {
      const newWorkingDays = handleWorkingDaysChange(doctor.doctor.workingDays);
      setType(doctorName);
      dispatch(
        setInfoList({
          service: serviceType,
          type: doctorName,
          workingDays: newWorkingDays, // Use the newly converted working days
          doctorId: doctorId,
          departmentId: null,
        })
      );
    }
  };

  const handleDepartmentSelect = (
    departmentId: number,
    departmentName: string
  ) => {
    setType(departmentName);
    setWorkingDays([]); // Reset working days when selecting department
    dispatch(
      setInfoList({
        service: serviceType,
        type: departmentName,
        workingDays: null, // Ensure working days is null for department selection
        departmentId: departmentId,
        doctorId: null,
      })
    );
  };

  const noResultsFound =
    (serviceType === "By doctor" && filterByDoctors.length === 0) ||
    (serviceType !== "By doctor" && filterByDepartments.length === 0);

  const handleNext = () => {
    if (serviceType && type) {
      goToNextStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please select the service type and make a selection");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={0} />
        </div>
        <div className="mt-24 grid grid-cols-3">
          <div className="col-span-2">
            <div>
              <Title id={1} />
              <div className="m-20 flex md:flex-row gap-28 justify-center">
                <ServiceOption
                  icon={<FaRegCalendarAlt className="w-full h-full" />}
                  label="Book by date"
                  onClick={() => handleServiceTypeSelect("By date")}
                />
                <ServiceOption
                  icon={<FaUserDoctor className="w-full h-full" />}
                  label="Book by doctor"
                  onClick={() => handleServiceTypeSelect("By doctor")}
                />
              </div>
            </div>
            {serviceType && (
              <div>
                <Title id={serviceType === "By doctor" ? 2 : 7} />
                <div className="my-12">
                  <SearchBar onChange={setSearchTerm} />
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="w-9/12 space-y-4 max-h-[80vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                      {noResultsFound ? (
                        <p className="text-xl text-gray-500 text-center">
                          No results found
                        </p>
                      ) : serviceType === "By doctor" ? (
                        filterByDoctors.map((doctorWithDept) => (
                          <DoctorCard
                            key={doctorWithDept.doctor.id}
                            doctor={doctorWithDept}
                            onClick={handleDoctorSelect}
                            handleWorkingDaysChange={handleWorkingDaysChange}
                          />
                        ))
                      ) : (
                        filterByDepartments.map((department) => (
                          <DepartmentCard
                            key={department.id}
                            department={department}
                            onClick={handleDepartmentSelect}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="my-12 flex justify-center items-center gap-3">
              <button
                className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
          <div className="col-span-1 mb-10">
            <InformationList />
          </div>
        </div>
      </div>
    </>
  );
};

export default Service;
