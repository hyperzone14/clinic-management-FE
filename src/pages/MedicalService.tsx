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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-8">Medical Treatment</h1>

          {/* Patient Information Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <span className="text-green-500 text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold">Patient Information</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <div className="p-2 bg-gray-100 rounded">
                  {patientInfo.patientName}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <div className="p-2 bg-gray-100 rounded">
                  {patientInfo.dateOfBirth || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Gender</label>
                <div className="p-2 bg-gray-100 rounded">
                  {patientInfo.gender || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Information Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <span className="text-green-500 text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold">Treatment Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Symptom</label>
                <input
                  type="text"
                  value={syndrome}
                  onChange={(e) => dispatch(setSyndrome(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Prescribed Drugs Table */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-600">Medicine List</label>
                  <button
                    onClick={() => dispatch(addPrescribedDrug({
                      drugId: 0,
                      dosage: 0,
                      duration: 0,
                      frequency: "",
                      specialInstructions: ""
                    }))}
                    className="flex items-center text-sm text-green-600 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medicine
                  </button>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 text-sm font-medium text-gray-600">Medicine name</th>
                      <th className="text-left p-2 text-sm font-medium text-gray-600">Quantity</th>
                      <th className="text-left p-2 text-sm font-medium text-gray-600">Note</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescribedDrugRequestDTOS.map((drug, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <select
                            value={drug.drugId}
                            onChange={(e) => dispatch(updatePrescribedDrug({
                              index,
                              updates: { drugId: Number(e.target.value) }
                            }))}
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Select Medicine</option>
                            {availableDrugs.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.standardDosage})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={drug.dosage}
                            onChange={(e) => dispatch(updatePrescribedDrug({
                              index,
                              updates: { dosage: Number(e.target.value) }
                            }))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={drug.specialInstructions}
                            onChange={(e) => dispatch(updatePrescribedDrug({
                              index,
                              updates: { specialInstructions: e.target.value }
                            }))}
                            className="w-full p-1 border rounded"
                            placeholder="Take after meals"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => dispatch(removePrescribedDrug(index))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Lab Test Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <span className="text-green-500 text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold">Lab test (Optional)</h2>
            </div>
            <div className="space-y-4">
              {examinationDetailRequestDTOS.map((exam, index) => (
                <div key={index} className="border rounded p-4 relative">
                  <button
                    onClick={() => dispatch(removeExamination(index))}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Lab test type</label>
                      <input
                        type="text"
                        value={exam.examinationType}
                        onChange={(e) => dispatch(updateExamination({
                          index,
                          updates: { examinationType: e.target.value }
                        }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Test results</label>
                      <textarea
                        value={exam.examinationResult}
                        onChange={(e) => dispatch(updateExamination({
                          index,
                          updates: { examinationResult: e.target.value }
                        }))}
                        rows={2}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => dispatch(addExamination({
                  examinationType: "",
                  examinationResult: ""
                }))}
                className="flex items-center text-sm text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Lab Test
              </button>
            </div>
          </div>

          {/* Doctor Feedback Section */}
          <div className="mb-8">
            <label className="block text-sm text-gray-600 mb-1">Doctor feedback</label>
            <textarea
              value={note}
              onChange={(e) => dispatch(setNote(e.target.value))}
              rows={3}
              className="w-full p-2 border rounded"
              placeholder="Enter your feedback..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => dispatch(resetTreatment())}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalService;