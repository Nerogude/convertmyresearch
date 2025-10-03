import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isLearner, isManager, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">A Day in Care</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-2">
            {isLearner && 'Start your training scenarios below'}
            {isManager && 'Manage your team and monitor progress'}
            {isAdmin && 'Manage your organization and monitor all users'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Learner Options */}
          {isLearner && (
            <>
              <div
                onClick={() => navigate('/shift-schedule')}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Training</h3>
                <p className="text-gray-600">Begin your scenario-based training sessions</p>
              </div>

              <div
                onClick={() => navigate('/my-progress')}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Progress</h3>
                <p className="text-gray-600">View your completed scenarios and performance</p>
              </div>
            </>
          )}

          {/* Manager/Admin Options */}
          {(isManager || isAdmin) && (
            <>
              <div
                onClick={() => navigate('/team-performance')}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Team Performance</h3>
                <p className="text-gray-600">Monitor your team's training progress</p>
              </div>

              <div
                onClick={() => navigate('/create-user')}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">➕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Add User</h3>
                <p className="text-gray-600">Create new learner or manager accounts</p>
              </div>
            </>
          )}

          {/* Organization Overview (Admin only) */}
          {isAdmin && (
            <div
              onClick={() => navigate('/organization')}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Organization</h3>
              <p className="text-gray-600">View organization overview and statistics</p>
            </div>
          )}

          {/* Resources (All users) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Resources</h3>
            <p className="text-gray-600">Access training materials and documentation</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon</p>
          </div>
        </div>

        {/* Organization Info */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Organization:</p>
              <p className="font-semibold text-gray-900">{user?.organizationName}</p>
            </div>
            <div>
              <p className="text-gray-600">Your Role:</p>
              <p className="font-semibold text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
