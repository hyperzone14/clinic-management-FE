import React from "react";
import CircleDot from "./CircleDot";

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  {
    label: "Select Service",
    dotPos: "md:left-[5rem] lg:left-[16.75rem] xl:left-[20rem]",
    wordPos: "xl:ms-[-4.25rem] lg:ms-[-4.25rem] md:ms-[-3.75rem]",
  },
  {
    label: "Pick Date & Time",
    dotPos: "xl:left-[41.5rem] lg:left-[34.5rem] md:left-[40.5rem]",
    wordPos: "lg:ms-[10rem] md:ms-[6.75rem]",
  },
  {
    label: "Purchase",
    dotPos: "xl:right-[41.5rem] lg:right-[34.25rem] md:right-[40.5rem]",
    wordPos: "ms-[11rem]",
  },
  {
    label: "Finish",
    dotPos: "xl:right-[19.75rem] lg:right-[16.75rem] md:right-[5rem]",
    wordPos: "xl:ms-[16.25rem] lg:ms-[6.75rem] md:ms-[12rem]",
  },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <>
      <div className="z-[-10]">
        <div className="flex my-16">
          <div className="xl:w-[1050px] lg:w-[900px] md:w-[850px] border-2 border-[#d9d9d9] relative"></div>
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
              className={`font-bold lg:text-2xl md:text-xl md:text-center ${
                step.wordPos
              } ${currentStep === index ? "text-[#6B87C7]" : "text-[#d9d9d9]"}`}
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
