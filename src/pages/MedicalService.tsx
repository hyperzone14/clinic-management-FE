import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import Title from "../components/common/Title";
import { Trash2 } from "lucide-react";
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
  fetchDrugs
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
  } = useAppSelector((state) => state.treatment);

  useEffect(() => {
    if (!patientInfo.patientId) {
      navigate('/schedule');
    }
    dispatch(fetchDrugs());
  }, [patientInfo.patientId, navigate, dispatch]);

  const handleAddDrug = () => {
    const newDrug = {
      drugId: 0,
      dosage: 0,
      duration: 0,
      frequency: "",
      specialInstructions: ""
    };
    dispatch(addPrescribedDrug(newDrug));
  };

  const handleAddExamination = () => {
    const newExamination = {
      examinationType: "",
      examinationResult: ""
    };
    dispatch(addExamination(newExamination));
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      dispatch(resetTreatment());
      navigate('/schedule');
    }
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitTreatment()).unwrap();
      navigate("/schedule");
    } catch (error) {
      console.error("Error submitting treatment:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col my-5 mx-10 justify-center items-center relative">
        <button
          onClick={() => navigate('/schedule')}
          className="absolute left-0 px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold font-sans my-5">Medical Service</h1>
      </div>

      {/* Patient Information Section */}
      <div className="mb-8 mx-10">
        <Title id={5} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={patientInfo.patientName}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Doctor
                </label>
                <input
                  type="text"
                  value={doctorInfo.doctorName}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syndrome and Note Section */}
      <div className="mb-8 mx-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Syndrome
              </label>
              <input
                type="text"
                value={syndrome}
                onChange={(e) => dispatch(setSyndrome(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter syndrome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => dispatch(setNote(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={3}
                placeholder="Enter note"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prescribed Drugs Section */}
      <div className="mb-8 mx-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Prescribed Drugs</h3>
            <button
              onClick={handleAddDrug}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Drug
            </button>
          </div>
          <div className="space-y-4">
            {prescribedDrugRequestDTOS.map((drug, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Drug</label>
                    <select
                      value={drug.drugId}
                      onChange={(e) => dispatch(updatePrescribedDrug({
                        index,
                        updates: { drugId: Number(e.target.value) }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <input
                      type="text"
                      value={drug.frequency}
                      onChange={(e) => dispatch(updatePrescribedDrug({
                        index,
                        updates: { frequency: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="e.g., Twice a day"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                    <textarea
                      value={drug.specialInstructions}
                      onChange={(e) => dispatch(updatePrescribedDrug({
                        index,
                        updates: { specialInstructions: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="e.g., Take after meals"
                    />
                  </div>
                  <button
                    onClick={() => dispatch(removePrescribedDrug(index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Examinations Section */}
      <div className="mb-8 mx-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Examinations</h3>
            <button
              onClick={handleAddExamination}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Examination
            </button>
          </div>
          <div className="space-y-4">
            {examinationDetailRequestDTOS.map((exam, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Examination Type</label>
                    <input
                      type="text"
                      value={exam.examinationType}
                      onChange={(e) => dispatch(updateExamination({
                        index,
                        updates: { examinationType: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Result</label>
                    <textarea
                      value={exam.examinationResult}
                      onChange={(e) => dispatch(updateExamination({
                        index,
                        updates: { examinationResult: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={() => dispatch(removeExamination(index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mx-10 mb-8 space-x-4">
        <button
          onClick={handleDiscard}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Discard
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Submit Treatment
        </button>
      </div>
    </div>
  );
};

export default MedicalService;