import React, { useEffect } from 'react';
import { Users, Building2, Settings, UserPlus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../store/employeeSlice';
import { fetchDepartments, fetchCompanyProfile } from '../store/companySlice';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { employees, loading } = useSelector((state) => state.employees);
  const { departments, profile: companyProfile } = useSelector((state) => state.company);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    if (user?.company) {
      dispatch(fetchCompanyProfile(user.company));
    }
  }, [dispatch, user]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'white' }} onClick={() => navigate('/employees/new')}>
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
    </div>
  );
};

export default AdminDashboard;