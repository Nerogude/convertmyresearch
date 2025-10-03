import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarioAPI } from '../../api/api';
import StatusMeter from './StatusMeter';
import { useAuth } from '../../context/AuthContext';

const ShiftSchedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wellbeing, setWellbeing] = useState(50);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scenariosRes, completedRes] = await Promise.all([
        scenarioAPI.getAll(),
        scenarioAPI.getCompleted(),
      ]);

      setScenarios(scenariosRes.data);
      setCompleted(completedRes.data);

      // Calculate average wellbeing from completed scenarios
      if (completedRes.data.length > 0) {
        const avgWellbeing = completedRes.data.reduce((sum, s) => sum + s.wellbeing, 0) / completedRes.data.length;
        setWellbeing(Math.round(avgWellbeing));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      setLoading(false);
    }
  };

  const startScenario = async (scenarioId) => {
    try {
      const response = await scenarioAPI.startScenario(scenarioId);
      navigate(`/scenario/${scenarioId}`, { state: { progressId: response.data.progressId } });
    } catch (error) {
      console.error('Error starting scenario:', error);
      alert('Failed to start scenario. Please try again.');
    }
  };

  const isCompleted = (scenarioId) => {
    return completed.some((c) => c.title === scenarios.find((s) => s.id === scenarioId)?.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">A Day in Care</h1>
            <p className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} - Today's Shift
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Scenario List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Visits</h2>

              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <div
                    key={scenario.id}
                    className={`border rounded-lg p-4 ${
                      isCompleted(scenario.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Visit {index + 1} • {scenario.estimated_time} minutes
                          </span>
                          {isCompleted(scenario.id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{scenario.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded">
                            {scenario.module}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                            {scenario.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => startScenario(scenario.id)}
                        className="ml-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors whitespace-nowrap"
                      >
                        {isCompleted(scenario.id) ? 'Retry Visit' : 'Start Visit'}
                      </button>
                    </div>
                  </div>
                ))}

                {scenarios.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No scenarios available yet. Check back soon!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wellbeing Meter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Wellbeing</h3>
              <StatusMeter label="Stress Level" value={wellbeing} type="wellbeing" />
            </div>

            {/* Today's Focus */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Today's Focus</h3>
              <p className="text-sm text-gray-600">
                Practice critical thinking and person-centered care in each scenario. There's rarely just one "right" answer.
              </p>
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Progress</h3>
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  Completed Scenarios: <span className="font-semibold">{completed.length}</span>
                </p>
                <p>
                  Available Scenarios: <span className="font-semibold">{scenarios.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSchedule;
