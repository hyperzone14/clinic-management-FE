import React from "react";
import { useOutletContext } from "react-router-dom";

interface BookingStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const ChooseDateTime: React.FC = () => {
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<BookingStepProps>();

  return (
    <div>
      <h2>Choose Service</h2>
      {/* Your component content here */}
      <button onClick={goToPreviousStep}>Previous</button>
      <button onClick={goToNextStep}>Next</button>
    </div>
  );
};

export default ChooseDateTime;
