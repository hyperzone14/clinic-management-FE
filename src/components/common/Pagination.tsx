import React, { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setCurrentPage } from "../../redux/slices/medicHistorySlice";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationButtonProps {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const Pagination = () => {
  const dispatch = useAppDispatch();
  const { currentPage, totalPages, totalElements, loading } = useAppSelector(
    (state) => state.medicHistory
  );


  if (totalPages <= 1 || loading) {
    return null;
  }

  const PaginationButton = ({
    children,
    active = false,
    disabled = false,
    onClick,
  }: PaginationButtonProps) => (
    <button
      className={`
        px-4 py-2 rounded-md transition-colors duration-200
        ${
          active
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}
        border border-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );

  // Create array of page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <PaginationButton
          disabled={currentPage === 1}
          onClick={() => dispatch(setCurrentPage(currentPage - 1))}
        >
          <ChevronLeft size={18} />
        </PaginationButton>

        {getPageNumbers().map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber === '...' ? (
              <span className="px-4 py-2">...</span>
            ) : (
              <PaginationButton
                active={currentPage === pageNumber}
                onClick={() => dispatch(setCurrentPage(pageNumber as number))}
              >
                {pageNumber}
              </PaginationButton>
            )}
          </React.Fragment>
        ))}

        <PaginationButton
          disabled={currentPage === totalPages}
          onClick={() => dispatch(setCurrentPage(currentPage + 1))}
        >
          <ChevronRight size={18} />
        </PaginationButton>
      </div>

      {/* Pagination info */}
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages} ({totalElements} total records)
      </div>
    </div>
  );
};

export default Pagination;