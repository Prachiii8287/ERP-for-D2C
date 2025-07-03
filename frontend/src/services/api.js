// frontend/src/services/api.js
import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/authSlice';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      store.dispatch(logout());
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => apiClient.post('/accounts/api/token/', credentials),
  register: (userData) => apiClient.post('/accounts/api/register/', userData),
  logout: (refreshToken) => apiClient.post('/accounts/api/token/blacklist/', { refresh: refreshToken }),
  getCurrentUser: () => apiClient.get('/accounts/api/user/'),
  updateProfile: (userData) => apiClient.patch('/accounts/api/user/', userData),
};

// Company API calls
export const companyAPI = {
  getCompanyProfile: (companyId) => apiClient.get(`/companies/api/profile/${companyId}/`),
  updateCompany: (companyId, data) => apiClient.patch(`/companies/api/profile/${companyId}/`, data),
  registerCompany: (companyData) => apiClient.post('/companies/api/register/', companyData),
  
  // Departments
  getDepartments: () => apiClient.get('/companies/api/departments/'),
  createDepartment: (departmentData) => apiClient.post('/companies/api/departments/', departmentData),
  updateDepartment: (deptId, data) => apiClient.patch(`/companies/api/departments/${deptId}/`, data),
  deleteDepartment: (deptId) => apiClient.delete(`/companies/api/departments/${deptId}/`),
  
  // Admin Users
  getAdminUsers: () => apiClient.get('/companies/api/admin-users/'),
  createAdminUser: (userData) => apiClient.post('/companies/api/admin-users/', userData),
  deleteAdminUser: (userId) => apiClient.delete(`/companies/api/admin-users/${userId}/`),
  sendAdminDeleteOTP: (admin_user_id) => apiClient.post('/companies/api/admin-users/send-delete-otp/', { admin_user_id }),
  verifyAdminDeleteOTP: (admin_user_id, otp) => apiClient.post('/companies/api/admin-users/verify-delete-otp/', { admin_user_id, otp }),
  sendUserDeleteOTP: (target_user_id) =>
    apiClient.post('/companies/api/users/send-delete-otp/', { target_user_id }),
  verifyUserDeleteOTP: (target_user_id, otp) =>
    apiClient.post('/companies/api/users/verify-delete-otp/', { target_user_id, otp }),
};

// Employee API calls
export const employeeAPI = {
  getEmployees: () => apiClient.get('/employees/api/employees/'),
  createEmployee: (employeeData) => apiClient.post('/employees/api/employees/', employeeData),
  getEmployee: (employeeId) => apiClient.get(`/employees/api/employees/${employeeId}/`),
  updateEmployee: (employeeId, data) => apiClient.patch(`/employees/api/employees/${employeeId}/`, data),
  deleteEmployee: (employeeId) => apiClient.delete(`/employees/api/employees/${employeeId}/`),
};

// Generic API helper
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return {
      data: null,
      error: error.response?.data?.message || error.message || 'An error occurred'
    };
  }
};

export default apiClient;