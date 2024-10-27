import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector, useDispatch, } from 'react-redux';
import { RootState } from '../../redux/store';
import Title from '../../components/common/Title';
import SymptomSelect from '../../components/common/SymptomSelect';
import { Trash2 } from 'lucide-react';
import { 
  removeMedicine, 
  updateMedicine, 
  setDoctorFeedback, 
  LabTest, 
  setLabTest, 
  addMedicine,
  resetTreatment,
  completeTreatment,
} from '../../redux/slices/treatmentSlice';
import {
  completeTreatmentAndUpdateStatus
} from '../../redux/slices/scheduleSlice';

interface DashboardStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Default state values
const defaultTreatmentState = {
  patientInfo: {
    name: '',
    dateOfBirth: '',
    gender: 'Male' as const
  },
  selectedSymptoms: [],
  medicines: [],
  labTest: {
    type: '',
    results: ''
  },
  doctorFeedback: '',
  total: 0
};

const MedicalService: React.FC = () => {
  const dispatch = useDispatch();
  const treatment = useSelector((state: RootState) => state.treatment);
  const { goToNextStep, goToPreviousStep } = useOutletContext<DashboardStepProps>();
  const navigate = useNavigate();

  // Safe destructuring with defaults
  const { 
    patientInfo = defaultTreatmentState.patientInfo,
    medicines = defaultTreatmentState.medicines,
    labTest = defaultTreatmentState.labTest,
    doctorFeedback = defaultTreatmentState.doctorFeedback,
    total = defaultTreatmentState.total
  } = treatment || defaultTreatmentState;

  const handleMedicineChange = (id: string, field: string, value: string | number) => {
    dispatch(updateMedicine({ 
      id, 
      updates: { [field]: field === 'quantity' || field === 'price' ? Number(value) : value }
    }));
  };

  const handleRemoveMedicine = (id: string) => {
    dispatch(removeMedicine(id));
  };

  const handleLabTestChange = (field: keyof LabTest, value: string) => {
    dispatch(setLabTest({
      ...labTest,
      [field]: value
    }));
  };

  const handleFeedbackChange = (value: string) => {
    dispatch(setDoctorFeedback(value));
  };

  const handleAddCustomMedicine = () => {
    const newMedicine = {
      id: `custom-${Date.now()}`,
      name: '',
      quantity: 0,
      note: '',
      price: 0
    };
    dispatch(addMedicine(newMedicine));
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      dispatch(resetTreatment());
      goToPreviousStep();
    }
  };

  const handleCompleteTreatment = () => {
    try {
      // Complete the treatment in treatment slice
      dispatch(completeTreatment({
        patientId: treatment.patientInfo.name, // Using name as ID for now
        treatmentData: {
          symptoms: treatment.selectedSymptoms,
          medicines: treatment.medicines,
          labTest: treatment.labTest,
          doctorFeedback: treatment.doctorFeedback
        }
      }));

      // Update the appointment status in schedule slice
      dispatch(completeTreatmentAndUpdateStatus({
        patientName: treatment.patientInfo.name
      }));

      // Reset treatment state
      dispatch(resetTreatment());

      // Navigate back to schedule
      navigate('/dashboard/schedule', { replace: true });

    } catch (error) {
      console.error('Error completing treatment:', error);
    }
  };

  

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Medical Service</h1>
        </div>

        {/* Patient Information Section */}
        <div className="mb-8 mx-10">
          <Title id={5} />
          <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="text"
                    value={patientInfo.dateOfBirth}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={patientInfo.gender === 'Male'}
                        disabled
                        className="form-radio"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={patientInfo.gender === 'Female'}
                        disabled
                        className="form-radio"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Information Section */}
        <div className="mb-8 mx-10">
          <Title id={6} />
          <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            {/* Symptoms MultiSelect */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <SymptomSelect />
            </div>

            {/* Medicine Table */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Medicines</h3>
                <button
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleAddCustomMedicine}
                >
                  + Add Medicine
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(medicine.id, 'name', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={medicine.quantity}
                            onChange={(e) => handleMedicineChange(medicine.id, 'quantity', e.target.value)}
                            className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={medicine.note}
                            onChange={(e) => handleMedicineChange(medicine.id, 'note', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        {/* <td className="px-6 py-4">
                          <input
                            type="number"
                            value={medicine.price}
                            onChange={(e) => handleMedicineChange(medicine.id, 'price', e.target.value)}
                            className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td> */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveMedicine(medicine.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* For latter use */}
                  {/* <tfoot>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right font-semibold">
                        Total:
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        $ {total}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot> */}
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Test Section */}
        <div className="mb-8 mx-10">
          <div className="flex items-center mb-4">
            <Title id={6} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lab Test Type</label>
                <input
                  type="text"
                  value={labTest.type}
                  onChange={(e) => handleLabTestChange('type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Select lab test type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Results</label>
                <textarea
                  value={labTest.results}
                  onChange={(e) => handleLabTestChange('results', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  placeholder="Enter test results"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Feedback Section */}
        <div className="mb-8 mx-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Doctor Feedback</label>
              <textarea
                value={doctorFeedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={4}
                placeholder="Enter your feedback"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mx-10 mb-8">
          {/* <button 
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Previous
          </button> */}
          <div className="space-x-4">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Discard
            </button>
            <button
              onClick={handleCompleteTreatment}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Complete Treatment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalService;