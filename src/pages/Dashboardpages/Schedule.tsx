import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext } from "react-router-dom";
import StatusCircle from '../../components/common/StatusCircle';
import Title from '../../components/common/Title';
import { RootState } from '../../redux/store';
import { updateAppointmentStatus, StatusType } from '../../redux/slices/scheduleSlice';

interface DashboardStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const Schedule: React.FC = () => {
  const dispatch = useDispatch();
  // const { goToNextStep, goToPreviousStep } =
  //   useOutletContext<DashboardStepProps>();
  const { currentDoctor, appointments } = useSelector((state: RootState) => state.schedule);

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    dispatch(updateAppointmentStatus({ index, newStatus }));
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Schedule</h1>
          <div className="mb-4">
          <p className="text-gray-600 text-lg">
            {currentDoctor}'s today schedule
          </p>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {appointments.map((appointment, index) => (
            <div 
              key={index} 
              className="flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={appointment.patientImage}
                alt={appointment.patientName}
                className="w-[150px] h-[150px] rounded-full object-cover"
              />
              <div className="ml-6 flex-grow">
                <h3 className="text-xl font-semibold text-black">
                  {appointment.patientName}
                </h3>
                <p className="text-gray-600 mt-1">{appointment.gender}</p>
                <p className="text-gray-500">{appointment.appointmentType}</p>
              </div>
              <StatusCircle 
                status={appointment.status}
                onStatusChange={(newStatus) => handleStatusChange(index, newStatus)} 
              />
            </div>
          ))}
        </div>

        {/* <button onClick={goToPreviousStep}>Previous</button>
        <button onClick={goToNextStep}>Next</button> */}
      </div>
    </>
  );
};

export default Schedule;
