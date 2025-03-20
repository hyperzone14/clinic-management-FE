import React from "react";
import { useNavigate } from "react-router-dom";
import SearchParallax from "../components/common/SearchParallax";
import { IoSearchOutline } from "react-icons/io5";
import { TbFilter } from "react-icons/tb";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./../styles/listingYEffect.css";

const specialty = [
  "All",
  "Cardiologist",
  "Dermatology",
  "Obstetrics and Gynecology",
] as const;

const doctorInfo = [
  {
    id: 1,
    name: "Dr. John Doe",
    specialty: "Cardiologist",
    img: "assets\\images\\doctor1.png",
  },
  {
    id: 2,
    name: "Dr. Watson",
    specialty: "Dermatology",
    img: "assets\\images\\doctor2.png",
  },
  {
    id: 3,
    name: "Dr. Mike",
    specialty: "Obstetrics and Gynecology",
    img: "https://placehold.co/600x400",
  },
];

const Doctors = () => {
  const [checkedChoice, setCheckedChoice] = React.useState<string>("All");
  const navigate = useNavigate();
  const nodeRefs = doctorInfo.reduce((acc, doctor) => {
    acc[doctor.id] = React.createRef<HTMLDivElement>();
    return acc;
  }, {} as Record<number, React.RefObject<HTMLDivElement>>);

  const handleDoctorClick = (doctorId: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <>
      <div className='w-full'>
        <SearchParallax />
        <div className='flex flex-col my-10 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5'>
            Choose Your Doctor
          </h1>
          {/* <span className='text-[#C0C0C0] text-center text-xl mt-2'>
            {checkedChoice
              ? checkedChoice
              : "Which doctor do you want to dive deeper into?"}
          </span> */}
        </div>
        <div className='mb-20 grid  grid-cols-4'>
          <div className='col-span-1'>
            <div className='mt-2 flex'>
              <TbFilter className='mx-3 mt-1' size={25} />
              <p className='text-2xl font-bold'>Filter</p>
            </div>
            <hr className='mr-12 my-3' />
            <FormGroup className='ms-3'>
              {specialty.map((specialty) => (
                <FormControlLabel
                  key={specialty}
                  control={
                    <Checkbox
                      checked={checkedChoice === specialty}
                      onChange={() => setCheckedChoice(specialty)}
                    />
                  }
                  label={
                    <span className='text-lg hover:font-bold transition duration-600'>
                      {specialty}
                    </span>
                  }
                />
              ))}
            </FormGroup>
          </div>
          <div className='col-span-3'>
            <div className='flex items-center bg-[#fff] rounded-md focus-within:ring-2 focus-within:ring-blue-500 mb-5 h-[3rem]'>
              <IoSearchOutline className='ml-3 text-[#808080] ' size={20} />
              <input
                type='text'
                placeholder='Search...'
                className='w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-[#808080] text-lg'
              />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <TransitionGroup component={null}>
                {checkedChoice === "All"
                  ? doctorInfo.map((doctor) => (
                      <CSSTransition
                        key={doctor.id}
                        timeout={500}
                        nodeRef={nodeRefs[doctor.id]}
                        classNames='fade-slide'
                      >
                        <div
                          ref={nodeRefs[doctor.id]}
                          className='col-span-1 bg-[#fff] rounded-md hover:shadow-md transition-shadow duration-300 cursor-pointer'
                          onClick={() => handleDoctorClick(doctor.id)}
                        >
                          <img
                            src={doctor.img}
                            alt='doctor1'
                            className='w-full h-[200px] object-cover rounded-t-md'
                          />
                          <div className='p-3'>
                            <h1 className='text-xl font-bold'>{doctor.name}</h1>
                            <span className='text-[#808080]'>
                              {doctor.specialty}
                            </span>
                          </div>
                        </div>
                      </CSSTransition>
                    ))
                  : doctorInfo
                      .filter((doctor) => doctor.specialty === checkedChoice)
                      .map((doctor) => (
                        <CSSTransition
                          key={doctor.id}
                          timeout={500}
                          nodeRef={nodeRefs[doctor.id]}
                          classNames='fade-slide'
                        >
                          <div
                            ref={nodeRefs[doctor.id]}
                            className='col-span-1 bg-[#fff] rounded-md hover:shadow-md transition-shadow duration-300 cursor-pointer'
                            onClick={() => handleDoctorClick(doctor.id)}
                          >
                            <img
                              src={doctor.img}
                              alt='doctor1'
                              className='w-full h-[200px] object-cover rounded-t-md'
                            />
                            <div className='p-3'>
                              <h1 className='text-xl font-bold'>
                                {doctor.name}
                              </h1>
                              <span className='text-[#808080]'>
                                {doctor.specialty}
                              </span>
                            </div>
                          </div>
                        </CSSTransition>
                      ))}
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctors;
