import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import Title from '../components/common/Title';
import { User, Calendar, Loader2 } from 'lucide-react';
import { fetchRecordById } from '../redux/slices/medicHistorySlice';

const MedicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedRecord, loading, error } = useAppSelector(state => state.medicHistory);

  useEffect(() => {
    if (id) {
      dispatch(fetchRecordById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => dispatch(fetchRecordById(Number(id)))}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedRecord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-gray-500 mb-4">Record not found</p>
        <button
          onClick={() => navigate('/medical-history')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to History
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col my-5 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">Medical Record Detail</h1>
      </div>

      {/* Patient Information Section */}
      <div className="mb-8">
        <Title id={5} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Patient ID</label>
              <input
                type="text"
                value={selectedRecord.patientId}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Patient Name</label>
              <input
                type="text"
                value={selectedRecord.patientName}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Birth Date</label>
              <input
                type="text"
                value={formatDate(selectedRecord.patientBirthDate)}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Gender</label>
              <input
                type="text"
                value={selectedRecord.patientGender}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor and Visit Information */}
      <div className="mb-8">
        <Title id={6} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Doctor ID</label>
              <input
                type="text"
                value={selectedRecord.doctorId}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Doctor Name</label>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                <input
                  type="text"
                  value={selectedRecord.doctorName}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Visit Date</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <input
                  type="text"
                  value={formatDate(selectedRecord.date)}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Syndrome</label>
              <input
                type="text"
                value={selectedRecord.syndrome}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prescribed Drugs Section */}
      <div className="mb-8">
        <Title id={6} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div>
            <h3 className="font-medium mb-2">Prescribed Drugs</h3>
            <div>
              <div className="grid grid-cols-3 gap-4">
                <h4 className="font-medium text-gray-500 text-sm">DRUG NAME</h4>
                <h4 className="font-medium text-gray-500 text-sm">DOSAGE</h4>
                <h4 className="font-medium text-gray-500 text-sm">NOTE</h4>
              </div>
              {selectedRecord.prescribedDrugs.map((drug) => (
                <div key={drug.id} className="grid grid-cols-3 gap-4 py-2 border-t border-gray-100">
                  <p className="text-gray-800">{drug.drugName}</p>
                  <p className="text-gray-800">{drug.dosage}</p>
                  <p className="text-gray-800">{drug.specialInstructions}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Examination Details */}
      <div className="mb-8">
        <Title id={6} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h3 className="font-medium mb-4">Examination Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedRecord.examinationDetails.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4">{exam.examinationType}</td>
                    <td className="px-6 py-4">{exam.examinationResult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Doctor Note */}
      <div className="mb-8">
        <Title id={6} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Note</label>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="whitespace-pre-wrap">{selectedRecord.note}</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => navigate('/medical-history')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to History
        </button>
      </div>
    </div>
  );
};

export default MedicDetail;