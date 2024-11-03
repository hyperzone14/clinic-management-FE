// pages/MedicHistory.tsx
import React from 'react';
import { useAppSelector } from '../redux/store';
import SearchFilter from '../components/common/SearchFilter';
import HistoryCard from '../components/common/HistoryCard';
import Pagination from '../components/common/Pagination';

const MedicHistory = () => {
  const { filteredRecords, currentPage, itemsPerPage } = useAppSelector(
    state => state.medicHistory
  );

  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Medical History</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SearchFilter />
        </div>

        <div className="space-y-4">
          {currentRecords.length > 0 ? (
            currentRecords.map((record) => (
              <HistoryCard key={record.id} record={record} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No medical records found</p>
            </div>
          )}
        </div>

        {filteredRecords.length > itemsPerPage && <Pagination />}
      </div>
    </div>
  );
};

export default MedicHistory;