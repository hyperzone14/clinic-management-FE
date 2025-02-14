import React from "react";
import { Parallax } from "react-parallax";

const SearchParallax = () => {
  return (
    <>
      <div>
        <Parallax
          // blur={{ min: -15, max: 15 }}
          bgImage='assets\images\Group_doctor.png'
          bgImageAlt='Group of doctors'
          strength={800}
          className='h-[300px] w-full'
          renderLayer={() => (
            <div
              style={{
                position: "absolute",
                background: `#8EEDF7a1`,
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        ></Parallax>
      </div>
    </>
  );
};

export default SearchParallax;
