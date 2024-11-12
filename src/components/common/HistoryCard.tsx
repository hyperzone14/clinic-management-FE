// components/common/HistoryCard.tsx
import React from "react";
import { MedicalRecord } from "../../redux/slices/medicHistorySlice";
import { User, Calendar } from "lucide-react";

interface HistoryCardProps {
  record: MedicalRecord;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ record }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center p-4 mb-4 bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">

      <div className="flex-1 ml-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          {record.syndrome}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm">{record.doctorName}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm">{formatDate(record.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
