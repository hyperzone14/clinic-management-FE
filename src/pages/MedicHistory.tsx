
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import SearchFilter from '../components/common/SearchFilter';
import HistoryCard from '../components/common/HistoryCard';
import Pagination from '../components/common/Pagination';

const MedicHistory: React.FC = () => {
  const navigate = useNavigate();
  const { filteredRecords, currentPage, itemsPerPage } = useAppSelector(
    state => state.medicHistory
  );

  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRecordClick = (id: string) => {
    navigate(`/medical-history/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
     <div className="flex flex-col my-5 mx-10 justify-center items-center">
          <h1 className="text-4xl font-bold font-sans my-5">Medical History</h1>
        </div>
      <SearchFilter />
      <div className="space-y-4">
        {currentRecords.map((record) => (
          <div key={record.id} onClick={() => handleRecordClick(record.id)}>
            <HistoryCard record={record} />
          </div>
        ))}
      </div>
      <Pagination />
    </div>
  );
};

export default MedicHistory;