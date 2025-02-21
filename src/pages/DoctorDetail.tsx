import React from "react";
import DoctorParallax from "../components/common/DoctorParallax";
import SlidingBar from "../components/common/SlidingBar";

const DoctorDetail = () => {
  return (
    <>
      <div className='w-full'>
        <DoctorParallax />
        <div className='flex my-10 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5'>Doctor Profile</h1>
        </div>
        <div className='mb-10 grid-cols-5 grid gap-4'>
          <div className='col-span-1 flex justify-center'>
            <div className='w-[150px] h-[150px] rounded-full overflow-hidden flex justify-center items-center'>
              <img
                src='/assets/images/doctor1.png'
                alt='Dr. John Doe'
                className='w-full h-full object-cover'
              />
            </div>
          </div>
          <div className='col-span-4'>
            <h1 className='text-3xl font-bold font-sans'>Dr. John Doe</h1>
            <div className='flex flex-col mt-2'>
              <p className='text-gray-500 text-xl'>Cardiologist</p>
              <p className='text-gray-500 text-xl'>
                Working days: <b>Monday, Friday</b>
              </p>
              <span className='text-gray-500 text-xl'>
                With 10 years of experience, Dr. John Doe has honed their
                expertise in delivering top-notch patient care and diagnosing
                complex conditions. Dr. John Doe is dedicated to providing
                effective treatment plans and staying updated with the latest
                medical advancements.
              </span>
            </div>
          </div>
        </div>
        <div className='my-20'>
          <h1 className='text-3xl font-bold font-sans text-center'>
            Reviews from patients
          </h1>
          <div className='w-full gap-4 mt-5 flex '>
            <SlidingBar />
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDetail;
