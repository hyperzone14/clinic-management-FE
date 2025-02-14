import React from "react";
import DoctorParallax from "../components/common/DoctorParallax";

const DoctorDetail = () => {
  return (
    <>
      <div>
        <DoctorParallax />
        <div className='flex flex-col my-10 mx-10 justify-center items-center'>
          <h1 className='text-4xl font-bold font-sans mt-5'>OUR DOCTORS</h1>
          <span className='text-[#C0C0C0] text-center text-xl mt-2'>
            Which doctor do you want to dive deeper into?
          </span>
        </div>
      </div>
    </>
  );
};

export default DoctorDetail;
