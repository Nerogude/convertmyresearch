import React from 'react';

const StatusMeter = ({ label, value, type = 'default' }) => {
  const getColor = () => {
    if (type === 'client') {
      if (value >= 70) return 'bg-care-green';
      if (value >= 40) return 'bg-care-amber';
      return 'bg-care-red';
    }
    if (type === 'wellbeing') {
      if (value >= 70) return 'bg-care-green';
      if (value >= 40) return 'bg-care-amber';
      return 'bg-care-red';
    }
    return 'bg-primary-600';
  };

  const getStatus = () => {
    if (value >= 70) return 'Good';
    if (value >= 40) return 'Moderate';
    return 'Critical';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{getStatus()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <div className="mt-1 text-right">
        <span className="text-xs text-gray-500">{value}/100</span>
      </div>
    </div>
  );
};

export default StatusMeter;
