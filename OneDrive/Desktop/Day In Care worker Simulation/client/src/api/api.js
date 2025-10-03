import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  registerOrganization: (data) => api.post('/auth/register-organization', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  createUser: (data) => api.post('/auth/create-user', data),
};

// Scenario endpoints
export const scenarioAPI = {
  getAll: () => api.get('/scenarios'),
  getById: (id) => api.get(`/scenarios/${id}`),
  startScenario: (id) => api.post(`/scenarios/${id}/start`),
  makeDecision: (progressId, choiceId) =>
    api.post(`/scenarios/progress/${progressId}/decide`, { choiceId }),
  getProgress: (progressId) => api.get(`/scenarios/progress/${progressId}`),
  getCompleted: () => api.get('/scenarios/user/completed'),
};

// Analytics endpoints
export const analyticsAPI = {
  getTeamPerformance: () => api.get('/analytics/team-performance'),
  getLearnerReport: (learnerId) => api.get(`/analytics/learner/${learnerId}`),
  getOrganizationOverview: () => api.get('/analytics/organization-overview'),
};

export default api;
