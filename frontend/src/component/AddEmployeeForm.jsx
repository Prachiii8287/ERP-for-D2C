import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee, fetchEmployees } from '../store/employeeSlice';
import { fetchDepartments } from '../store/companySlice';

const AddEmployeeForm = () => {
  const navigate = useNavigate();
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
    dispatch(fetchDepartments());
  }, [dispatch]);

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
      await dispatch(createEmployee({
        first_name: formData.firstName,
        last_name: formData.lastName,
        department: formData.department,
        phone: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        company_id: user.company
      })).unwrap();
      navigate('/employees');
    } catch (err) {
      setError(err?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '50px 60px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
      width: '100%',
      maxWidth: '700px',
      border: '1px solid #e8ecf0',
      position: 'relative'
    },
    cardBefore: {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      background: 'linear-gradient(90deg, #6A0DAD, #9B59B6, #8E44AD)',
      borderRadius: '20px 20px 0 0'
    },
    heading: {
      color: '#2c3e50',
      fontSize: '32px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '40px',
      margin: '0 0 40px 0',
      position: 'relative'
    },
    headingAccent: {
      color: '#6A0DAD',
      display: 'inline-block',
      background: 'linear-gradient(45deg, #6A0DAD, #9B59B6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '28px 32px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    label: {
      color: '#34495e',
      fontSize: '15px',
      fontWeight: '600',
      marginBottom: '10px',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      border: '2px solid #e8ecf0',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    inputFocused: {
      borderColor: '#6A0DAD',
      boxShadow: '0 0 0 4px rgba(106, 13, 173, 0.1)',
      transform: 'translateY(-2px)'
    },
    button: {
      background: 'linear-gradient(135deg, #6A0DAD 0%, #8E44AD 100%)',
      color: 'white',
      padding: '16px 32px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginTop: '20px',
      position: 'relative',
      letterSpacing: '0.3px',
      boxShadow: '0 4px 12px rgba(106, 13, 173, 0.2)'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(106, 13, 173, 0.3)'
    },
    buttonActive: {
      transform: 'translateY(-1px)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>
          <span style={styles.headingAccent}>Add Employee</span>
        </h1>
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

          {/* Password Field */}
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

          <button
            type="submit"
            disabled={loading}
            style={{...styles.button, gridColumn: '1 / -1'}}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.buttonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'none';
              e.target.style.boxShadow = '0 4px 12px rgba(106, 13, 173, 0.2)';
            }}
            onMouseDown={(e) => {
              Object.assign(e.target.style, styles.buttonActive);
            }}
            onMouseUp={(e) => {
              Object.assign(e.target.style, styles.buttonHover);
            }}
          >
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
          {error && <div style={{ color: '#ef4444', marginTop: 16, gridColumn: '1 / -1' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeForm;