// pages/MedicalService.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { Trash2, Plus, ChevronLeft } from "lucide-react";
import {
  submitTreatment,
  addPrescribedDrug,
  removePrescribedDrug,
  updatePrescribedDrug,
  addExamination,
  removeExamination,
  updateExamination,
  setSyndrome,
  setNote,
  resetTreatment,
  fetchDrugs,
  selectTreatment
} from "../redux/slices/treatmentSlice";


const MedicalService: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    patientInfo,
    doctorInfo,
    syndrome,
    note,
    prescribedDrugRequestDTOS,
    examinationDetailRequestDTOS,
    availableDrugs,
    loading
  } = useAppSelector(selectTreatment);

  useEffect(() => {
    if (!patientInfo.patientId) {
      navigate('/schedule');
      return;
    }
    dispatch(fetchDrugs());
  }, [patientInfo.patientId, navigate, dispatch]);

  const handleSubmit = async () => {
    if (!syndrome.trim()) {
      alert('Please enter syndrome');
      return;
    }
  
    if (prescribedDrugRequestDTOS.length === 0) {
      alert('Please add at least one prescribed drug');
      return;
    }
  
    try {
      await dispatch(submitTreatment()).unwrap();
      alert('Medical bill created successfully');
      
      // Navigate back to schedule page
      navigate('/schedule');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create medical bill. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/schedule')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back to Schedule
              </button>
              <h1 className="ml-8 text-2xl font-bold text-gray-900">Medical Bill</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => dispatch(resetTreatment())}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Form
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Patient & Doctor Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient & Doctor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {patientInfo.patientName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {doctorInfo.doctorName}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Syndrome</label>
                <input
                  type="text"
                  value={syndrome}
                  onChange={(e) => dispatch(setSyndrome(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter syndrome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => dispatch(setNote(e.target.value))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter additional notes"
                />
              </div>
            </div>
          </div>

          {/* Prescribed Drugs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prescribed Drugs</h2>
              <button
                onClick={() => dispatch(addPrescribedDrug({
                  drugId: 0,
                  dosage: 0,
                  duration: 0,
                  frequency: "",
                  specialInstructions: ""
                }))}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Drug
              </button>
            </div>
            <div className="space-y-4">
              {prescribedDrugRequestDTOS.map((drug, index) => (
                <div key={index} className="relative p-4 border rounded-lg hover:border-blue-500 transition-colors">
                  <button
                    onClick={() => dispatch(removePrescribedDrug(index))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Drug</label>
                      <select
                        value={drug.drugId}
                        onChange={(e) => dispatch(updatePrescribedDrug({
                          index,
                          updates: { drugId: Number(e.target.value) }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Drug</option>
                        {availableDrugs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.standardDosage})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dosage</label>
                      <input
                        type="number"
                        value={drug.dosage}
                        onChange={(e) => dispatch(updatePrescribedDrug({
                          index,
                          updates: { dosage: Number(e.target.value) }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                      <input
                        type="number"
                        value={drug.duration}
                        onChange={(e) => dispatch(updatePrescribedDrug({
                          index,
                          updates: { duration: Number(e.target.value) }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frequency</label>
                      <input
                        type="text"
                        value={drug.frequency}
                        onChange={(e) => dispatch(updatePrescribedDrug({
                          index,
                          updates: { frequency: e.target.value.trim() }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Twice a day"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                      <textarea
                        value={drug.specialInstructions}
                        onChange={(e) => dispatch(updatePrescribedDrug({
                          index,
                          updates: { specialInstructions: e.target.value.trim() }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Take after meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examinations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Examinations</h2>
              <button
                onClick={() => dispatch(addExamination({
                  examinationType: "",
                  examinationResult: ""
                }))}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Examination
              </button>
            </div>
            <div className="space-y-4">
              {examinationDetailRequestDTOS.map((exam, index) => (
                <div key={index} className="relative p-4 border rounded-lg hover:border-blue-500 transition-colors">
                  <button
                    onClick={() => dispatch(removeExamination(index))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Examination Type</label>
                      <input
                        type="text"
                        value={exam.examinationType}
                        onChange={(e) => dispatch(updateExamination({
                          index,
                          updates: { examinationType: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Results</label>
                      <textarea
                        value={exam.examinationResult}
                        onChange={(e) => dispatch(updateExamination({
                          index,
                          updates: { examinationResult: e.target.value }
                        }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalService;