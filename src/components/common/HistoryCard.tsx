import React from "react";
import { Clock, Calendar, UserRound } from "lucide-react";
import { PiUserCircleLight } from "react-icons/pi";

interface MedicalRecord {
  syndrome: string;
  doctorName: string;
  date: string;
  treatment?: string;
  prescription?: string;
}

interface HistoryCardProps {
  record: MedicalRecord;
  onClick?: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ record, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        group relative
        w-full bg-white rounded-lg shadow-md p-6 
        transition-all duration-200
        border-l-4 border-blue-500
        hover:shadow-lg hover:bg-gray-50 cursor-pointer
      "
    >
      <div className="flex items-center justify-between">
        {/* Left side - Syndrome info */}
        <div className="flex-1">
          <div className="flex items-center">
            <PiUserCircleLight className="w-12 h-12 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-900 ms-3">
              {record.syndrome}
            </h2>
          </div>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Medical Record
          </span>
        </div>

        {/* Right side - Medical details */}
        <div className="text-right">
          <div className="flex items-center justify-end mb-2">
            <p className="text-lg font-medium text-gray-700 me-3">
              Dr. {record.doctorName}
            </p>
            <UserRound className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-end mb-2">
            <p className="text-gray-600 me-3">
              {new Date(record.date).toLocaleDateString()}
            </p>
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Additional medical information */}
      {(record.treatment || record.prescription) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {record.treatment && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Treatment:</span> {record.treatment}
            </p>
          )}
          {record.prescription && (
            <p className="text-gray-700">
              <span className="font-medium">Prescription:</span> {record.prescription}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryCard;