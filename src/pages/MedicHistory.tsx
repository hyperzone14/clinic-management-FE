import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import HistoryCard from '../components/common/HistoryCard';
import { 
  fetchMedicalRecords, 
  fetchMedicalRecordsByPatientId,
  setCurrentPage 
} from '../redux/slices/medicHistorySlice';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MedicHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  const { 
    filteredRecords, 
    currentPage,
    totalPages,
    itemsPerPage,
    loading,
    error
  } = useAppSelector(state => state.medicHistory);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchMedicalRecordsByPatientId(Number(patientId)));
    } else {
      dispatch(fetchMedicalRecords());
    }
  }, [dispatch, currentPage, itemsPerPage, patientId]);

  const handleRecordClick = (id: number) => {
    navigate(`/medical-history/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      dispatch(setCurrentPage(newPage + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Invalid page number');
    }
  };

  return (
    <div className="w-full">
      <ToastContainer />
      
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">
          {patientId ? 'PATIENT MEDICAL HISTORY' : 'MEDICAL HISTORY'}
        </h1>
      </div>

      <div className="my-12 flex flex-col items-center">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            {toast.error(`Error loading medical records: ${error}`)}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {filteredRecords.length === 0 ? (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-xl text-gray-600">No medical records found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {patientId 
                    ? 'This patient has no medical records'
                    : 'No medical records available'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="w-9/12 space-y-4 max-h-[70vh] pr-4 overflow-y-auto">
                  {filteredRecords.map((record) => (
                    <div 
                      key={record.id}
                      onClick={() => handleRecordClick(record.id)}
                      className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <HistoryCard record={record} />
                    </div>
                  ))}
                </div>

                {!patientId && ( // Only show pagination when viewing all records
                  <div className="flex justify-center space-x-4 mt-10 mb-5">
                    <button
                      className="px-4 py-2 bg-[#34a85a] text-white rounded-lg disabled:opacity-50 hover:bg-[#2e8b46] transition duration-300 ease-in-out"
                      onClick={() => handlePageChange(currentPage - 2)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 bg-[#6B87C7] text-[#fff] rounded-lg disabled:opacity-50 hover:bg-[#4567B7] transition duration-300 ease-in-out"
                      onClick={() => handlePageChange(currentPage)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicHistory;