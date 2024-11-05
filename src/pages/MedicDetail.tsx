// pages/MedicDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import Title from '../components/common/Title';
import { User, Calendar } from 'lucide-react';

const MedicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records } = useAppSelector(state => state.medicHistory);
  
  const record = records.find(r => r.id === id);

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <div className="w-full">
    {/* Header */}
    <div className="flex flex-col my-5 mx-10 justify-center items-center">
      <h1 className="text-4xl font-bold font-sans my-5">Medical Record Detail</h1>
    </div>

    {/* Patient Information Section */}
    <div className="mb-8 mx-10">
      <Title id={5} />
      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <input
                type="text"
                value="Patient Name" // You'll need to add this to your medical record data
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
              <input
                type="text"
                value="01/01/1990" // You'll need to add this to your medical record data
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Gender</label>
              <div className="mt-1 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={true} // You'll need to add gender to your medical record data
                    readOnly
                    className="form-radio"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={false}
                    readOnly
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

    {/* Medical Record Information Section */}
    <div className="mb-8 mx-10">
      <Title id={6} />
      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Symptoms</label>
              <input
                type="text"
                value={record.symptoms}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <input
                  type="text"
                  value={new Date(record.date).toLocaleDateString('en-US')}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor</label>
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                <input
                  type="text"
                  value={record.doctorName}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
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
          {/* Medicines Section */}
          <div>
            <h3 className="font-medium mb-2">Medicines</h3>
            <div>
              <div className="grid grid-cols-3">
                <h4 className="font-medium text-gray-500 text-sm">MEDICINE NAME</h4>
                <h4 className="font-medium text-gray-500 text-sm">QUANTITY</h4>
                <h4 className="font-medium text-gray-500 text-sm">NOTE</h4>
              </div>
              {record.treatment_medicine.map((medicine, index) => (
                <div key={index} className="grid grid-cols-3 py-2 border-t border-gray-100">
                  <p>{medicine.medicine_name}</p>
                  <p>{medicine.quantity}</p>
                  <p>{medicine.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lab Test Section */}
      <div className="mb-8 mx-10">
        <Title id={6} />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Lab Test Type</label>
              <input
                type="text"
                value={record.examination.lab_test}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Test Results</label>
              <input
                type="text"
                value={record.examination.test_result}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Feedback Section */}
      <div className="mb-8 mx-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Doctor Feedback</label>
            <textarea
              value={record.doctor_feedback}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mx-10 mb-8">
        <button
          onClick={() => navigate('/medical-history')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to History
        </button>
      </div>
    </div>
  );
};

export default MedicDetail;