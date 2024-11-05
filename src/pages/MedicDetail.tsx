// pages/MedicDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

const MedicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records } = useAppSelector(state => state.medicHistory);
  
  // Find the specific record from our Redux store
  const record = records.find(r => r.id === id);

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Medical Detail</h1>
        </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Symptoms</h2>
        <p className="text-gray-700 mb-6">{record.symptoms}</p>

        <h2 className="text-2xl font-semibold mb-4">Treatment Medicines</h2>
        <div className="space-y-4">
          {record.treatment_medicine.map((medicine, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium">{medicine.medicine_name}</h3>
              <p className="text-gray-600">Quantity: {medicine.quantity}</p>
              <p className="text-gray-600">Note: {medicine.note}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold my-4">Examination</h2>
        <div className="mb-6">
          <p className="text-gray-700">Lab Test: {record.examination.lab_test}</p>
          <p className="text-gray-700">Result: {record.examination.test_result}</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Doctor's Feedback</h2>
        <p className="text-gray-700">{record.doctor_feedback}</p>

        <button
          onClick={() => navigate('/medical-history')}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to History
        </button>
      </div>
    </div>
  );
};

export default MedicDetail;