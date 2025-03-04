import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiService } from '../utils/axios-config';

interface PreExaminationFormData {
  patientId: number;
  doctorId: number;
  date: string;
  syndrome: string;
  note: string;
  weight: number;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
}

const PreExaminationDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, doctorId, appointmentId, patientName, doctorName, appointmentDate } = location.state || {};

  const [formData, setFormData] = useState<PreExaminationFormData>({
    patientId: patientId || 0,
    doctorId: doctorId || 0,
    date: appointmentDate || new Date().toISOString().split('T')[0],
    syndrome: '',
    note: '',
    weight: 0,
    heartRate: 0,
    bloodPressure: '',
    temperature: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.syndrome.trim()) {
        toast.error('Please enter syndrome');
        return;
      }

      if (formData.weight <= 0) {
        toast.error('Please enter a valid weight');
        return;
      }

      if (formData.heartRate <= 0) {
        toast.error('Please enter a valid heart rate');
        return;
      }

      if (!formData.bloodPressure.trim()) {
        toast.error('Please enter blood pressure');
        return;
      }

      if (formData.temperature <= 0) {
        toast.error('Please enter a valid temperature');
        return;
      }

      // Submit pre-examination data
      await apiService.post('/pre_examination', formData);

      // Update appointment status
      await apiService.put(
        `/appointment/${appointmentId}/status`,
        '"PRE_EXAMINATION_COMPLETED"'
      );

      toast.success('Pre-examination completed successfully');
      navigate('/pre_exam');
    } catch (error) {
      console.error('Error submitting pre-examination:', error);
      toast.error('Failed to submit pre-examination data');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#4567b7] mb-6">Pre-Examination Form</h2>
          
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#f7f7f7] rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Patient Name</h3>
              <p className="text-lg font-semibold text-[#4567b7]">{patientName}</p>
            </div>
            <div className="p-4 bg-[#f7f7f7] rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Doctor Name</h3>
              <p className="text-lg font-semibold text-[#4567b7]">{doctorName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="e.g., 120/80"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Syndrome</label>
              <input
                type="text"
                name="syndrome"
                value={formData.syndrome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4567b7] focus:ring-[#4567b7]"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/pre_exam')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#4567b7] hover:bg-[#34a85a] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4567b7]"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreExaminationDetail; 