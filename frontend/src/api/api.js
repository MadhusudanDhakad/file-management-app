import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
//   login: (email, password) => api.post('/login/', { email, password }),
    login: async (email, password) => {
        try {
        const response = await api.post('/login/', { email, password });
        console.log('Login response:', response.data);
        return response;
        } catch (error) {
        console.error('Login error:', error.response);
        throw error;
        }
    },
    register: (userData) => api.post('/register/', userData),
};

export const profileService = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (profileData) => api.put('/profile/', profileData),
};

export const addressService = {
  getAddresses: () => api.get('/addresses/'),
  createAddress: (addressData) => api.post('/addresses/', addressData),
  updateAddress: (id, addressData) => api.put(`/addresses/${id}/`, addressData),
  deleteAddress: (id) => api.delete(`/addresses/${id}/`),
};

export const fileService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getFiles: () => api.get('/files/'),
  downloadFile: (id) => api.get(`/files/${id}/download/`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}/`),
};

export const dashboardService = {
  getDashboardData: () => api.get('/dashboard/'),
};