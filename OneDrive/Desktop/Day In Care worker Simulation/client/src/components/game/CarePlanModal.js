import React from 'react';

const CarePlanModal = ({ carePlan, onClose }) => {
  if (!carePlan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-900">Care Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-primary-50 border-l-4 border-primary-600 p-4">
            <h3 className="font-bold text-lg text-primary-900">{carePlan.client_name}</h3>
            <p className="text-primary-700">Age: {carePlan.age}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
            <p className="text-gray-700">{carePlan.diagnosis}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Care Needs</h4>
            <p className="text-gray-700">{carePlan.care_needs}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Communication Needs</h4>
            <p className="text-gray-700">{carePlan.communication_needs}</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Risk Assessment</h4>
            <p className="text-amber-800">{carePlan.risk_assessment}</p>
          </div>

          {carePlan.allergies && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-900 mb-2">🚨 Allergies</h4>
              <p className="text-red-800">{carePlan.allergies}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Medication</h4>
            <p className="text-gray-700 whitespace-pre-line">{carePlan.medication}</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Close Care Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarePlanModal;
