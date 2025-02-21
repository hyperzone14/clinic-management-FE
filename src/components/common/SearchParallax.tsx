import React from "react";
import { Parallax } from "react-parallax";

const SearchParallax = () => {
  return (
    <>
      <div className='min-w-7xl overflow-hidden relative -mx-[11rem]'>
        <Parallax
          bgImage='/assets/images/Group_doctor.png'
          bgImageAlt='Group of doctors'
          strength={800}
          className='h-[300px] w-screen relative'
          renderLayer={() => (
            <div
              style={{
                position: "absolute",
                background: "linear-gradient(to bottom, #A8DBF0c0, #87ceebc0)",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        >
          <div className='absolute text-center pt-28 justify-center w-full'>
            <h1 className='text-5xl font-bold text-[#333333] '>
              Meet Your Medical Marvels
            </h1>
            <div className='mt-3'>
              <span className='text-xl text-[#708090] font-bold'>
                Connecting You with Experts Who Care
              </span>
            </div>
          </div>
        </Parallax>
      </div>
    </>
  );
};

export default SearchParallax;
