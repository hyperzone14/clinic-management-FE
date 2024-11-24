// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';
// import { addSymptom, removeSymptom, addMedicine, removeMedicine } from '../../redux/slices/treatmentSlice';
// import { symptoms } from '../../utils/treatmentData';
// import { X } from 'lucide-react';

// const SymptomSelect: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dispatch = useDispatch();
  
//   const treatment = useSelector((state: RootState) => state.treatment);
//   const selectedSymptoms = treatment ? treatment.selectedSymptoms || [] : [];

//   const handleSymptomClick = (symptomId: string) => {
//     if (!selectedSymptoms.includes(symptomId)) {
//       dispatch(addSymptom(symptomId));
      
//       // Add associated medicines
//       const symptom = symptoms.find(s => s.id === symptomId);
//       if (symptom) {
//         symptom.medicines.forEach(medicine => {
//           dispatch(addMedicine(medicine));
//         });
//       }
//     }
//     setIsOpen(false);
//   };

//   const handleRemoveSymptom = (symptomId: string) => {
//     // Find the symptom and its associated medicines
//     const symptom = symptoms.find(s => s.id === symptomId);
//     if (symptom) {
//       // Remove each associated medicine
//       symptom.medicines.forEach(medicine => {
//         dispatch(removeMedicine(medicine.id));
//       });
//     }
    
//     // Then remove the symptom
//     dispatch(removeSymptom(symptomId));
//   };

//   if (!Array.isArray(selectedSymptoms)) {
//     console.warn('selectedSymptoms is not an array:', selectedSymptoms);
//     return null;
//   }

//   return (
//     <div className="relative">
//       <div className="min-h-[40px] p-2 border rounded-md flex flex-wrap gap-2 bg-white">
//         {selectedSymptoms.map(symptomId => {
//           const symptom = symptoms.find(s => s.id === symptomId);
//           return symptom ? (
//             <div
//               key={symptom.id}
//               className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md"
//             >
//               <span>{symptom.label}</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleRemoveSymptom(symptom.id);
//                 }}
//                 className="hover:text-blue-600"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           ) : null;
//         })}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="text-gray-500 hover:text-gray-700"
//         >
//           + Add Symptom
//         </button>
//       </div>

//       {isOpen && (
//         <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
//           <div className="max-h-60 overflow-auto">
//             {symptoms.map(symptom => (
//               <button
//                 key={symptom.id}
//                 className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
//                   selectedSymptoms.includes(symptom.id)
//                     ? 'bg-gray-50 text-gray-500'
//                     : 'text-gray-700'
//                 }`}
//                 onClick={() => handleSymptomClick(symptom.id)}
//                 disabled={selectedSymptoms.includes(symptom.id)}
//               >
//                 {symptom.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SymptomSelect;