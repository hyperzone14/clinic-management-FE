import React, { useState } from "react";
import { Check, Clock, X, UserCheck, CheckCircle, Beaker, ClipboardCheck } from "lucide-react";
import { StatusType } from "../../redux/slices/scheduleSlice";

// Define valid status types explicitly
export const VALID_STATUS_TYPES = [
  'success',
  'checked-in',
  'pending',
  'cancelled',
  'confirmed',
  'lab_test_required',
  'lab_test_completed'
] as const;

// Type guard to check if a status is valid
const isValidStatus = (status: string): status is StatusType => {
  return VALID_STATUS_TYPES.includes(status as StatusType);
};

interface StatusStyle {
  background: string;
  icon: React.ReactNode;
  label: string;
  hoverBackground?: string;
}

interface StatusCircleProps {
  status: StatusType;
  onStatusChange?: (newStatus: StatusType) => void;
  isManualCheckin?: boolean;
  showLabTestStatusesOnly?: boolean;
}

const STATUS_STYLES: Record<StatusType, StatusStyle> = {
  success: {
    background: "#34A85A",
    hoverBackground: "#2E9550",
    icon: <Check className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Success"
  },
  "checked-in": {
    background: "#4567b7",
    hoverBackground: "#3B5BA3",
    icon: <UserCheck className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Checked In"
  },
  pending: {
    background: "#FFB800",
    hoverBackground: "#E5A600",
    icon: <Clock className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Pending"
  },
  cancelled: {
    background: "#FF4747",
    hoverBackground: "#E53E3E",
    icon: <X className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Cancelled"
  },
  confirmed: {
    background: "#9333ea",
    hoverBackground: "#842CD1",
    icon: <CheckCircle className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Confirmed"
  },
  lab_test_required: {
    background: "#F97316",
    hoverBackground: "#EA580C",
    icon: <Beaker className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Lab Test Required"
  },
  lab_test_completed: {
    background: "#0EA5E9",
    hoverBackground: "#0284C7",
    icon: <ClipboardCheck className="w-5 h-5 text-white drop-shadow-sm" />,
    label: "Test Completed"
  }
};

const FINAL_STATES: StatusType[] = ["cancelled", "success", "lab_test_completed"];

const StatusCircle: React.FC<StatusCircleProps> = ({
  status,
  onStatusChange,
  showLabTestStatusesOnly = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Validate and normalize status
  const normalizedStatus = isValidStatus(status) ? status : "pending";
  const currentStyle = STATUS_STYLES[normalizedStatus];

  const getAvailableStatuses = (): StatusType[] => {
    if (showLabTestStatusesOnly) {
      const labTestTransitions: Record<StatusType, StatusType[]> = {
        lab_test_required: [ "cancelled"],
        lab_test_completed: ["lab_test_required"],
        cancelled: [],
        success: ["lab_test_required", "lab_test_completed"],
        confirmed: ["lab_test_required", "lab_test_completed"],
        pending: ["lab_test_required", "lab_test_completed"],
        "checked-in": ["lab_test_required", "lab_test_completed"]
      };
      return labTestTransitions[normalizedStatus] ?? ["lab_test_required", "lab_test_completed"];
    }

    const statusTransitions: Record<StatusType, StatusType[]> = {
      pending: ["confirmed","checked-in", "cancelled"],
      confirmed: ["checked-in", "cancelled"],
      "checked-in": ["cancelled"],
      lab_test_required: ["cancelled"],
      lab_test_completed: [],
      cancelled: [],
      success: [],
    };

    return statusTransitions[normalizedStatus] ?? ["checked-in", "confirmed", "cancelled", "lab_test_required", "lab_test_completed"];
  };

  const isClickable = () => {
    if (showLabTestStatusesOnly) {
      return normalizedStatus === "lab_test_required";
    }
    return !FINAL_STATES.includes(normalizedStatus);
  };

  const handleStatusChange = (newStatus: StatusType) => {
    if (!isClickable()) return;
    onStatusChange?.(newStatus);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => isClickable() && setIsMenuOpen(!isMenuOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ease-in-out transform
          ${isClickable() ? "hover:scale-105 cursor-pointer" : "cursor-not-allowed opacity-75"}`}
        style={{ 
          backgroundColor: isHovered && isClickable() ? 
            currentStyle.hoverBackground : 
            currentStyle.background 
        }}
      >
        {currentStyle.icon}
      </div>

      {isMenuOpen && isClickable() && (
        <div className="absolute right-0 mt-3 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50 overflow-hidden transform transition-all duration-200 ease-in-out">
          <div className="py-1">
            {getAvailableStatuses().map((statusOption) => (
              <button
                key={statusOption}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => handleStatusChange(statusOption)}
              >
                <div
                  className="w-6 h-6 rounded-full mr-3 flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: STATUS_STYLES[statusOption].background }}
                >
                  {STATUS_STYLES[statusOption].icon}
                </div>
                <span className="font-medium">{STATUS_STYLES[statusOption].label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCircle;