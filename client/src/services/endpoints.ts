import api from './api';

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleLogin: (data: { email: string; name: string; googleId: string; avatar?: string }) =>
    api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) => api.get(`/auth/verify/${token}`),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.delete('/auth/account'),
};

export const plantService = {
  getPlants: (params?: Record<string, string>) => api.get('/plants', { params }),
  getPlant: (id: string) => api.get(`/plants/${id}`),
  createPlant: (data: FormData) => api.post('/plants', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePlant: (id: string, data: FormData) => api.put(`/plants/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePlant: (id: string) => api.delete(`/plants/${id}`),
  getStats: () => api.get('/plants/stats'),
  waterPlant: (id: string) => api.post(`/plants/${id}/water`),
};

export const aiService = {
  detectDisease: (data: FormData) => api.post('/ai/detect-disease', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTreatment: (data: { disease: string; plantType?: string }) => api.post('/ai/treatment', data),
  getFertilizer: (data: Record<string, string>) => api.post('/ai/fertilizer', data),
  getDosimeter: (data: Record<string, unknown>) => api.post('/ai/dosimeter', data),
  compareRecovery: (data: FormData) => api.post('/ai/compare-recovery', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getWaterSchedule: (data: Record<string, string>) => api.post('/ai/water-schedule', data),
};

export const chatService = {
  getConversations: () => api.get('/chat'),
  getConversation: (id: string) => api.get(`/chat/${id}`),
  sendMessage: (data: FormData) => api.post('/chat', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteConversation: (id: string) => api.delete(`/chat/${id}`),
};

export const weatherService = {
  getCurrent: (location?: string) => api.get('/weather/current', { params: { location } }),
  getForecast: (location?: string) => api.get('/weather/forecast', { params: { location } }),
};

export const reportService = {
  getReports: (params?: Record<string, string>) => api.get('/reports', { params }),
  getReport: (id: string) => api.get(`/reports/${id}`),
  downloadReport: (id: string) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id: string) => api.delete(`/reports/${id}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

export const growthService = {
  getRecords: (plantId: string) => api.get(`/growth/plant/${plantId}`),
  addRecord: (data: FormData) => api.post('/growth', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteRecord: (id: string) => api.delete(`/growth/${id}`),
};

export const diseaseService = {
  getDiseases: (params?: Record<string, string>) => api.get('/diseases', { params }),
  getDisease: (id: string) => api.get(`/diseases/${id}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: Record<string, string>) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

export const uploadService = {
  uploadImage: (data: FormData) => api.post('/upload/image', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const outbreakService = {
  getOutbreaks: () => api.get('/outbreaks'),
};
