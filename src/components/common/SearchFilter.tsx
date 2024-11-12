import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setSearchTerm,
  setFilterDoctor,
  setFilterDate,
  clearFilters,
} from "../../redux/slices/medicHistorySlice";
import { doctorsList } from "../../utils/medicHistoryData";
import { Search, Calendar, X } from "lucide-react";

const SearchFilter = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, filterDoctor, filterDate } = useAppSelector(
    (state) => state.medicHistory
  );
  const [displayDate, setDisplayDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      setDisplayDate(formattedDate);
      dispatch(setFilterDate(date));
    } else {
      setDisplayDate("");
      dispatch(setFilterDate(""));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setDisplayDate("");
  };

  const isFiltersActive = searchTerm || filterDoctor || filterDate;

  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by symptoms..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        />
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Filter</span>
          <div className="flex gap-3 items-center">
            {/* Doctor Filter */}
            <div className="relative">
              <select
                className="w-48 px-4 py-2 rounded-lg border border-gray-200 appearance-none bg-white focus:outline-none"
                value={filterDoctor}
                onChange={(e) => dispatch(setFilterDoctor(e.target.value))}
              >
                <option value="">By doctor</option>
                {doctorsList.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="text"
                readOnly
                placeholder="mm/dd/yyyy"
                value={displayDate}
                className="w-48 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none cursor-pointer bg-white"
              />
              <Calendar
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer z-10"
                onClick={handleCalendarClick}
              />
              <input
                ref={dateInputRef}
                type="date"
                className="absolute inset-0 opacity-0"
                onChange={handleDateChange}
                value={filterDate}
              />
            </div>
            {/* Clear Filters Button */}
            {isFiltersActive && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
