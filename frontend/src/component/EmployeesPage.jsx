import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployees, createEmployee, updateEmployee } from '../store/employeeSlice';
import { fetchDepartments } from '../store/companySlice';
import { companyAPI } from '../services/api';

// Modal styles shared by AddEmployeeModal and EditEmployeeModal
const modalStyles = {
    backdrop: {
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
    },
    modal: {
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
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    heading: {
      color: '#2c3e50',
      fontSize: '28px',
      fontWeight: '700',
      margin: '0',
      position: 'relative'
    },
    headingAccent: {
      color: '#7E44EE',
      display: 'inline-block',
      background: 'none',
      WebkitBackgroundClip: 'unset',
      WebkitTextFillColor: 'unset',
      backgroundClip: 'unset'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      color: '#64748b',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px'
    },
    closeButtonHover: {
      backgroundColor: '#f1f5f9',
      color: '#374151'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px 28px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    label: {
      color: '#34495e',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e8ecf0',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    inputFocused: {
      borderColor: '#7E44EE',
      boxShadow: '0 0 0 3px rgba(126, 68, 238, 0.1)',
      transform: 'translateY(-1px)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      gridColumn: '1 / -1',
      marginTop: '16px'
    },
    button: {
      padding: '14px 28px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      letterSpacing: '0.3px',
      flex: 1
    },
    primaryButton: {
      background: 'none',
      backgroundColor: '#7E44EE',
      color: 'white',
      boxShadow: '0 4px 12px rgba(126, 68, 238, 0.2)'
    },
    primaryButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(126, 68, 238, 0.3)'
    },
    secondaryButton: {
      background: '#f8fafc',
      color: '#64748b',
      border: '2px solid #e2e8f0'
    },
    secondaryButtonHover: {
      backgroundColor: '#f1f5f9',
      borderColor: '#cbd5e1',
      color: '#475569'
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '8px',
      gridColumn: '1 / -1',
      padding: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px'
    }
  };

// Add Employee Modal Component
const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { departments } = useSelector((state) => state.company);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
    email: '',
    role: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
    }
  }, [dispatch, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        department: '',
        phoneNumber: '',
        email: '',
        role: '',
        password: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await dispatch(createEmployee({
        first_name: formData.firstName,
        last_name: formData.lastName,
        department: formData.department,
        phone: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        company_id: user.company
      })).unwrap();
      
      // Call the callback function if provided
      if (onEmployeeAdded) {
        onEmployeeAdded(result);
      }
      
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const styles = modalStyles;

  return (
    <div 
      style={styles.backdrop} 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <h1 style={styles.heading}>
            <span style={styles.headingAccent}>Add Employee</span>
          </h1>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.closeButtonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="firstName" style={styles.label}>
              First Name
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                required
                placeholder="Enter first name"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="lastName" style={styles.label}>
              Last Name
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="department" style={styles.label}>
              Department
            </label>
            <div style={styles.inputWrapper}>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="phoneNumber" style={styles.label}>
              Phone Number
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="role" style={styles.label}>
              Role
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                placeholder="Enter role/position"
                required
              />
            </div>
          </div>

          <div style={{...styles.fieldGroup, gridColumn: '1 / -1'}}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div style={{...styles.fieldGroup, gridColumn: '1 / -1'}}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.inputFocused);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ecf0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'none';
                }}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={{...styles.button, ...styles.secondaryButton}}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.secondaryButtonHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#64748b';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{...styles.button, ...styles.primaryButton}}
              onMouseEnter={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.primaryButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 4px 12px rgba(126, 68, 238, 0.2)';
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const EditEmployeeModal = ({ isOpen, onClose, employee, departments, onEmployeeUpdated }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
    role: '',
    email: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        firstName: employee.user?.first_name || '',
        lastName: employee.user?.last_name || '',
        department: employee.department || '',
        phoneNumber: employee.user?.phone || '',
        role: employee.role || '',
        email: employee.user?.email || '',
        is_active: employee.is_active
      });
      setError('');
    }
  }, [isOpen, employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dispatch(updateEmployee({
        employeeId: employee.id,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          department: formData.department,
          phone: formData.phoneNumber,
          role: formData.role,
          email: formData.email,
          is_active: formData.is_active
        }
      })).unwrap();
      if (onEmployeeUpdated) onEmployeeUpdated();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  const styles = modalStyles;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h1 style={styles.heading}><span style={styles.headingAccent}>Edit Employee</span></h1>
          <button type="button" onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={styles.input} required placeholder="Enter first name" />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={styles.input} required placeholder="Enter last name" />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Department</label>
            <select name="department" value={formData.department} onChange={handleChange} style={styles.input} required>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={styles.input} placeholder="Enter phone number" />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Role</label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} style={styles.input} required placeholder="Enter role/position" />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required placeholder="Enter email address" />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Employee ID</label>
            <input type="text" value={employee.employee_id} style={styles.input} readOnly />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Active</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
              <span style={{ fontSize: 15 }}>Active</span>
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={{...styles.button, ...styles.secondaryButton}}>Cancel</button>
            <button type="submit" disabled={loading} style={{...styles.button, ...styles.primaryButton}}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Updated Employees Page Component
const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const { departments } = useSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleEmployeeAdded = (newEmployee) => {
    // Refresh the employees list
    dispatch(fetchEmployees());
    console.log('New employee added:', newEmployee);
  };

  const handleEditEmployee = (employee) => {
    setEditEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (employee) => {
    // Always use the related User's ID for OTP deletion
    const userId = employee.user && employee.user.id ? employee.user.id : null;
    console.log('Deleting employee, userId for OTP:', userId, 'employee:', employee);
    if (!userId) {
      setOtpError('Invalid employee user ID.');
      return;
    }
    setDeleteEmployeeId(userId);
    setShowDeleteModal(true);
    setOtp('');
    setOtpStatus('');
    setOtpError('');
    try {
      await companyAPI.sendUserDeleteOTP(userId);
      setOtpStatus('OTP sent successfully. Please check your email.');
    } catch (err) {
      setOtpStatus('');
      setOtpError('Failed to send OTP.');
    }
  };

  const handleVerifyDelete = async () => {
    setOtpError('');
    try {
      await companyAPI.verifyUserDeleteOTP(deleteEmployeeId, otp);
      setShowDeleteModal(false);
      setDeleteEmployeeId(null);
      setOtp('');
      setOtpStatus('');
      // Refresh employee list here instead of reloading the page
      dispatch(fetchEmployees());
    } catch (err) {
      setOtpError(err?.response?.data?.detail || 'Invalid OTP');
    }
  };

  const styles = {
    container: { 
      padding: '32px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh' 
    },
    header: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '32px' 
    },
    title: { 
      fontSize: '32px', 
      fontWeight: 'bold', 
      color: '#1f2937', 
      margin: 0 
    },
    addButton: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      backgroundColor: '#7E44EE', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      padding: '12px 20px', 
      fontSize: '16px', 
      fontWeight: '600', 
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    addButtonHover: {
      backgroundColor: '#6B37D6',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(126, 68, 238, 0.3)'
    },
    card: { 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '32px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)' 
    },
    table: { 
      width: '100%', 
      borderCollapse: 'collapse' 
    },
    th: { 
      padding: '16px', 
      textAlign: 'left', 
      borderBottom: '2px solid #e9ecef', 
      fontWeight: '700', 
      color: '#374151' 
    },
    td: { 
      padding: '16px', 
      borderBottom: '1px solid #f1f3f4' 
    },
    loading: { 
      textAlign: 'center', 
      padding: '60px', 
      color: '#6b7280' 
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      color: '#6b7280'
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusActive: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    statusInactive: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    actionsCell: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '16px'
    },
    editButton: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1'
    },
    editButtonHover: {
      backgroundColor: '#bae6fd',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(3, 105, 161, 0.2)'
    },
    deleteButton: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    },
    deleteButtonHover: {
      backgroundColor: '#fecaca',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
    }
  };

  if (loading.list) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading employees...</div>
      </div>
    );
  }

  return (
    <>
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Employees ({employees.length})</h1>
        <button 
          style={styles.addButton} 
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, styles.addButtonHover);
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#7E44EE';
            e.target.style.transform = 'none';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>
      
      <div style={styles.card}>
        {employees.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <Users size={48} />
            </div>
            <h3>No employees yet</h3>
            <p>Click "Add Employee" to get started</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={styles.td}>
                    {emp.user?.first_name} {emp.user?.last_name}
                  </td>
                  <td style={styles.td}>{emp.department_name}</td>
                  <td style={styles.td}>{emp.role}</td>
                  <td style={styles.td}>{emp.user?.email}</td>
                  <td style={styles.td}>{emp.phone || 'N/A'}</td>
                  <td style={styles.td}>
                    <span 
                      style={{
                        ...styles.statusBadge,
                        ...(emp.is_active ? styles.statusActive : styles.statusInactive)
                      }}
                    >
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button
                        style={{...styles.actionButton, ...styles.editButton}}
                        onClick={() => handleEditEmployee(emp)}
                        onMouseEnter={(e) => {
                          Object.assign(e.target.style, styles.editButtonHover);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#e0f2fe';
                          e.target.style.transform = 'none';
                          e.target.style.boxShadow = 'none';
                        }}
                        title="Edit Employee"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => handleDeleteEmployee(emp)}
                        onMouseEnter={(e) => {
                          Object.assign(e.target.style, styles.deleteButtonHover);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fee2e2';
                          e.target.style.transform = 'none';
                          e.target.style.boxShadow = 'none';
                        }}
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />

        {showEditModal && (
          <EditEmployeeModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            employee={editEmployee}
            departments={departments}
            onEmployeeUpdated={() => dispatch(fetchEmployees())}
          />
        )}
    </div>

      {/* OTP Delete Modal - match AdminUsersPage style and structure */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={() => setShowDeleteModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(126, 68, 238, 0.10), 0 1.5px 6px rgba(0,0,0,0.07)',
            width: '100%',
            maxWidth: 480,
            padding: '2.5rem 2rem 2rem 2rem',
            textAlign: 'center',
            animation: 'modalFadeIn 0.2s',
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 32, color: '#f59e0b' }}>⚠️</span>
              <h2 style={{ fontWeight: 700, fontSize: '1.5rem', margin: '12px 0 0 0' }}>Confirm Employee Deletion</h2>
              <p style={{ color: '#444', margin: '8px 0 0 0' }}>
                Deleting this employee is irreversible. Please enter the OTP sent to the company owner to continue.
              </p>
              {otpStatus && <div style={{ background: '#e6fbe6', color: '#228B22', padding: 8, borderRadius: 4, margin: 8 }}>{otpStatus}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {[0,1,2,3,4,5].map(i => (
                <input key={i} type="text" maxLength={1} value={otp[i] || ''} onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(otp.substring(0, i) + val + otp.substring(i+1));
                }} style={{ width: 40, height: 40, fontSize: 24, textAlign: 'center', border: '1px solid #ccc', borderRadius: 6 }} />
              ))}
            </div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>For demo: use "123456"</div>
            {otpError && <div style={{ color: 'red', marginBottom: 8 }}>{otpError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Cancel</button>
              <button onClick={handleVerifyDelete} style={{ padding: '10px 20px', borderRadius: 6, background: '#7E44EE', color: '#fff', border: 'none' }} disabled={otp.length !== 6}>Confirm Deletion</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeesPage;