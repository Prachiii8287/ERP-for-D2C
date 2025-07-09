import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown, 
  ChevronRight,
  Grid3X3,
  FileText,
  Home
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice';
import Logo from './Logo.png';

const ShopifySidebar = () => {
  const location = useLocation();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/'); // Redirect to login or home page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path); // Actually perform navigation
  };

  const isActive = (path) => location.pathname === path;
  const isProductsActive = () => {
    return (
      location.pathname === '/products' ||
      location.pathname === '/products/categories' ||
      location.pathname === '/products/bom'
    );
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  const handleAccountSettings = () => {
    if (user?.role === 'PARENT') {
      navigate('/company-dashboard');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin-dashboard');
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/dashboard');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    sidebar: {
      width: '250px',
      backgroundColor: '#ffffff',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100vh'
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
      color: '#6b7280',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      justifyContent: 'space-between'
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
    navItemLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    dropdownContainer: {
      margin: '4px 12px'
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 20px 8px 52px',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#6b7280',
      fontWeight: '400',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      margin: '2px 0'
    },
    dropdownItemActive: {
      backgroundColor: '#f3f4f6',
      color: '#7c3aed',
      fontWeight: '500'
    },
    dropdownItemHover: {
      backgroundColor: '#f9fafb'
    },
    bottomSection: {
      padding: '0 12px 20px',
      borderTop: '1px solid #e9ecef'
    },
    accountSettings: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      margin: '4px 0',
      borderRadius: '8px',
      cursor: 'pointer',
      color: '#6b7280',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: '1px solid transparent'
    },
    userSection: {
      padding: '20px',
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
    main: {
      marginLeft: '250px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    content: {
      flex: 1,
      padding: '40px',
      backgroundColor: '#ffffff',
      margin: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    demoContent: {
      textAlign: 'center',
      color: '#6b7280'
    }
  };

  const navigationItems = [
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/inventory', label: 'Inventory', icon: Warehouse },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/procurement', label: 'Procurement', icon: Truck }
  ];

  const productDropdownItems = [
    { path: '/products', label: 'Products', icon: Package },
    { path: '/products/categories', label: 'Categories', icon: Grid3X3 }
  ];

  return (
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
        <img src={Logo} alt="Logo" style={{ maxWidth: '100px', maxHeight: '48px', display: 'block', margin: '0 auto' }} />
        </div>
        {/* Navigation */}
        <nav style={styles.nav}>
          {/* Home */}
          <div
            style={{
              ...styles.navItem,
              ...(isActive('/shopify-dashboard') ? styles.navItemActive : {})
            }}
            onClick={() => handleNavigation('/shopify-dashboard')}
            onMouseEnter={(e) => {
              if (!isActive('/shopify-dashboard')) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/shopify-dashboard')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <Home size={20} style={{ marginRight: '12px' }} />
              Home
            </div>
          </div>
          {/* Customers */}
          <div
            style={{
              ...styles.navItem,
              ...(isActive('/customers') ? styles.navItemActive : {})
            }}
            onClick={() => handleNavigation('/customers')}
            onMouseEnter={(e) => {
              if (!isActive('/customers')) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/customers')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <Users size={20} style={{ marginRight: '12px' }} />
              Customers
            </div>
          </div>

          {/* Products with Dropdown */}
          <div
            style={{
              ...styles.navItem,
              ...(isProductsActive() ? styles.navItemActive : {})
            }}
            onClick={toggleProducts}
            onMouseEnter={(e) => {
              if (!isProductsActive()) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isProductsActive()) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <Package size={20} style={{ marginRight: '12px' }} />
              Products
            </div>
            <ChevronDown size={16} style={{ transform: isProductsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} />
          </div>

          {/* Dropdown Items */}
          {isProductsOpen && productDropdownItems.length > 0 && (
            <div style={styles.dropdownContainer}>
              {productDropdownItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <div
                    key={item.path}
                    style={{
                      ...styles.dropdownItem,
                      ...(active ? styles.dropdownItemActive : {})
                    }}
                    onClick={() => {
                      handleNavigation(item.path);
                      if (item.path === '/products') {
                        setIsProductsOpen(false); // Close dropdown after navigating to Products
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        Object.assign(e.target.style, styles.dropdownItemHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <IconComponent size={16} style={{ marginRight: '8px' }} />
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Inventory */}
          <div
            style={{
              ...styles.navItem,
              ...(isActive('/inventory') ? styles.navItemActive : {})
            }}
            onClick={() => handleNavigation('/inventory')}
            onMouseEnter={(e) => {
              if (!isActive('/inventory')) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/inventory')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <Warehouse size={20} style={{ marginRight: '12px' }} />
              Inventory
            </div>
          </div>

          {/* Orders */}
          <div
            style={{
              ...styles.navItem,
              ...(isActive('/orders') ? styles.navItemActive : {})
            }}
            onClick={() => handleNavigation('/orders')}
            onMouseEnter={(e) => {
              if (!isActive('/orders')) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/orders')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <ShoppingCart size={20} style={{ marginRight: '12px' }} />
              Orders
            </div>
          </div>

          {/* Procurement */}
          <div
            style={{
              ...styles.navItem,
              ...(isActive('/procurement') ? styles.navItemActive : {})
            }}
            onClick={() => handleNavigation('/procurement')}
            onMouseEnter={(e) => {
              if (!isActive('/procurement')) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/procurement')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.navItemLeft}>
              <Truck size={20} style={{ marginRight: '12px' }} />
              Procurement
            </div>
          </div>
        </nav>
        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          {/* Account Settings */}
          <div
          style={styles.accountSettings}
          onClick={handleAccountSettings}
        >
          <Settings style={{ marginRight: '10px' }} />
              Account Settings
          </div>

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
                  {user?.role?.toLowerCase() || 'user'}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fee2e2';
                e.target.style.borderColor = '#ef4444';
                e.target.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#6b7280';
              }}
            >
              <LogOut size={16} style={{ marginRight: '8px' }} />
              Logout
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShopifySidebar;