import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EndOfShiftReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { scenario, decisionHistory, finalClientStatus, finalWellbeing } = location.state || {};

  if (!scenario || !decisionHistory) {
    navigate('/shift-schedule');
    return null;
  }

  const bestPracticeCount = decisionHistory.filter((d) => d.isBestPractice).length;
  const validAlternativeCount = decisionHistory.filter((d) => d.isValidAlternative).length;
  const suboptimalCount = decisionHistory.filter((d) => !d.isBestPractice && !d.isValidAlternative).length;

  const getClientOutcome = () => {
    if (finalClientStatus >= 70) return { text: 'Excellent', color: 'text-green-700', bg: 'bg-green-50' };
    if (finalClientStatus >= 40) return { text: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { text: 'Needs Improvement', color: 'text-red-700', bg: 'bg-red-50' };
  };

  const getWellbeingOutcome = () => {
    if (finalWellbeing >= 70) return { text: 'Well Managed', color: 'text-green-700', bg: 'bg-green-50' };
    if (finalWellbeing >= 40) return { text: 'Moderate Stress', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { text: 'High Stress', color: 'text-red-700', bg: 'bg-red-50' };
  };

  const clientOutcome = getClientOutcome();
  const wellbeingOutcome = getWellbeingOutcome();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-700 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">End of Shift Report</h1>
            <p className="text-primary-100 mt-1">{scenario.title}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Section 1: Client Wellbeing Summary */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Outcome</h2>
              <div className={`${clientOutcome.bg} border-l-4 border-${clientOutcome.color.split('-')[1]}-500 p-6 rounded-r-lg`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Final Client Status</h3>
                    <p className={`text-3xl font-bold ${clientOutcome.color} mt-2`}>{clientOutcome.text}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-3xl font-bold text-gray-900">{finalClientStatus}/100</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  {finalClientStatus >= 70
                    ? 'The client received excellent care and finished the interaction in a positive state.'
                    : finalClientStatus >= 40
                    ? 'The client received adequate care, though there were some areas that could have been handled better.'
                    : 'The client experienced significant distress during this interaction. Review the feedback below to understand what could have been done differently.'}
                </p>
              </div>
            </section>

            {/* Section 2: Key Learning Moments */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Learning Moments</h2>
              <div className="space-y-4">
                {decisionHistory.map((decision, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-r-lg ${
                      decision.isBestPractice
                        ? 'bg-green-50 border-green-500'
                        : decision.isValidAlternative
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-amber-50 border-amber-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {decision.isBestPractice ? '✓' : decision.isValidAlternative ? 'ℹ' : '⚠'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">Decision {index + 1}:</p>
                        <p className="text-gray-800 mb-2 italic">"{decision.choice}"</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              decision.isBestPractice
                                ? 'bg-green-200 text-green-900'
                                : decision.isValidAlternative
                                ? 'bg-blue-200 text-blue-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {decision.isBestPractice
                              ? 'Best Practice'
                              : decision.isValidAlternative
                              ? 'Valid Alternative'
                              : 'Suboptimal Choice'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{decision.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Professional Practice Review */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Practice Review</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{bestPracticeCount}</div>
                    <p className="text-sm text-gray-600 mt-1">Best Practice Decisions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{validAlternativeCount}</div>
                    <p className="text-sm text-gray-600 mt-1">Valid Alternative Approaches</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-600">{suboptimalCount}</div>
                    <p className="text-sm text-gray-600 mt-1">Learning Opportunities</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
                  <p className="text-gray-700">
                    {bestPracticeCount === decisionHistory.length
                      ? 'Outstanding work! You demonstrated excellent clinical judgment and person-centered care throughout this scenario.'
                      : bestPracticeCount >= decisionHistory.length / 2
                      ? 'Good work overall. You made mostly sound decisions and showed good understanding of care principles.'
                      : 'This scenario highlighted some important learning opportunities. Review the feedback carefully to strengthen your practice.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Your Wellbeing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Wellbeing</h2>
              <div className={`${wellbeingOutcome.bg} border-l-4 border-${wellbeingOutcome.color.split('-')[1]}-500 p-6 rounded-r-lg`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Stress Management</h3>
                    <p className={`text-2xl font-bold ${wellbeingOutcome.color} mt-2`}>{wellbeingOutcome.text}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Wellbeing Score</p>
                    <p className="text-2xl font-bold text-gray-900">{finalWellbeing}/100</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {finalWellbeing >= 70
                    ? 'You managed this challenging situation while maintaining your own wellbeing. This is excellent self-care awareness.'
                    : finalWellbeing >= 40
                    ? 'This scenario created some stress. Remember to debrief with colleagues and practice self-care.'
                    : 'This was a particularly challenging situation that affected your wellbeing. It\'s important to seek support from your supervisor and take time for self-care.'}
                </p>
                <div className="bg-white bg-opacity-50 rounded p-3 text-sm text-gray-700">
                  <p className="font-semibold mb-1">Remember:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Difficult interactions are part of care work</li>
                    <li>Always debrief after challenging situations</li>
                    <li>Seek supervision when you need support</li>
                    <li>Self-care is essential, not optional</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-8 py-6 flex gap-4">
            <button
              onClick={() => navigate('/shift-schedule')}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Return to Shift Schedule
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This report is saved to your training record</p>
        </div>
      </div>
    </div>
  );
};

export default EndOfShiftReport;
