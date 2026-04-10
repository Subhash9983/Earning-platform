import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const fetchJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const fetchMyJobs = async () => {
  const response = await api.get('/jobs/business/my');
  return response.data;
};

export const postJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const applyForJob = async (jobId) => {
  const response = await api.post('/applications', { jobId });
  return response.data;
};

export const fetchApplicants = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const fetchStudentProfileById = async (studentId) => {
  const response = await api.get(`/auth/public-student/${studentId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const fetchStudentStats = async () => {
  const response = await api.get('/applications/stats/student');
  return response.data;
};

export const fetchBusinessStats = async () => {
  const response = await api.get('/jobs/stats/business');
  return response.data;
};

export const updateApplicationStatus = async (appId, status) => {
  const response = await api.put(`/applications/${appId}/status`, { status });
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const fetchReviews = async (studentId) => {
  const { data } = await api.get(`/reviews/student/${studentId}`);
  return data;
};

export const fetchStudents = async () => {
    const { data } = await api.get('/auth/students');
    return data;
};

export const fetchGlobalStats = async () => {
    const { data } = await api.get('/stats');
    return data;
};

export const fetchPublicStudents = async () => {
    const { data } = await api.get('/public/students');
    return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await api.delete(`/jobs/${jobId}`);
  return data;
};

export const fetchMyApplications = async () => {
  const { data } = await api.get('/applications/my');
  return data;
};

export const fetchNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const sendNotification = async (notifData) => {
  const { data } = await api.post('/notifications', notifData);
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};

export const sendOffer = async (offerData) => {
  const { data } = await api.post('/applications/offer', offerData);
  return data;
};

export const fetchInvitations = async () => {
  const { data } = await api.get('/applications/invitations');
  return data;
};

export const fetchAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export default api;
