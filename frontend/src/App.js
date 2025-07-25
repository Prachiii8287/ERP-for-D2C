// frontend/src/App.js - COMPLETE VERSION WITH ROUTING
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { getCurrentUser } from './store/authSlice';

// Import components
import AuthPage from './component/AuthPage';
import CompanyDashboard from './component/CompanyDashboard';
import AdminDashboard from './component/AdminDashboard';
import EmployeeDashboard from './component/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import OrderPage from './component/OrderPage';

// Import new components we'll create
import Layout from './component/Layout';
import AdminUsersPage from './component/AdminUsersPage';
import EmployeesPage from './component/EmployeesPage';
import AddEmployee from './component/AddEmployeeForm';
import Departments from './component/Departments';
import ShopifyDashboard from './component/ShopifyDashboard';
import CustomerPage from './component/CustomerPage';
import ProductPage from './component/ProductPage';
import ShopifyLayout from './component/ShopifyLayout';
import AddProducts from './component/AddProducts';
import VariantPage from './component/VariantPage';
import CategoriesPage from './component/CategoriesPage';
// import ProjectsPage from './component/ProjectsPage';
// import TimesheetsPage from './component/TimesheetsPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem('authToken');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (localStorage.getItem('showLoginToast')) {
      toast.success('You are logged in successfully!');
      localStorage.removeItem('showLoginToast');
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          background: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/shopify-dashboard" replace />
            ) : (
              <AuthPage />
            )
          } 
        />
        
        {/* Shopify Dashboard Route (no Layout/sidebar) */}
        <Route path="/shopify-dashboard" element={<ProtectedRoute><ShopifyDashboard /></ProtectedRoute>} />
        
        {/* Shopify-related routes with ShopifySidebar */}
        <Route path="/" element={<ProtectedRoute><ShopifyLayout /></ProtectedRoute>}>
          <Route path="products" element={<ProductPage />} />
          <Route path="products/add" element={<AddProducts />} />
          <Route path="products/edit/:id" element={<AddProducts />} />
          <Route path="products/:id/variants" element={<VariantPage />} />
          <Route path="products/categories" element={<CategoriesPage />} />
          <Route path="customers" element={<CustomerPage />} />
        </Route>

        {/* Protected Routes with main Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Company Owner Routes */}
          <Route path="company-dashboard" element={<CompanyDashboard />} />
          <Route path="admin-users" element={<AdminUsersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/new" element={<AddEmployee />} />
          <Route path="orders" element={<OrderPage />} />

          {/* Departments Route (shared by Parent and Admin) */}
          <Route path="departments" element={<Departments />} />
          {/* Projects Route */}
          {/* <Route path="projects" element={<ProjectsPage />} /> */}
          {/* Timesheet Route */}
          {/* <Route path="timesheet" element={<TimesheetsPage />} /> */}
          
          {/* Admin/Employee Routes */}
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
        </Route>


        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      {/* ToastContainer for global toasts */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable={false}
        newestOnTop
        rtl={false}
        limit={3}
      />
      <AppContent />
    </Provider>
  );
}

export default App;