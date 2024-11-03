import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { Search, Plus, Trash2 } from "lucide-react";
import { selectPrescribeDrug, clearSelectedDrug, deletePrescribeDrug } from "../../redux/slices/predrugSlide";

interface PrescriptionStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const PrescriptionList: React.FC = () => {
  const { goToNextStep, goToPreviousStep } = useOutletContext<PrescriptionStepProps>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const prescribeDrugs = useAppSelector((state) => state.predrug.prescribeDrugs);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Updated filtering logic to only search symptoms
  const filteredDrugs = prescribeDrugs.filter((drug) =>
    drug.symptoms.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);

  // Effect to handle page adjustment when items length changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredDrugs.length, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDrugs = filteredDrugs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrescriptionClick = (id: string) => {
    dispatch(selectPrescribeDrug(id));
    goToNextStep();
  };

  const handleAddNew = () => {
    dispatch(clearSelectedDrug());
    goToNextStep();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      dispatch(deletePrescribeDrug(deleteId));
      
      // Calculate new total pages after deletion
      const newTotalPages = Math.ceil((filteredDrugs.length - 1) / itemsPerPage);
      
      // If current page would be empty after deletion, go to previous page
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
      
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">
            Prescription List
          </h1>
          
          <div className="w-full flex justify-between items-center mb-6 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search symptoms..."  // Updated placeholder
                className="pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddNew}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={24} />
              Add new
            </button>
          </div>

          <div className="w-full space-y-4">
            {displayedDrugs.length > 0 ? (
              displayedDrugs.map((drug) => (
                <div
                  key={drug.id}
                  onClick={() => handlePrescriptionClick(drug.id)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                        <img
                          src={drug.symptoms.toLowerCase() === 'cough' ? '/cough-icon.png' : '/fever-icon.png'}
                          alt={drug.symptoms}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {drug.symptoms}
                        </h2>
                        <p className="text-gray-600">{drug.syndrome}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, drug.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">
                  <Search className="mx-auto" size={64} />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No symptoms found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No symptoms match "${searchQuery}"`
                    : "No prescriptions available"}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this prescription? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionList;