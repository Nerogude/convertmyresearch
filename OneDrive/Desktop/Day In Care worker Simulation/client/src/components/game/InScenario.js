import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { scenarioAPI } from '../../api/api';
import StatusMeter from './StatusMeter';
import CarePlanModal from './CarePlanModal';

const InScenario = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [scenario, setScenario] = useState(null);
  const [carePlan, setCarePlan] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const [clientStatus, setClientStatus] = useState(50);
  const [wellbeing, setWellbeing] = useState(50);
  const [progressId, setProgressId] = useState(null);
  const [showCarePlan, setShowCarePlan] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenario();
  }, [scenarioId]);

  const loadScenario = async () => {
    try {
      const response = await scenarioAPI.getById(scenarioId);
      const { scenario, carePlan, nodes, choices } = response.data;

      setScenario(scenario);
      setCarePlan(carePlan);
      setNodes(nodes);
      setChoices(choices);
      setProgressId(location.state?.progressId);
      setLoading(false);
    } catch (error) {
      console.error('Error loading scenario:', error);
      alert('Failed to load scenario');
      navigate('/shift-schedule');
    }
  };

  const getCurrentNode = () => {
    return nodes.find((n) => n.node_key === currentNodeKey);
  };

  const getCurrentChoices = () => {
    const currentNode = getCurrentNode();
    if (!currentNode) return [];

    return choices.filter((c) => c.parent_node_key === currentNodeKey);
  };

  const makeDecision = async (choiceId) => {
    try {
      setFeedback(null);

      const response = await scenarioAPI.makeDecision(progressId, choiceId);
      const { nextNodeKey, clientStatus: newClientStatus, wellbeing: newWellbeing, isEnding, feedback: choiceFeedback, isBestPractice, isValidAlternative } = response.data;

      // Update meters
      setClientStatus(newClientStatus);
      setWellbeing(newWellbeing);

      // Show feedback
      setFeedback({
        text: choiceFeedback,
        isBestPractice,
        isValidAlternative,
      });

      // Record decision
      const choice = getCurrentChoices().find((c) => c.id === choiceId);
      setDecisionHistory((prev) => [...prev, { choice: choice.choice_text, feedback: choiceFeedback, isBestPractice, isValidAlternative }]);

      // Wait for user to read feedback before continuing
      setTimeout(() => {
        setFeedback(null);
        setCurrentNodeKey(nextNodeKey);

        // If it's the ending, navigate to results
        if (isEnding) {
          setTimeout(() => {
            navigate('/end-of-shift', {
              state: {
                scenario,
                decisionHistory: [...decisionHistory, { choice: choice.choice_text, feedback: choiceFeedback, isBestPractice, isValidAlternative }],
                finalClientStatus: newClientStatus,
                finalWellbeing: newWellbeing,
              },
            });
          }, 2000);
        }
      }, 3000);
    } catch (error) {
      console.error('Error making decision:', error);
      alert('Failed to record decision. Please try again.');
    }
  };

  if (loading || !scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading scenario...</div>
      </div>
    );
  }

  const currentNode = getCurrentNode();
  const currentChoices = getCurrentChoices();

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Scenario error. Returning to shift schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-lg font-bold text-primary-900">{scenario.title}</h1>
              <p className="text-sm text-gray-600">{scenario.module}</p>
            </div>
          </div>

          {/* Meters */}
          <div className="grid grid-cols-2 gap-4">
            <StatusMeter label="Client Status" value={clientStatus} type="client" />
            <StatusMeter label="Your Wellbeing" value={wellbeing} type="wellbeing" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Scenario Text */}
          <div className="mb-8">
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{currentNode.content}</p>
            </div>
          </div>

          {/* Feedback Display */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 ${
                feedback.isBestPractice
                  ? 'bg-green-50 border-green-500'
                  : feedback.isValidAlternative
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-amber-50 border-amber-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">
                  {feedback.isBestPractice ? '✓' : feedback.isValidAlternative ? 'ℹ' : '⚠'}
                </span>
                <div>
                  <p
                    className={`font-semibold ${
                      feedback.isBestPractice
                        ? 'text-green-900'
                        : feedback.isValidAlternative
                        ? 'text-blue-900'
                        : 'text-amber-900'
                    }`}
                  >
                    {feedback.isBestPractice
                      ? 'Best Practice'
                      : feedback.isValidAlternative
                      ? 'Valid Alternative'
                      : 'Consider This'}
                  </p>
                  <p
                    className={`text-sm ${
                      feedback.isBestPractice
                        ? 'text-green-800'
                        : feedback.isValidAlternative
                        ? 'text-blue-800'
                        : 'text-amber-800'
                    }`}
                  >
                    {feedback.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question */}
          {currentNode.question && !currentNode.is_ending && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{currentNode.question}</h2>
            </div>
          )}

          {/* Choices */}
          {!currentNode.is_ending && currentChoices.length > 0 && !feedback && (
            <div className="space-y-3">
              {currentChoices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => makeDecision(choice.id)}
                  className="w-full text-left px-6 py-4 bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-400 rounded-lg transition-all font-medium text-gray-900"
                >
                  {choice.choice_text}
                </button>
              ))}
            </div>
          )}

          {/* Ending Message */}
          {currentNode.is_ending && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Preparing your End of Shift Report...</p>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar - Care Kit */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setShowCarePlan(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              View Care Plan
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit this scenario? Your progress will be lost.')) {
                navigate('/shift-schedule');
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Exit Scenario
          </button>
        </div>
      </footer>

      {/* Care Plan Modal */}
      {showCarePlan && <CarePlanModal carePlan={carePlan} onClose={() => setShowCarePlan(false)} />}
    </div>
  );
};

export default InScenario;
