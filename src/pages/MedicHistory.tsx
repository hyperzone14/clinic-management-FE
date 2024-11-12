import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import SearchFilter from '../components/common/SearchFilter';
import HistoryCard from '../components/common/HistoryCard';
import Pagination from '../components/common/Pagination';
import { fetchMedicalRecords } from '../redux/slices/medicHistorySlice';
import { Loader2 } from 'lucide-react';

const MedicHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { 
    filteredRecords, 
    currentPage, 
    itemsPerPage,
    filterDoctor,
    filterDate,
    searchTerm,
    loading,
    error
  } = useAppSelector(state => state.medicHistory);

  // Fetch records when page loads or filters change
  useEffect(() => {
    dispatch(fetchMedicalRecords());
  }, [dispatch, currentPage, itemsPerPage, filterDoctor, filterDate, searchTerm]);

  const handleRecordClick = (id: number) => { // Changed from string to number
    navigate(`/medical-history/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => dispatch(fetchMedicalRecords())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col my-5 mx-10 justify-center items-center">
        <h1 className="text-4xl font-bold font-sans my-5">Medical History</h1>
      </div>
      <SearchFilter />
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow-sm">
            <p className="text-lg">No records found</p>
            {(filterDoctor || filterDate || searchTerm) && (
              <p className="text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div 
              key={record.id} 
              onClick={() => handleRecordClick(record.id)}
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            >
              <HistoryCard record={record} />
            </div>
          ))
        )}
      </div>
      <Pagination />
    </div>
  );
};

export default MedicHistory;