import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserDoctor, FaNotesMedical } from "react-icons/fa6";
import Title from "../../components/common/Title";
import { IoSearchOutline } from "react-icons/io5";
import { BsGenderAmbiguous } from "react-icons/bs";
import { doctorInfo, specialtiesInfo } from "../../utils/Information";
import InformationList from "../../components/common/InformationList";
import { useDispatch } from "react-redux";
import { setInfoList } from "../../redux/slices/infoListSlide";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

interface DoctorInfo {
  id: number;
  name: string;
  gender: string;
  schedule: string;
  specialty: string;
  image: string;
}

interface SpecialtyInfo {
  id: number;
  name: string;
  description: string;
  image: string;
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
  doctor: DoctorInfo;
  onClick: () => void;
}> = ({ doctor, onClick }) => (
  <div
    key={doctor.id}
    className="bg-[#fff] w-full h-fit rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <img src={doctor.image} alt={doctor.name} className="rounded-l-lg" />
    <div className="ms-5 mt-3">
      <h1 className="font-bold text-3xl">{doctor.name}</h1>
      <div className="mb-3 mt-5">
        <div className="flex my-3">
          <BsGenderAmbiguous className="w-8 h-8" />
          <p className="ms-5 text-2xl">{doctor.gender}</p>
        </div>
        <div className="flex my-3">
          <FaUserDoctor className="w-8 h-8" />
          <p className="ms-5 text-2xl">{doctor.specialty}</p>
        </div>
        <div className="flex my-3">
          <FaRegCalendarAlt className="w-8 h-8" />
          <p className="ms-5 text-2xl">{doctor.schedule}</p>
        </div>
      </div>
    </div>
  </div>
);

const SpecialtyCard: React.FC<{
  specialty: SpecialtyInfo;
  onClick: () => void;
}> = ({ specialty, onClick }) => (
  <div
    key={specialty.id}
    className="bg-[#fff] w-full h-fit rounded-lg flex shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <img src={specialty.image} alt={specialty.name} className="rounded-l-lg" />
    <div className="ms-5 mt-3">
      <h1 className="font-bold text-3xl">{specialty.name}</h1>
      <div className="mb-3 mt-5">
        <div className="flex my-3">
          <FaNotesMedical className="w-12 h-12" />
          <p className="ms-5 text-lg">{specialty.description}</p>
        </div>
      </div>
    </div>
  </div>
);

const Service: React.FC = () => {
  const dispatch = useDispatch();
  const [serviceType, setServiceType] = React.useState<string>("");
  const [type, setType] = React.useState<string>("");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { goToNextStep } = useOutletContext<BookingStepProps>();

  const filterByDoctors = doctorInfo.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterBySpecialties = specialtiesInfo.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noResultsFound =
    (serviceType === "By doctor" && filterByDoctors.length === 0) ||
    (serviceType !== "By doctor" && filterBySpecialties.length === 0);

  useEffect(() => {
    dispatch(
      setInfoList({
        service: serviceType,
        type: type,
      })
    );
  }, [dispatch, serviceType, type]);

  const handleNext = () => {
    if (serviceType && type) {
      goToNextStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("Please select the service type that you want to book");
    }
  };

  return (
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
                onClick={() => {
                  setServiceType("By date");
                  setType("");
                }}
              />
              <ServiceOption
                icon={<FaUserDoctor className="w-full h-full" />}
                label="Book by doctor"
                onClick={() => {
                  setServiceType("By doctor");
                  setType("");
                }}
              />
            </div>
          </div>
          <div>
            <Title id={serviceType === "By doctor" ? 2 : 7} />
            <div className="my-20">
              <SearchBar onChange={setSearchTerm} />
              <div className="flex flex-col items-center justify-center w-full">
                <div className="w-9/12 space-y-4 max-h-[80vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                  {noResultsFound ? (
                    <p className="text-xl text-gray-500 text-center">
                      No results found
                    </p>
                  ) : serviceType === "By doctor" ? (
                    filterByDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onClick={() => setType(doctor.name)}
                      />
                    ))
                  ) : (
                    filterBySpecialties.map((specialty) => (
                      <SpecialtyCard
                        key={specialty.id}
                        specialty={specialty}
                        onClick={() => setType(specialty.name)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 mb-20 flex justify-center items-center gap-3">
            <button
              className="bg-[#4567b7] hover:bg-[#3E5CA3] text-white px-5 py-3 rounded-lg transition duration-300 ease-in-out"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
        <div className="col-span-1">
          <InformationList />
        </div>
      </div>
    </div>
  );
};

export default Service;
