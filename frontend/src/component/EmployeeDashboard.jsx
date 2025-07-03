import React from 'react';
import { User, Building2, Calendar, Briefcase, Hash, Key } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { fetchEmployees } from '../store/employeeSlice';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees, loading } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Find the employee record for the logged-in user
  const employee = useMemo(() => {
    if (!user || !employees) return null;
    return employees.find(emp => emp.user?.id === user.id);
  }, [user, employees]);

  if (user?.role !== 'EMPLOYEE') {
    return <Navigate to="/" />;
  }

  if (loading.list) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#7E44EE' }}>Loading your info...</div>;
  }

  if (!employee) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#ef4444' }}>Employee record not found.</div>;
  }

  const handlePasswordChange = () => {
    // Password change functionality would go here
    alert('Password change functionality would be implemented here');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    //   fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: '#7E44EE',
        padding: '32px 0',
        marginBottom: '40px',
        boxShadow: '0 2px 8px rgba(126, 68, 238, 0.15)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '600',
            margin: '0',
            letterSpacing: '-0.3px'
          }}>
            Employee Portal
          </h1>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Welcome Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            color: '#7E44EE',
            fontSize: '36px',
            fontWeight: '700',
            margin: '0',
            lineHeight: '1.3',
            letterSpacing: '-0.8px'
          }}>
            Welcome to your Employee Dashboard, {user.first_name} {user.last_name}!
          </h1>
        </div>

        {/* Employee Info Block */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            color: 'black',
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 32px 0'
          }}>
            Employee Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px'
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Employee ID */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <Hash size={18} color="black" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Employee ID
                  </span>
                </div>
                <div style={{
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginLeft: '42px'
                }}>
                  {employee.employee_id || employee.id}
                </div>
              </div>

              {/* Company */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <Building2 size={18} color="black" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Company
                  </span>
                </div>
                <div style={{
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginLeft: '42px'
                }}>
                  {employee.company_name || 'N/A'}
                </div>
              </div>

              {/* Department */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <User size={18} color="black" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Department
                  </span>
                </div>
                <div style={{
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginLeft: '42px'
                }}>
                  {employee.department_name || 'N/A'}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Role */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <Briefcase size={18} color="black" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Role
                  </span>
                </div>
                <div style={{
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginLeft: '42px'
                }}>
                  {employee.role || user.role}
                </div>
              </div>

              {/* Joining Date */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: '#7E44EE',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={18} color="white" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Joining Date
                  </span>
                </div>
                <div style={{
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginLeft: '42px'
                }}>
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Status */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <Key size={18} color="black" />
                  </div>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Status
                  </span>
                </div>
                <div style={{
                  color: employee.is_active ? '#22c55e' : '#ef4444',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginLeft: '42px'
                }}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '40px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            color: 'black',
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 24px 0'
          }}>
            Employee Quick Actions:
          </h2>
          <button
            onClick={handlePasswordChange}
            style={{
              backgroundColor: '#7E44EE',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(126, 68, 238, 0.25)',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#6B2FD9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(126, 68, 238, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#7E44EE';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(126, 68, 238, 0.25)';
            }}
          >
            <Key size={18} />
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;