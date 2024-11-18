import React, { useState } from "react";
import { Check, Clock, X, UserCheck, CheckCircle } from "lucide-react";
import { StatusType } from "../../redux/slices/scheduleSlice";

interface StatusCircleProps {
  status: StatusType;
  onStatusChange?: (newStatus: StatusType) => void;
  isManualCheckin?: boolean;
}

const StatusCircle: React.FC<StatusCircleProps> = ({
  status,
  onStatusChange,
  isManualCheckin = false,
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
    }
  };

  // Get available statuses (excluding pending)
  const getAvailableStatuses = (): StatusType[] => {
    const baseStatuses: StatusType[] = ["checked-in", "confirmed", "cancelled"];
    return isManualCheckin ? baseStatuses : [...baseStatuses, "success"];
  };

  const handleStatusChange = (newStatus: StatusType) => {
    if (status === "cancelled" || status === "success") return;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsMenuOpen(false);
  };

  const { background, icon } = getStatusStyles(status);

  return (
    <div className="relative">
      <div
        onClick={() =>
          status !== "cancelled" &&
          status !== "success" &&
          setIsMenuOpen(!isMenuOpen)
        }
        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
          status === "cancelled" || status === "success"
            ? "cursor-not-allowed"
            : "hover:opacity-80"
        }`}
        style={{ backgroundColor: background }}
      >
        {icon}
      </div>

      {isMenuOpen && status !== "cancelled" && status !== "success" && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {getAvailableStatuses()
              .filter((statusOption) => statusOption !== status) // Don't show current status
              .map((statusOption) => {
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
                      .split("-")
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
