// components/common/Pagination.tsx
import React, { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setCurrentPage } from '../../redux/slices/medicHistorySlide';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationButtonProps {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const Pagination = () => {
  const dispatch = useAppDispatch();
  const { currentPage, filteredRecords, itemsPerPage } = useAppSelector(
    state => state.medicHistory
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const PaginationButton = ({ 
    children, 
    active = false, 
    disabled = false, 
    onClick 
  }: PaginationButtonProps) => (
    <button
      className={`
        px-4 py-2 rounded-md transition-colors duration-200
        ${active 
          ? 'bg-blue-500 text-white' 
          : 'bg-white text-gray-700 hover:bg-gray-50'}
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-blue-50'}
        border border-gray-200
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <PaginationButton
        disabled={currentPage === 1}
        onClick={() => dispatch(setCurrentPage(currentPage - 1))}
      >
        <ChevronLeft size={18} />
      </PaginationButton>

      {[...Array(totalPages)].map((_, index) => (
        <PaginationButton
          key={index + 1}
          active={currentPage === index + 1}
          onClick={() => dispatch(setCurrentPage(index + 1))}
        >
          {index + 1}
        </PaginationButton>
      ))}

      <PaginationButton
        disabled={currentPage === totalPages}
        onClick={() => dispatch(setCurrentPage(currentPage + 1))}
      >
        <ChevronRight size={18} />
      </PaginationButton>
    </div>
  );
};

export default Pagination;