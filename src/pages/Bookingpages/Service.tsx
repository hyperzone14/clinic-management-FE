import React from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/common/ProgressBar";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const Service: React.FC = () => {
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">BOOKING CENTER</h1>
          <ProgressBar currentStep={0} />
        </div>
        <div className="mt-32">safjdghtkdsh</div>

        {/* Your component content here */}
        <button onClick={goToPreviousStep}>Previous</button>
        <button onClick={goToNextStep}>Next</button>
      </div>
    </>
  );
};

export default Service;
