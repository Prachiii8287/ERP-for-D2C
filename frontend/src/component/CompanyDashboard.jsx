// frontend/src/component/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Edit, Shield, Users, BarChart3, UserPlus, UserCog, Settings, X, Eye, EyeOff, ShoppingBag, Truck } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanyProfile, fetchAdminUsers, createAdminUser, updateCompanyProfile } from '../store/companySlice';
import { fetchEmployees, createEmployee } from '../store/employeeSlice';
import { fetchDepartments } from '../store/companySlice';
import ShopifyConnectModal from './ShopifyConnectModal';
import ShiprocketConnectModal from './ShiprocketConnectModal';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { user } = useSelector((state) => state.auth);
  const {
    profile: companyData = null,
    loading: companyLoadingRaw = {},
    errors: companyErrorsRaw = {},
    departments = []
  } = useSelector((state) => state.company) || {};

  // Normalise loading/errors which sometimes get overwritten as boolean/null by extra reducers
  const companyLoading =
    typeof companyLoadingRaw === 'object' && companyLoadingRaw !== null
      ? companyLoadingRaw
      : { profile: companyLoadingRaw };
  const companyErrors =
    companyErrorsRaw && typeof companyErrorsRaw === 'object'
      ? companyErrorsRaw
      : { profile: companyErrorsRaw };
  const { employees = [] } = useSelector((state) => state.employees);
  

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
    email: '',
    role: '',
    password: ''
  });
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    registration_number: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    industry: ''
  });
  const [companyModalLoading, setCompanyModalLoading] = useState(false);
  const [companyModalError, setCompanyModalError] = useState('');
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [showShiprocketModal, setShowShiprocketModal] = useState(false);

  useEffect(() => {
    // Only fetch data if user is authenticated and is a parent user
    if (user && user.role === 'PARENT' && user.company) {
      dispatch(fetchCompanyProfile(user.company));
      dispatch(fetchEmployees());
      dispatch(fetchDepartments());
    } else if (user && user.role !== 'PARENT') {
      navigate('/dashboard'); // Redirect non-parent users
    }
  }, [dispatch, user, navigate]);

  // Guard against missing profile data during initial load or refetching
  if (!companyData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading company data...
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '1rem'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gap: '2rem'
    },
    companySection: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '1.6rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    },
    companyName: {
      fontSize: '2.2rem',
      fontWeight: 'bold',
      color: '#343a40',
      marginBottom: '0.5rem'
    },
    companyDetails: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    companyDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6c757d',
      fontSize: '1rem'
    },
    editButton: {
      position: 'absolute',
      top: '2rem',
      right: '2rem',
      backgroundColor: '#7E44EE',
      color: 'white',
      border: '2px solid #7E44EE',
      borderRadius: '8px',
      padding: '0.8rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem'
    },
    statCard: {
      backgroundColor: '#7E44EE',
      color: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(126, 68, 238, 0.3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(126, 68, 238, 0.4)'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    statTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'white'
    },
    statIcon: {
      opacity: 0.9,
      color: 'white'
    },
    statCount: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      lineHeight: 1
    },
    statCTA: {
      color: 'white',
      fontSize: '0.95rem',
      fontWeight: '500',
      opacity: 0.9
    },
    bottomGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem'
    },
    actionBox: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    infoBox: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    boxTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#343a40',
      marginBottom: '1rem'
    },
    infoBoxTitle: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      color: '#343a40',
      marginBottom: '1rem'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
      backgroundColor: '#7E44EE',
      border: '2px solid #7E44EE',
      color: 'white',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    },
    actionButtonHover: {
      backgroundColor: '#6c35cc',
      transform: 'translateX(2px)',
      color: 'white'
    },
    infoGrid: {
      display: 'grid',
      gap: '1rem'
    },
    infoItem: {
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '1rem 1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: '1px solid #e9ecef'
    },
    infoLabel: {
      fontWeight: '600',
      color: '#495057',
      fontSize: '0.95rem',
      flexShrink: 0
    },
    infoValue: {
      color: '#6c757d',
      fontSize: '0.95rem',
      fontWeight: '500',
      opacity: 0.9
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '1.2rem',
      color: '#7E44EE'
    },
    error: {
      color: '#dc3545',
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1.1rem'
    }
  };

  // Modal styles (copied from AdminUsersPage.jsx)
  const modalStyles = {
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: {
      backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    modalHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
    },
    modalTitle: {
      fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0
    },
    closeButton: {
      background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: '#6b7280'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151'
    },
    input: {
      width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.2s ease'
    },
    inputError: {
      borderColor: '#dc2626'
    },
    passwordWrapper: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px'
    },
    errorText: {
      color: '#dc2626', fontSize: '12px', marginTop: '4px'
    },
    modalActions: {
      display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px'
    },
    cancelButton: {
      padding: '12px 24px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
    },
    saveButton: {
      padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: '#7E44EE', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
    }
  };

  // Loading state
  if (companyLoading && companyLoading.profile) {
    return <div style={styles.loading}>Loading company data...</div>;
  }

  // Error state
  if (companyErrors && companyErrors.profile) {
    return <div style={styles.error}>Error: {companyErrors.profile}</div>;
  }

  // No company data
  if (!companyData) {
    return <div style={styles.error}>No company data found</div>;
  }

  // Calculate employee statistics from actual data
  const activeEmployees = employees.filter(emp => emp.is_active).length;
  const totalEmployees = employees.length;

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    console.log('Edit profile clicked');
  };

  const handleAddAdmin = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSaveAdmin = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      company_id: user?.company
    };
    try {
      await dispatch(createAdminUser(payload)).unwrap();
      dispatch(fetchAdminUsers());
      handleCloseModal();
    } catch (error) {
      setFormErrors({ api: error.message || 'Failed to add admin user' });
    }
  };

  const handleAddEmployee = () => {
    setShowEmployeeModal(true);
    dispatch(fetchDepartments());
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEmployeeFormData({
      firstName: '',
      lastName: '',
      department: '',
      phoneNumber: '',
      email: '',
      role: '',
      password: ''
    });
    setEmployeeError('');
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const result = await dispatch(createEmployee({
        first_name: employeeFormData.firstName,
        last_name: employeeFormData.lastName,
        department: employeeFormData.department,
        phone: employeeFormData.phoneNumber,
        email: employeeFormData.email,
        role: employeeFormData.role,
        password: employeeFormData.password,
        company_id: user.company
      })).unwrap();
      dispatch(fetchEmployees());
      handleCloseEmployeeModal();
    } catch (err) {
      setEmployeeError(err?.message || 'Failed to create employee');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleUpdateSettings = () => {
    setCompanyForm({
      name: companyData.name || '',
      registration_number: companyData.registration_number || '',
      website: companyData.website || '',
      phone: companyData.phone || '',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      postal_code: companyData.postal_code || '',
      country: companyData.country || '',
      industry: companyData.industry || ''
    });
    setCompanyModalError('');
    setShowCompanyModal(true);
  };

  const handleCloseCompanyModal = () => {
    setShowCompanyModal(false);
    setCompanyModalError('');
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyFormSubmit = async (e) => {
    e.preventDefault();
    setCompanyModalLoading(true);
    setCompanyModalError('');
    try {
      await dispatch(updateCompanyProfile({ companyId: companyData.id, data: companyForm })).unwrap();
      setShowCompanyModal(false);
    } catch (err) {
      setCompanyModalError(err?.message || 'Failed to update company');
    } finally {
      setCompanyModalLoading(false);
    }
  };

  const handleManageAdmins = () => {
    navigate('/admin-users');
  };

  const handleViewEmployees = () => {
    navigate('/employees');
  };

  const handleManageDepartments = () => {
    navigate('/departments');
  };

  // Show loading until profile is available
  if (!companyData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading company data...</div>;
  }

  if (user?.role !== 'PARENT') {
    return <Navigate to="/" />;
  }

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {/* Company Section */}
        <section style={styles.companySection}>
          <button 
            style={styles.editButton}
            onClick={handleEditProfile}
            onMouseEnter={() => setHoveredButton('edit')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Edit size={16} />
            Edit Profile
          </button>
          <h1 style={styles.companyName}>{companyData.name}</h1>
          <div style={styles.companyDetails}>
            <div style={styles.companyDetail}>
              <Building2 size={18} />
              <span>{companyData.industry_display || companyData.industry}</span>
            </div>
            {companyData.city && companyData.country && (
              <div style={styles.companyDetail}>
                <MapPin size={18} />
                <span>{companyData.city}, {companyData.country}</span>
              </div>
            )}
          </div>
        </section>

        {/* Statistics Cards */}
        <section style={styles.statsGrid}>
          <div 
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'admin' ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('admin')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleManageAdmins}
          >
            <div style={styles.statHeader}>
              <h3 style={styles.statTitle}>Admin Users</h3>
              <Shield size={28} style={styles.statIcon} />
            </div>
            <div style={styles.statCount}>{companyData.admin_count || 0}</div>
            <div style={styles.statCTA}>Manage Admins →</div>
          </div>

          <div 
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'employees' ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('employees')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleViewEmployees}
          >
            <div style={styles.statHeader}>
              <h3 style={styles.statTitle}>Employees</h3>
              <Users size={28} style={styles.statIcon} />
            </div>
            <div style={styles.statCount}>{companyData.employees_count || totalEmployees}</div>
            <div style={styles.statCTA}>View Employees →</div>
          </div>

          <div
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'departments' ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('departments')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleManageDepartments}
          >
            <div style={styles.statHeader}>
              <h3 style={styles.statTitle}>Departments</h3>
              <BarChart3 size={28} style={styles.statIcon} />
            </div>
            <div style={styles.statCount}>{departments.length || 0}</div>
            <div style={styles.statCTA}>Manage Departments →</div>
          </div>
        </section>

        {/* Bottom Section */}
        <section style={styles.bottomGrid}>
          {/* Quick Actions */}
          <div style={styles.actionBox}>
            <h3 style={styles.boxTitle}>Quick Actions</h3>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                ...styles.actionButton,
                ...(hoveredButton === 'admin' ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('admin')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Shield size={20} />
              Add New Admin User
            </button>

            <button
              onClick={() => setShowEmployeeModal(true)}
              style={{
                ...styles.actionButton,
                ...(hoveredButton === 'employee' ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('employee')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <UserPlus size={20} />
              Add New Employee
            </button>

            {/* Add new Shopify button */}
            <button
              onClick={() => setShowShopifyModal(true)}
              style={{
                ...styles.actionButton,
                ...(hoveredButton === 'shopify' ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('shopify')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ShoppingBag size={20} />
              Connect Shopify Store
            </button>

            {/* Add new Shiprocket button */}
            <button
              onClick={() => setShowShiprocketModal(true)}
              style={{
                ...styles.actionButton,
                ...(hoveredButton === 'shiprocket' ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('shiprocket')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Truck size={20} />
              Connect Shiprocket Account
            </button>

            <button
              onClick={() => setShowCompanyModal(true)}
              style={{
                ...styles.actionButton,
                ...(hoveredButton === 'settings' ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Settings size={20} />
              Update Company Settings
            </button>
          </div>

          {/* Company Information */}
          <div style={styles.infoBox}>
            <h3 style={styles.infoBoxTitle}>Company Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Registration Number:</div>
                <div style={styles.infoValue}>{companyData.registration_number}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Website:</div>
                <div style={styles.infoValue}>{companyData.website || '—'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Phone:</div>
                <div style={styles.infoValue}>{companyData.phone || '—'}</div>
              </div>
              {companyData.address && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Address:</div>
                  <div style={styles.infoValue}>
                    {[
                      companyData.address,
                      companyData.city,
                      companyData.state,
                      companyData.postal_code,
                      companyData.country
                    ].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Add Admin Modal */}
      {showModal && (
        <div style={modalStyles.modalOverlay} onClick={handleCloseModal}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={modalStyles.modalHeader}>
              <h2 style={modalStyles.modalTitle}>Add Admin User</h2>
              <button style={modalStyles.closeButton} onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => e.preventDefault()}>
              {formErrors.api && <div style={{ color: 'red', marginBottom: 12 }}>{formErrors.api}</div>}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.firstName ? modalStyles.inputError : {}) }} placeholder="Enter first name" />
                {formErrors.firstName && <div style={modalStyles.errorText}>{formErrors.firstName}</div>}
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.lastName ? modalStyles.inputError : {}) }} placeholder="Enter last name" />
                {formErrors.lastName && <div style={modalStyles.errorText}>{formErrors.lastName}</div>}
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.email ? modalStyles.inputError : {}) }} placeholder="Enter email address" />
                {formErrors.email && <div style={modalStyles.errorText}>{formErrors.email}</div>}
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.phone ? modalStyles.inputError : {}) }} placeholder="Enter phone number" />
                {formErrors.phone && <div style={modalStyles.errorText}>{formErrors.phone}</div>}
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Password *</label>
                <div style={modalStyles.passwordWrapper}>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.password ? modalStyles.inputError : {}), paddingRight: '48px' }} placeholder="Enter password" />
                  <button type="button" style={modalStyles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {formErrors.password && <div style={modalStyles.errorText}>{formErrors.password}</div>}
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Confirm Password *</label>
                <div style={modalStyles.passwordWrapper}>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} style={{ ...modalStyles.input, ...(formErrors.confirmPassword ? modalStyles.inputError : {}), paddingRight: '48px' }} placeholder="Confirm password" />
                  <button type="button" style={modalStyles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {formErrors.confirmPassword && <div style={modalStyles.errorText}>{formErrors.confirmPassword}</div>}
              </div>
              <div style={modalStyles.modalActions}>
                <button type="button" style={modalStyles.cancelButton} onClick={handleCloseModal}>Cancel</button>
                <button type="button" style={modalStyles.saveButton} onClick={handleSaveAdmin}>Save Admin User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }} onClick={handleCloseEmployeeModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px 50px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            border: '1px solid #e8ecf0',
            position: 'relative',
            animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '700', margin: '0', position: 'relative' }}>
                <span style={{ color: '#7E44EE', background: 'linear-gradient(45deg, #7E44EE, #9B59B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Add Employee</span>
              </h1>
              <button
                type="button"
                onClick={handleCloseEmployeeModal}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}
                onMouseEnter={e => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.color = '#374151'; }}
                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#64748b'; }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEmployeeSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="firstName" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" id="firstName" name="firstName" value={employeeFormData.firstName} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter first name" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="lastName" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" id="lastName" name="lastName" value={employeeFormData.lastName} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter last name" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="department" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Department</label>
                <div style={{ position: 'relative' }}>
                  <select id="department" name="department" value={employeeFormData.department} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required>
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="phoneNumber" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" id="phoneNumber" name="phoneNumber" value={employeeFormData.phoneNumber} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter phone number" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="role" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Role</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" id="role" name="role" value={employeeFormData.role} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter role" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="email" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" id="email" name="email" value={employeeFormData.email} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter email address" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label htmlFor="password" style={{ color: '#34495e', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" id="password" name="password" value={employeeFormData.password} onChange={handleEmployeeChange} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }} required placeholder="Enter password" />
                </div>
              </div>
              {employeeError && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', gridColumn: '1 / -1', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>{employeeError}</div>}
              <div style={{ display: 'flex', gap: '12px', gridColumn: '1 / -1', marginTop: '16px' }}>
                <button type="button" style={{ background: '#f8fafc', color: '#64748b', border: '2px solid #e2e8f0', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', letterSpacing: '0.3px', flex: 1 }} onClick={handleCloseEmployeeModal}>Cancel</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #7E44EE 0%, #8E44AD 100%)', color: 'white', boxShadow: '0 4px 12px rgba(126, 68, 238, 0.2)', padding: '14px 28px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', letterSpacing: '0.3px', flex: 1 }} disabled={employeeLoading}>{employeeLoading ? 'Saving...' : 'Save Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Company Settings Modal */}
      {showCompanyModal && (
        <div style={modalStyles.modalOverlay} onClick={handleCloseCompanyModal}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={modalStyles.modalHeader}>
              <h2 style={modalStyles.modalTitle}>Update Company Settings</h2>
              <button style={modalStyles.closeButton} onClick={handleCloseCompanyModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleCompanyFormSubmit}>
              {companyModalError && <div style={{ color: 'red', marginBottom: 12 }}>{companyModalError}</div>}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Company Name</label>
                <input type="text" name="name" value={companyForm.name} onChange={handleCompanyFormChange} style={modalStyles.input} required />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Registration Number</label>
                <input type="text" name="registration_number" value={companyForm.registration_number} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Website</label>
                <input type="text" name="website" value={companyForm.website} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Phone</label>
                <input type="text" name="phone" value={companyForm.phone} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Address</label>
                <input type="text" name="address" value={companyForm.address} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>City</label>
                <input type="text" name="city" value={companyForm.city} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>State</label>
                <input type="text" name="state" value={companyForm.state} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Postal Code</label>
                <input type="text" name="postal_code" value={companyForm.postal_code} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Country</label>
                <input type="text" name="country" value={companyForm.country} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Industry</label>
                <input type="text" name="industry" value={companyForm.industry} onChange={handleCompanyFormChange} style={modalStyles.input} />
              </div>
              <div style={modalStyles.modalActions}>
                <button type="button" style={modalStyles.cancelButton} onClick={handleCloseCompanyModal}>Cancel</button>
                <button type="submit" style={modalStyles.saveButton} disabled={companyModalLoading}>{companyModalLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopify Connect Modal */}
      <ShopifyConnectModal
        isOpen={showShopifyModal}
        onClose={() => setShowShopifyModal(false)}
        onSuccess={() => {
          setShowShopifyModal(false);
          // Add any success handling here
        }}
      />

      {/* Shiprocket Connect Modal */}
      <ShiprocketConnectModal
        isOpen={showShiprocketModal}
        onClose={() => setShowShiprocketModal(false)}
        onSuccess={() => {
          setShowShiprocketModal(false);
          // Add any success handling here
        }}
      />
    </div>
  );
};

export default CompanyDashboard;