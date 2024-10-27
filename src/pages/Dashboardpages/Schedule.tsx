import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext, useNavigate } from "react-router-dom";
import AppointmentCard from '../../components/common/AppointmentCard';
import { RootState } from '../../redux/store';
import { 
  updateAppointmentStatus, 
  StatusType, 
} from '../../redux/slices/scheduleSlice';
import { setPatientInfo } from '../../redux/slices/treatmentSlice';

interface DashboardStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const Schedule: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useOutletContext<DashboardStepProps>();
  const { currentDoctor, appointments } = useSelector((state: RootState) => state.schedule);

  const handleStatusChange = (index: number, newStatus: StatusType) => {
    dispatch(updateAppointmentStatus({ index, newStatus }));
  };

  const handlePatientClick = (appointment: typeof appointments[0], _index: number) => {
    console.log('Patient clicked:', appointment);
    
    if (appointment.status === 'pending') {
      try {
        console.log('Dispatching patient info...');
        dispatch(setPatientInfo({
          name: appointment.patientName,
          dateOfBirth: '',
          gender: appointment.gender as 'Male' | 'Female'
        }));
        
        console.log('Using goToNextStep for navigation...');
        goToNextStep(); // Use context's navigation function instead
        console.log('Navigation complete');
      } catch (error) {
        console.error('Error in handlePatientClick:', error);
      }
    } else {
      console.log('Patient status is not pending:', appointment.status);
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">SCHEDULE</h1>
          <div className="mb-4">
            <p className="text-gray-600 text-3xl">
              {currentDoctor}'s today schedule
            </p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-4 mx-10 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>

        <div className="space-y-4 mt-6 mx-10">
          {appointments.map((appointment, index) => (
            <AppointmentCard
              key={index}
              appointment={appointment}
              index={index}
              onPatientClick={handlePatientClick}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* <div className="flex justify-between mx-10 mt-6">
          <button 
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Previous
          </button>
          <button 
            onClick={goToNextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Next
          </button>
        </div> */}
      </div>
    </>
  );
};

export default Schedule;