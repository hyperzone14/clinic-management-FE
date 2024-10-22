import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

interface Route {
  id: number;
  path: string;
  location: string;
}

interface DashboardFlowProps {
  steps: Route[];
}

const Dashboard: React.FC<DashboardFlowProps> = ({ steps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex((step) =>
      currentPath.includes(step.path)
    );
    if (stepIndex !== -1 && stepIndex !== currentStepIndex) {
      // If trying to access a future step, redirect to the current step
      if (stepIndex > currentStepIndex) {
        navigate(steps[currentStepIndex].path);
      } else {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [location, steps, currentStepIndex, navigate]);

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      navigate(steps[currentStepIndex + 1].path);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      navigate(steps[currentStepIndex - 1].path);
    }
  };

  return (
    <div>
      <Outlet context={{ goToNextStep, goToPreviousStep }} />
    </div>
  );
};

export default Dashboard;
