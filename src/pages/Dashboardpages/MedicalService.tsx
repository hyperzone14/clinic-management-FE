import React from "react";
import { useOutletContext } from "react-router-dom";

interface DashboardStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const MedicalService: React.FC = () => {
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<DashboardStepProps>();

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Medical Service</h1>
        </div>

        {/* Your component content here */}
        <button onClick={goToPreviousStep}>Previous</button>
        <button onClick={goToNextStep}>Next</button>
      </div>
    </>
  );
};

export default MedicalService;
