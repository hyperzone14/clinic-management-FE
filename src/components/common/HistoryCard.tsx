import React from "react";
import { Clock, Calendar, UserRound } from "lucide-react";
import { PiUserCircleLight } from "react-icons/pi";
import { ExaminationDetail } from "../../redux/slices/medicHistorySlice";

interface PrescribedDrug {
  id: number;
  drugName: string;
  dosage: number;
  duration: number;
  frequency: string;
  specialInstructions: string;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientGender: string;
  patientBirthDate: string;
  doctorId: number;
  doctorName: string;
  date: string;
  syndrome: string;
  note: string;
  prescribedDrugs: PrescribedDrug[];
  examinationDetails: ExaminationDetail[];
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

      {/* {(record.note || record.prescribedDrugs.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {record.note && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Notes:</span> {record.note}
            </p>
          )}
          {record.prescribedDrugs.length > 0 && (
            <div className="text-gray-700">
              <span className="font-medium">Prescribed Medications:</span>
              <ul className="mt-2 space-y-1">
                {record.prescribedDrugs.map((drug) => (
                  <li key={drug.id} className="ml-4">
                    {drug.drugName} - {drug.dosage}mg, {drug.frequency}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default HistoryCard;