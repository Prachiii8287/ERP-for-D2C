// frontend/src/services/api.js
import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/authSlice';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

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

// Customer API calls
export const customerAPI = {
  getCustomers: () => apiClient.get('/companies/api/customers/'),
  syncShopifyCustomers: () => apiClient.post('/companies/api/customers/sync-shopify/'),
  pushCustomerToShopify: (customerId) => apiClient.post(`/companies/api/customers/${customerId}/push_to_shopify/`),
  updateCustomer: (customerId, data) => apiClient.put(`/companies/api/customers/${customerId}/`, data),
};

// Company API calls
export const companyAPI = {
  getCompanyProfile: (companyId) => apiClient.get(`/companies/api/companies/${companyId}/`),
  updateCompany: (companyId, data) => apiClient.patch(`/companies/api/companies/${companyId}/`, data),
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
  connectShopify: (credentials) => apiClient.post('/companies/api/connect-shopify/', credentials),
  updateAdminUser: (userId, data) => apiClient.patch(`/companies/api/admin-users/${userId}/`, data),
};

// Employee API calls
export const employeeAPI = {
  getEmployees: () => apiClient.get('/employees/api/employees/'),
  createEmployee: (employeeData) => apiClient.post('/employees/api/employees/', employeeData),
  getEmployee: (employeeId) => apiClient.get(`/employees/api/employees/${employeeId}/`),
  updateEmployee: (employeeId, data) => apiClient.patch(`/employees/api/employees/${employeeId}/`, data),
  deleteEmployee: (employeeId) => apiClient.delete(`/employees/api/employees/${employeeId}/`),
};

// Product API calls
export const productsAPI = {
  // Products
  getProducts: () => apiClient.get('/api/products/'),
  getProduct: (id) => apiClient.get(`/api/products/${id}/`),
  createProduct: (data) => apiClient.post('/api/products/', data),
  updateProduct: (id, data) => apiClient.patch(`/api/products/${id}/`, data),
  deleteProduct: (id) => apiClient.delete(`/api/products/${id}/`),
  syncShopifyProducts: () => apiClient.post('/api/products/sync_shopify/'),
  pushProductToShopify: async (productId) => {
    try {
      const response = await apiClient.post(`/api/products/${productId}/push_to_shopify/`);
      return response.data; // This will contain {success: true/false, error: string}
    } catch (error) {
      if (error.response?.data) {
        return error.response.data; // Return the error response from the server
      }
      return { success: false, error: error.message || 'Failed to push product to Shopify' };
    }
  },

  // Categories
  getCategories: () => apiClient.get('/api/categories/'),
  createCategory: (data) => apiClient.post('/api/categories/', data),
  updateCategory: (id, data) => apiClient.patch(`/api/categories/${id}/`, data),
  deleteCategory: (id) => apiClient.delete(`/api/categories/${id}/`),

  // Vendors
  getVendors: () => apiClient.get('/api/vendors/'),
  createVendor: (data) => apiClient.post('/api/vendors/', data),
  updateVendor: (id, data) => apiClient.patch(`/api/vendors/${id}/`, data),
  deleteVendor: (id) => apiClient.delete(`/api/vendors/${id}/`),

  // Variants
  getVariants: () => apiClient.get('/api/variants/'),
  getVariant: (id) => apiClient.get(`/api/variants/${id}/`),
  createVariant: (data) => apiClient.post('/api/variants/', data),
  updateVariant: (id, data) => apiClient.patch(`/api/variants/${id}/`, data),
  deleteVariant: (id) => apiClient.delete(`/api/variants/${id}/`),
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