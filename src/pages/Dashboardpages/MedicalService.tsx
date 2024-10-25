import React from "react";
import { useOutletContext } from "react-router-dom";
import StatusCircle from '../../components/common/StatusCircle';
import { sampleScheduleData } from '../../utils/scheduleData';


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

        <div className="space-y-4">
          {sampleScheduleData.appointments.map((appointment, index) => (
            <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
              <img
                src={appointment.patientImage}
                alt={appointment.patientName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{appointment.patientName}</h3>
                <p className="text-sm text-gray-500">
                  <span className="inline-block mr-2">{appointment.gender}</span>
                  <span>{appointment.appointmentType}</span>
                </p>
              </div>
              <StatusCircle status={appointment.status} />
            </div>
          ))}
        </div>
        <button onClick={goToPreviousStep}>Previous</button>
        <button onClick={goToNextStep}>Next</button>
      </div>
    </>
  );
};

export default MedicalService;
