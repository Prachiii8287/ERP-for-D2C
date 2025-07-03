import React, { useEffect } from 'react';
import { Users, Building2, Settings, UserPlus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchEmployees, createEmployee } from '../store/employeeSlice';
import { fetchDepartments, fetchCompanyProfile } from '../store/companySlice';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { employees, loading } = useSelector((state) => state.employees);
  const { departments, profile: companyProfile } = useSelector((state) => state.company);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showEmployeeModal, setShowEmployeeModal] = React.useState(false);
  const [employeeFormData, setEmployeeFormData] = React.useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
    email: '',
    role: '',
    password: ''
  });
  const [employeeLoading, setEmployeeLoading] = React.useState(false);
  const [employeeError, setEmployeeError] = React.useState('');

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    if (user?.company) {
      dispatch(fetchCompanyProfile(user.company));
    }
  }, [dispatch, user]);

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
      await dispatch(createEmployee({
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

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'black', fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          {companyProfile?.name ? `${companyProfile.name} - Admin Dashboard` : (user?.company ? `${user.company} - Admin Dashboard` : 'Admin Dashboard')}
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: '0', fontWeight: '400' }}>
          Welcome, Admin! Here you can manage company employees.
        </p>
      </div>
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Employees Card */}
        <div style={{ backgroundColor: '#7E44EE', borderRadius: '12px', padding: '32px', color: 'white', position: 'relative', boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>Employees</h3>
              <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{loading.list ? '...' : employees.length}</div>
            </div>
            <Users size={32} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/employees')}>
            View All Employees →
          </div>
        </div>
        {/* Departments Card */}
        <div style={{ backgroundColor: '#7E44EE', borderRadius: '12px', padding: '32px', color: 'white', position: 'relative', boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>Departments</h3>
              <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{departments.length}</div>
            </div>
            <Building2 size={32} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/departments')}>
            Manage Departments →
          </div>
        </div>
      </div>
      {/* Quick Actions Section */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <h2 style={{ color: 'black', fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Add New Employee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'white' }} onClick={handleAddEmployee}>
            <UserPlus size={20} /> Add New Employee
          </div>
          {/* Manage Existing Employees */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'white' }} onClick={() => navigate('/employees')}>
            <Users size={20} /> Manage Existing Employees
          </div>
          {/* Manage Departments */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'white' }} onClick={() => navigate('/departments')}>
            <Building2 size={20} /> Manage Departments
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default AdminDashboard;