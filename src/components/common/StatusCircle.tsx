import React, { useState } from "react";
import { Check, Clock, X, UserCheck, CheckCircle, Beaker, ClipboardCheck } from "lucide-react";
import { StatusType } from "../../redux/slices/scheduleSlice";

interface StatusCircleProps {
  status: StatusType;
  onStatusChange?: (newStatus: StatusType) => void;
  isManualCheckin?: boolean;
  showLabTestStatusesOnly?: boolean;
}

const StatusCircle: React.FC<StatusCircleProps> = ({
  status,
  onStatusChange,
  isManualCheckin = false,
  showLabTestStatusesOnly = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusStyles = (statusType: StatusType) => {
    switch (statusType) {
      case "success":
        return {
          background: "#34A85A",
          icon: <Check className="w-5 h-5 text-white" />,
        };
      case "checked-in":
        return {
          background: "#4567b7",
          icon: <UserCheck className="w-5 h-5 text-white" />,
        };
      case "pending":
        return {
          background: "#FFB800",
          icon: <Clock className="w-5 h-5 text-white" />,
        };
      case "cancelled":
        return {
          background: "#FF4747",
          icon: <X className="w-5 h-5 text-white" />,
        };
      case "confirmed":
        return {
          background: "#9333ea",
          icon: <CheckCircle className="w-5 h-5 text-white" />,
        };
      case "lab_test_required":
        return {
          background: "#F97316",
          icon: <Beaker className="w-5 h-5 text-white" />,
        };
      case "lab_test_completed":
        return {
          background: "#0EA5E9",
          icon: <ClipboardCheck className="w-5 h-5 text-white" />,
        };
    }
  };

  // Get available statuses based on current status and showLabTestStatusesOnly
  const getAvailableStatuses = (): StatusType[] => {
    if (showLabTestStatusesOnly) {
      switch (status) {
        case "lab_test_required":
          return ["lab_test_completed", "cancelled"];
        case "lab_test_completed":
          return ["lab_test_required"];
        case "cancelled":
          return [];
        default:
          return ["lab_test_required", "lab_test_completed"];
      }
    }

    const baseStatuses: StatusType[] = [
      "checked-in", 
      "confirmed", 
      "cancelled",
      "lab_test_required",
      "lab_test_completed"
    ];
    
    switch (status) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["checked-in", "cancelled"];
      case "checked-in":
        return ["cancelled", "lab_test_required"];
      case "lab_test_required":
        return ["lab_test_completed", "cancelled"];
      case "lab_test_completed":
      case "cancelled":
      case "success":
        return [];
      default:
        return baseStatuses.filter(s => s !== status);
    }
  };

  const handleStatusChange = (newStatus: StatusType) => {
    // Don't allow status changes for final states
    if (status === "cancelled" || status === "success" || status === "lab_test_completed") return;
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsMenuOpen(false);
  };

  const { background, icon } = getStatusStyles(status);

  const isClickable = () => {
    if (showLabTestStatusesOnly) {
      // Only allow interactions for lab test required status
      return status === "lab_test_required";
    }
    return status !== "cancelled" && status !== "success" && status !== "lab_test_completed";
  };

  return (
    <div className="relative">
      <div
        onClick={() => isClickable() && setIsMenuOpen(!isMenuOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
          !isClickable()
            ? "cursor-not-allowed"
            : "hover:opacity-80"
        }`}
        style={{ backgroundColor: background }}
      >
        {icon}
      </div>

      {isMenuOpen && isClickable() && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {getAvailableStatuses().map((statusOption) => {
              const styles = getStatusStyles(statusOption);
              return (
                <button
                  key={statusOption}
                  className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                  onClick={() => handleStatusChange(statusOption)}
                >
                  <div
                    className="w-5 h-5 rounded-full mr-3 flex items-center justify-center"
                    style={{ backgroundColor: styles.background }}
                  >
                    {styles.icon}
                  </div>
                  {statusOption
                    .split(/[-_]/)
                    .map(
                      (word) => word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCircle;