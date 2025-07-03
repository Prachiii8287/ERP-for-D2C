// frontend/src/components/Layout.jsx//nkasnksan
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Home, Users, Building2, Settings, LogOut, User, Shield, Clock, FolderOpen } from 'lucide-react';
import Logo from './Logo.png';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    sidebar: {
      width: '250px',
      backgroundColor: '#ffffff',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 1000
    },
    logo: {
      padding: '24px 20px',
      borderBottom: '1px solid #e9ecef',
      textAlign: 'center'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#7E44EE',
      margin: 0
    },
    nav: {
      padding: '20px 0',
      flex: 1
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      margin: '4px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      textDecoration: 'none',
      color: '#6b7280',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: '1px solid transparent'
    },
    navItemActive: {
      backgroundColor: '#f3f4f6',
      color: '#7c3aed',
      fontWeight: '500',
      border: '1px solid #e5e7eb'
    },
    navItemHover: {
      backgroundColor: '#f9fafb'
    },
    userSection: {
      padding: '20px',
      borderTop: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#7E44EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px'
    },
    userName: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px'
    },
    userRole: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'capitalize'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '8px 12px',
      backgroundColor: 'transparent',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#6b7280',
      transition: 'all 0.2s ease'
    },
    logoutButtonHover: {
      backgroundColor: '#fee2e2',
      borderColor: '#ef4444',
      color: '#dc2626'
    },
    main: {
      marginLeft: '260px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    content: {
      flex: 1,
      padding: '0'
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const home = { path: '/shopify-dashboard', label: 'Home', icon: Home };
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home }
    ];

    if (user?.role === 'PARENT') {
      return [
        home,
        { path: '/company-dashboard', label: 'Company Dashboard', icon: Building2 },
        { path: '/admin-users', label: 'Admin Users', icon: Shield },
        { path: '/employees', label: 'Employees', icon: Users },
        // { path: '/timesheet', label: 'Timesheet', icon: Clock },
        { path: '/departments', label: 'Departments', icon: Building2 },
        // { path: '/projects', label: 'Projects', icon: FolderOpen },
        { path: '/company/settings', label: 'Settings', icon: Settings }
      ];
    } else if (user?.role === 'ADMIN') {
      return [
        home,
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/employees', label: 'Employees', icon: Users },
        // { path: '/timesheet', label: 'Timesheet', icon: Clock },
        { path: '/departments', label: 'Departments', icon: Building2 },
        // { path: '/projects', label: 'Projects', icon: FolderOpen }
      ];
    } else {
      return [
        home,
        { path: '/dashboard', label: 'Dashboard', icon: Home }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <img src={Logo} alt="Company Logo" style={{ maxWidth: '100px', maxHeight: '48px', display: 'block', margin: '0 auto' }} />
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    Object.assign(e.target.style, styles.navItemHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent size={20} style={{ marginRight: '12px' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              <User size={20} color="white" />
            </div>
            <div>
              <div style={styles.userName}>
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </div>
              <div style={styles.userRole}>
                {user?.role?.toLowerCase() || 'employee'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6b7280';
            }}
          >
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;