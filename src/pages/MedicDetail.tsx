// pages/MedicDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

const MedicDetail = () => {
  const { id } = useParams();
  const { records } = useAppSelector(state => state.medicHistory);
  const record = records.find(r => r.id === id);

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Medical Detail</h1>
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
      </div>
    </div>
  );
};

export default MedicDetail;