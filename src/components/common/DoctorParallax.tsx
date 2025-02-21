import React from "react";
import { Parallax } from "react-parallax";

const DoctorParallax = () => {
  return (
    <>
      <div className='min-w-7xl overflow-hidden relative -mx-[11rem]'>
        <Parallax
          bgImage='/assets/images/doctor2.png'
          bgImageAlt='Group of doctors'
          strength={800}
          className='h-[300px] w-screen relative'
          renderLayer={() => (
            <div
              style={{
                position: "absolute",
                background: "linear-gradient(to bottom, #A8DBF0c0, #87ceebc0)0",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        >
          <div className='absolute ps-[10.75rem] pt-28 justify-center w-full'>
            <h1 className='text-5xl font-bold text-[#333333] '>
              Meet Dr. John Doe
            </h1>
            <div className='mt-3'>
              <span className='text-xl text-[#708090] font-bold'>
                Compassionate care for your health and wellness
              </span>
            </div>
          </div>
        </Parallax>
      </div>
    </>
  );
};

export default DoctorParallax;
