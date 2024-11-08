import React, { useState } from 'react';
import { Check, Clock, X, UserCheck, CheckCircle } from 'lucide-react';
import { StatusType } from '../../redux/slices/scheduleSlice';

interface StatusCircleProps {
  status: StatusType;
  onStatusChange?: (newStatus: StatusType) => void;
}

const StatusCircle: React.FC<StatusCircleProps> = ({ status, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusStyles = (statusType: StatusType) => {
    switch (statusType) {
      case 'completed':
        return {
          background: '#34A85A',
          icon: <Check className="w-5 h-5 text-white" />
        };
      case 'check-in':
        return {
          background: '#4567b7',
          icon: <UserCheck className="w-5 h-5 text-white" /> // Import UserCheck from lucide-react
        };
      case 'pending':
        return {
          background: '#FFB800',
          icon: <Clock className="w-5 h-5 text-white" />
        };
      case 'cancelled':
        return {
          background: '#FF4747',
          icon: <X className="w-5 h-5 text-white" />
        };
      case 'confirm':
        return {
          background: '#9333ea',
          icon: <CheckCircle className="w-5 h-5 text-white" /> // Import CheckCircle from lucide-react
        };
    }
  };

  const handleStatusChange = (newStatus: StatusType) => {
    if (status === 'cancelled') return;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsMenuOpen(false);
  };

  const { background, icon } = getStatusStyles(status);

  return (
    <div className="relative">
      <div
        onClick={() => status !== 'cancelled' && setIsMenuOpen(!isMenuOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
          status === 'cancelled' ? 'cursor-not-allowed' : 'hover:opacity-80'
        }`}
        style={{ backgroundColor: background }}
      >
        {icon}
      </div>

      {isMenuOpen && status !== 'cancelled' && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {['completed', 'pending', 'cancelled'].map((statusOption) => {
              const styles = getStatusStyles(statusOption as StatusType);
              return (
                <button
                  key={statusOption}
                  className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    statusOption === status ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleStatusChange(statusOption as StatusType)}
                >
                  <div
                    className="w-5 h-5 rounded-full mr-3 flex items-center justify-center"
                    style={{ backgroundColor: styles.background }}
                  >
                    {styles.icon}
                  </div>
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
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