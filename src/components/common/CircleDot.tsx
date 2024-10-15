import React from "react";

interface CircleDotProp {
  className?: string;
}

const CircleDot: React.FC<CircleDotProp> = ({ className = "" }) => {
  return (
    <div
      className={`absolute w-[30px] h-[30px] bg-[#4567b7] rounded-full ${className}`}
    ></div>
  );
};

export default CircleDot;
