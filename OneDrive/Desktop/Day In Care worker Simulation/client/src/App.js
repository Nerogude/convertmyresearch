import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard components
import Dashboard from './components/dashboard/Dashboard';
import TeamPerformance from './components/dashboard/TeamPerformance';

// Game components
import ShiftSchedule from './components/game/ShiftSchedule';
import InScenario from './components/game/InScenario';
import EndOfShiftReport from './components/game/EndOfShiftReport';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Learner routes */}
            <Route
              path="/shift-schedule"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <ShiftSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scenario/:scenarioId"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <InScenario />
                </ProtectedRoute>
              }
            />
            <Route
              path="/end-of-shift"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <EndOfShiftReport />
                </ProtectedRoute>
              }
            />

            {/* Manager/Admin routes */}
            <Route
              path="/team-performance"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <TeamPerformance />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
