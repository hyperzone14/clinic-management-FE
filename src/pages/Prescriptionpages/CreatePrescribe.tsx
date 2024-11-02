import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addPrescribeDrug, updatePrescribeDrug } from "../../redux/slices/predrugSlide";
import { Medicine, createEmptyMedicine, generatePrescriptionId } from "../../utils/predrugData";
import { Trash2 } from "lucide-react";

interface PrescriptionStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const CreatePrescribe: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goToNextStep, goToPreviousStep } = useOutletContext<PrescriptionStepProps>();
  
  // Get selected drug from Redux store
  const selectedDrug = useAppSelector((state) => state.predrug.selectedDrug);

  const initialFormData = {
    symptom: "",
    syndrome: "",
    medicines: [] as Medicine[],
  };

  const [formData, setFormData] = useState(initialFormData);

  // Modified useEffect to handle both setting and clearing data
  useEffect(() => {
    if (selectedDrug) {
      setFormData({
        symptom: selectedDrug.symptoms,
        syndrome: selectedDrug.syndrome,
        medicines: selectedDrug.medicines,
      });
    } else {
      setFormData(initialFormData); // Reset form when there's no selected drug
    }
  }, [selectedDrug]);

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, createEmptyMedicine()]
    }));
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string | number) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medicines: updatedMedicines
    }));
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.medicines.reduce((sum, med) => sum + med.price, 0);
  };

  const handleSave = () => {
    console.log('Save button clicked');
    console.log('Form data:', formData);

    // Basic validation
    if (!formData.symptom.trim()) {
      alert('Please enter symptoms');
      return;
    }

    if (!formData.syndrome.trim()) {
      alert('Please enter syndrome');
      return;
    }

    if (formData.medicines.length === 0) {
      alert('Please add at least one medicine');
      return;
    }

    // Validate medicines
    const isValidMedicines = formData.medicines.every(medicine => 
      medicine.name && 
      medicine.quantity > 0 
      // medicine.price > 0
    );

    if (!isValidMedicines) {
      alert('Please fill in all medicine details correctly');
      return;
    }

    const prescriptionData = {
      id: selectedDrug?.id || generatePrescriptionId(),
      symptoms: formData.symptom,
      syndrome: formData.syndrome,
      medicines: formData.medicines,
      totalPrice: calculateTotal()
    };
    
    try {
      if (selectedDrug) {
        dispatch(updatePrescribeDrug(prescriptionData));
      } else {
        dispatch(addPrescribeDrug(prescriptionData));
      }
      console.log('Save successful');
      goToPreviousStep(); // Changed from goToNextStep to goToPreviousStep
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription. Please try again.');
    }
};
  const handleDiscard = () => {
    goToPreviousStep();
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">
            {selectedDrug ? 'Edit Prescription' : 'Create Prescription'}
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Symptom Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptom
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.symptom}
              onChange={(e) => setFormData(prev => ({ ...prev, symptom: e.target.value }))}
              placeholder="Enter symptoms..."
            />
          </div>

          {/* Syndrome Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Syndrome
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.syndrome}
              onChange={(e) => setFormData(prev => ({ ...prev, syndrome: e.target.value }))}
              placeholder="Enter syndrome..."
            />
          </div>

          {/* Medicines Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Medicine List</h2>
              <button
                onClick={handleAddMedicine}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Medicine
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table head remains the same */}
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medicine name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Note</th>
                    {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th> */}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.medicines.map((medicine, index) => (
                    <tr key={medicine.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={medicine.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={medicine.quantity}
                          onChange={(e) => handleMedicineChange(index, 'quantity', parseInt(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={medicine.note}
                          onChange={(e) => handleMedicineChange(index, 'note', e.target.value)}
                        />
                      </td>
                      {/* <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={medicine.price}
                          onChange={(e) => handleMedicineChange(index, 'price', parseInt(e.target.value))}
                        />
                      </td> */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveMedicine(index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 font-semibold">${calculateTotal()}</td>
                    <td></td>
                  </tr>
                </tfoot> */}
              </table>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleDiscard}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePrescribe;