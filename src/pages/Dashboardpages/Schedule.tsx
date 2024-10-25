import React from 'react';
import { useOutletContext } from "react-router-dom";
import StatusCircle from '../../components/common/StatusCircle';
import Title from '../../components/common/Title';
import { sampleScheduleData } from '../../utils/scheduleData';

interface DashboardStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const Schedule: React.FC = () => {
  const { goToNextStep, goToPreviousStep } =
    useOutletContext<DashboardStepProps>();

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Schedule</h1>
          <div className="mb-4">
          <p className="text-gray-600 text-3xl">
            {sampleScheduleData.currentDoctor}'s today schedule
          </p>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {sampleScheduleData.appointments.map((appointment, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-6">
                <img
                  src={appointment.patientImage}
                  alt={appointment.patientName}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/150'; // Fallback image
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {appointment.patientName}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{appointment.gender}</p>
                    <p>{appointment.appointmentType}</p>
                  </div>
                </div>
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

export default Schedule;
