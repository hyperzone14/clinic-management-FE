import React from "react";
import CircleDot from "./CircleDot";

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  {
    label: "Select Service",
    dotPos: "left-[20.5rem]",
    wordPos: "ms-[-3.5rem]",
  },
  { label: "Booking", dotPos: "left-[41.75rem]", wordPos: "ms-[14.5rem]" },
  { label: "Purchase", dotPos: "right-[41.75rem]", wordPos: "ms-[15.75rem]" },
  { label: "Finish", dotPos: "right-[20rem] ", wordPos: "ms-[17.25rem]" },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <>
      <div>
        <div className="flex my-16">
          <div className="w-[1050px] border-2 border-[#d9d9d9] relative"></div>
          {steps.map((step, index) => (
            <div key={index}>
              <CircleDot
                className={`-mt-3 ${step.dotPos} ${
                  currentStep === index ? "bg-[#6B87C7]" : "bg-[#d9d9d9]"
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex absolute top-[18rem] ">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`font-bold text-xl ${step.wordPos} ${
                currentStep === index ? "text-[#6B87C7]" : "text-[#d9d9d9]"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProgressBar;
