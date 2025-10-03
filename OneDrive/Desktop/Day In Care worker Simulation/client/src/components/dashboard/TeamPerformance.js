import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../../api/api';

const TeamPerformance = () => {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDetails, setLearnerDetails] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const response = await analyticsAPI.getTeamPerformance();
      setTeamData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading team data:', error);
      setLoading(false);
    }
  };

  const loadLearnerDetails = async (learnerId) => {
    try {
      const response = await analyticsAPI.getLearnerReport(learnerId);
      setLearnerDetails(response.data);
      setSelectedLearner(learnerId);
    } catch (error) {
      console.error('Error loading learner details:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading team data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Performance</h1>

        {/* Team Overview Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenarios Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Best Practice %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Client Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamData.map((learner) => {
                const bestPracticePercent = learner.totalDecisions > 0
                  ? Math.round((learner.bestPracticeDecisions / learner.totalDecisions) * 100)
                  : 0;

                return (
                  <tr key={learner.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                      <div className="text-sm text-gray-500">{learner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{learner.scenariosCompleted}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bestPracticePercent}%
                        <span className="text-xs text-gray-500 ml-1">
                          ({learner.bestPracticeDecisions}/{learner.totalDecisions})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {learner.avgClientStatus || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {learner.lastLogin ? new Date(learner.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => loadLearnerDetails(learner.userId)}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {teamData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No learners in your organization yet. Add users from the dashboard.
            </div>
          )}
        </div>

        {/* Learner Details Modal */}
        {selectedLearner && learnerDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{learnerDetails.learner.name}</h2>
                  <p className="text-sm text-gray-600">{learnerDetails.learner.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedLearner(null);
                    setLearnerDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Completed Scenarios</h3>

                {learnerDetails.scenarios.length === 0 ? (
                  <p className="text-gray-500">No scenarios completed yet.</p>
                ) : (
                  <div className="space-y-4">
                    {learnerDetails.scenarios.map((scenario, index) => {
                      const bestPracticePercent = scenario.total_decisions > 0
                        ? Math.round((parseInt(scenario.best_practice_count) / parseInt(scenario.total_decisions)) * 100)
                        : 0;

                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{scenario.title}</h4>
                              <p className="text-sm text-gray-600">{scenario.module}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Completed</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(scenario.completed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-600">Client Status</p>
                              <p className="text-lg font-bold text-gray-900">{scenario.client_status}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Wellbeing</p>
                              <p className="text-lg font-bold text-gray-900">{scenario.wellbeing}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Best Practice</p>
                              <p className="text-lg font-bold text-green-600">{bestPracticePercent}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Total Decisions</p>
                              <p className="text-lg font-bold text-gray-900">{scenario.total_decisions}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setSelectedLearner(null);
                    setLearnerDetails(null);
                  }}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;
