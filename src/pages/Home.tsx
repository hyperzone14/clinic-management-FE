import { Specialties } from "../utils/Specialties";
import { GiKidneys, GiStomach, GiWaterDrop, GiNoseSide } from "react-icons/gi";
import {
  FaHeartPulse,
  FaLungs,
  FaBrain,
  FaShieldVirus,
  FaEye,
} from "react-icons/fa6";
import { TbBodyScan } from "react-icons/tb";
import { MdPregnantWoman } from "react-icons/md";
import { PiBoneFill } from "react-icons/pi";
import { IconType } from "react-icons";
import "../styles/mainPage.css";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../utils/security/services/AuthService";
import InfiniteLooper from "../components/common/InfiniteLooper";
// import InfiniteLooper from "../components/common/InfiniteLooper";

const iconComponents: Record<string, IconType> = {
  FaHeartPulse,
  TbBodyScan,
  FaLungs,
  GiStomach,
  GiWaterDrop,
  GiKidneys,
  FaBrain,
  MdPregnantWoman,
  FaShieldVirus,
  FaEye,
  PiBoneFill,
  GiNoseSide,
};

const Home = () => {
  const currentRole = AuthService.getCurrentRole();
  const navigate = useNavigate();
  const renderIcon = (iconName: string): JSX.Element | null => {
    const IconComponent = iconComponents[iconName];
    return IconComponent ? (
      <IconComponent className='text-[#4567b7] w-6 h-6' />
    ) : null;
  };

  const handleClicked = () => {
    navigate("/booking");
  };

  return (
    <div className='w-full'>
      {/* Main Section */}
      <div className='md:-mx-[3rem] lg:-mx-[0rem]'>
        <div className='grid grid-cols-3 md:px-5 lg:px-10 gap-4 items-center my-16 '>
          <div className='py-10 col-span-2'>
            <h1 className='text-6xl font-bold text-[#5C7BC1] tracking-wide'>
              MedPal
            </h1>
            <p className='mt-5 text-4xl font-bold leading-relaxed md:pr-16  lg:pr-52'>
              Your Health, Our Commitment, Every Single Day.
            </p>
            <p className='mt-8 text-md md:pr-16 lg:pr-52 text-[#A9A9A9]'>
              Comprehensive, Trustworthy Healthcare Services at Your Fingertips,
              Anytime, Anywhere, Every Single Day.
            </p>
          </div>
          <div className='col-span-1'>
            <img
              src='/assets/images/mainImage.png'
              alt='Treatment'
              className='w-full h-[500px] object-cover'
            />
          </div>
        </div>

        <div className='my-10 h-fit bg-[#4567b7] -mx-[11rem] text-white px-[11rem]'>
          <div className='py-16 px-10'>
            <h1 className='text-4xl font-bold tracking-wider'>
              Our Specialties
            </h1>
            <div className='relative overflow-hidden pt-8'>
              <div className='flex items-center'>
                <InfiniteLooper speed={20} direction='left'>
                  {Specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className='w-fit flex-shrink-0 border-2 rounded-lg mx-3 '
                      style={{ backgroundColor: "#4567b7" }}
                    >
                      <div className='p-5 flex flex-col items-center'>
                        <div className='w-fit rounded-full border-0 bg-white p-3 '>
                          {renderIcon(specialty.icon)}
                        </div>
                        <div className='mt-5'>
                          <p className='font-bold text-xl'>
                            {specialty.specialty}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </InfiniteLooper>
              </div>
            </div>
          </div>
        </div>

        <div className='my-10 -mx-[3rem] h-fit'>
          <div className='grid grid-cols-2 gap-5 items-center'>
            <div className='flex justify-center'>
              <img
                src='/assets/images/hospital.png'
                alt='Treatment'
                className='w-8/12 rounded-xl'
              />
            </div>
            <div className='px-10'>
              <h1 className='text-4xl font-bold tracking-wider'>
                Our Hospital Facilities
              </h1>
              <p className='mt-5 text-md text-[#A9A9A9]'>
                Our hospital is equipped with the latest technologies and
                facilities to provide the best healthcare services to our
                patients. We have a team of experienced doctors and nurses who
                are dedicated to providing the best care to our patients.
              </p>
              {currentRole !== "ROLE_DOCTOR" && currentRole !== "ROLE_NURSE" ? (
                <button
                  className='mt-5 bg-[#4567b7] text-white py-2 px-5 rounded-md'
                  onClick={() => {
                    handleClicked();
                  }}
                >
                  Book an Appointment
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
