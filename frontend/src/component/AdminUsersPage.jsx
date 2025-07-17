// frontend/src/components/AdminUsersPage.jsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Plus, Edit, Trash2, Mail, Phone, Shield } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAdminUsers, deleteAdminUser } from '../store/companySlice';

// const AdminUsersPage = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { adminUsers, loading } = useSelector((state) => state.company);

//   useEffect(() => {
//     dispatch(fetchAdminUsers());
//   }, [dispatch]);

//   const handleAddAdmin = () => {
//     navigate('/admin-users/new');
//   };

//   const handleEditAdmin = (adminId) => {
//     // TODO: Navigate to edit page
//     console.log('Edit admin:', adminId);
//   };

//   const handleDeleteAdmin = (adminId) => {
//     if (window.confirm('Are you sure you want to delete this admin user?')) {
//       dispatch(deleteAdminUser(adminId));
//     }
//   };

//   const styles = {
//     container: {
//       padding: '32px',
//       backgroundColor: '#f8f9fa',
//       minHeight: '100vh'
//     },
//     header: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '32px'
//     },
//     title: {
//       fontSize: '32px',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       margin: 0
//     },
//     addButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       backgroundColor: '#7E44EE',
//       color: 'white',
//       border: 'none',
//       borderRadius: '8px',
//       padding: '12px 20px',
//       fontSize: '16px',
//       fontWeight: '600',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       boxShadow: '0 2px 4px rgba(126, 68, 238, 0.2)'
//     },
//     card: {
//       backgroundColor: 'white',
//       borderRadius: '12px',
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
//       overflow: 'hidden',
//       border: '1px solid #e5e7eb'
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'collapse'
//     },
//     thead: {
//       backgroundColor: '#f8f9fa',
//       borderBottom: '2px solid #e9ecef'
//     },
//     th: {
//       padding: '16px 20px',
//       textAlign: 'left',
//       fontSize: '14px',
//       fontWeight: '700',
//       color: '#374151',
//       textTransform: 'uppercase',
//       letterSpacing: '0.5px'
//     },
//     tr: {
//       borderBottom: '1px solid #f1f3f4',
//       transition: 'background-color 0.2s ease'
//     },
//     td: {
//       padding: '16px 20px',
//       fontSize: '14px',
//       color: '#374151',
//       verticalAlign: 'middle'
//     },
//     userInfo: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px'
//     },
//     avatar: {
//       width: '40px',
//       height: '40px',
//       borderRadius: '50%',
//       backgroundColor: '#7E44EE',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       color: 'white',
//       fontWeight: 'bold',
//       fontSize: '14px'
//     },
//     contactInfo: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '6px',
//       color: '#6b7280',
//       fontSize: '13px'
//     },
//     statusBadge: {
//       padding: '4px 12px',
//       borderRadius: '16px',
//       fontSize: '12px',
//       fontWeight: '600',
//       textAlign: 'center'
//     },
//     statusActive: {
//       backgroundColor: '#d1fae5',
//       color: '#065f46'
//     },
//     statusInactive: {
//       backgroundColor: '#fee2e2',
//       color: '#991b1b'
//     },
//     actions: {
//       display: 'flex',
//       gap: '8px'
//     },
//     actionButton: {
//       padding: '6px',
//       border: 'none',
//       borderRadius: '6px',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center'
//     },
//     editButton: {
//       backgroundColor: '#dbeafe',
//       color: '#1e40af'
//     },
//     deleteButton: {
//       backgroundColor: '#fee2e2',
//       color: '#dc2626'
//     },
//     loading: {
//       textAlign: 'center',
//       padding: '60px',
//       color: '#6b7280'
//     },
//     emptyState: {
//       textAlign: 'center',
//       padding: '60px',
//       color: '#6b7280'
//     }
//   };

//   if (loading?.adminUsers) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.loading}>
//           <div>Loading admin users...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h1 style={styles.title}>Admin Users ({adminUsers.length})</h1>
//         <button 
//           style={styles.addButton}
//           onClick={handleAddAdmin}
//           onMouseEnter={(e) => {
//             e.target.style.backgroundColor = '#6B2FD9';
//             e.target.style.transform = 'translateY(-1px)';
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.backgroundColor = '#7E44EE';
//             e.target.style.transform = 'translateY(0)';
//           }}
//         >
//           <Plus size={20} />
//           Add Admin User
//         </button>
//       </div>

//       {/* Table */}
//       <div style={styles.card}>
//         {adminUsers.length === 0 ? (
//           <div style={styles.emptyState}>
//             <Shield size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
//             <h3>No Admin Users Found</h3>
//             <p>Get started by adding your first admin user.</p>
//             <button style={styles.addButton} onClick={handleAddAdmin}>
//               <Plus size={16} />
//               Add Admin User
//             </button>
//           </div>
//         ) : (
//           <table style={styles.table}>
//             <thead style={styles.thead}>
//               <tr>
//                 <th style={styles.th}>User</th>
//                 <th style={styles.th}>Contact</th>
//                 <th style={styles.th}>Status</th>
//                 <th style={styles.th}>Created</th>
//                 <th style={styles.th}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {adminUsers.map((admin) => (
//                 <tr 
//                   key={admin.id}
//                   style={styles.tr}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.backgroundColor = '#f8f9fa';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.backgroundColor = 'transparent';
//                   }}
//                 >
//                   <td style={styles.td}>
//                     <div style={styles.userInfo}>
//                       <div style={styles.avatar}>
//                         {admin.first_name?.[0]}{admin.last_name?.[0]}
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: '600' }}>
//                           {admin.first_name} {admin.last_name}
//                         </div>
//                         <div style={styles.contactInfo}>
//                           <Mail size={14} />
//                           {admin.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.contactInfo}>
//                       <Phone size={14} />
//                       {admin.phone}
//                     </div>
//                   </td>
//                   <td style={styles.td}>
//                     <span style={{
//                       ...styles.statusBadge,
//                       ...(admin.is_active ? styles.statusActive : styles.statusInactive)
//                     }}>
//                       {admin.is_active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td style={styles.td}>
//                     {admin.date_joined ? new Date(admin.date_joined).toLocaleDateString() : ''}
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actions}>
//                       <button
//                         style={{...styles.actionButton, ...styles.editButton}}
//                         onClick={() => handleEditAdmin(admin.id)}
//                         title="Edit Admin"
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button
//                         style={{...styles.actionButton, ...styles.deleteButton}}
//                         onClick={() => handleDeleteAdmin(admin.id)}
//                         title="Delete Admin"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

///333
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Mail, Phone, Shield, X, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, deleteAdminUser, createAdminUser } from '../store/companySlice';
import { companyAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminUsers, loading } = useSelector((state) => state.company);
  const user = useSelector((state) => state.auth.user);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleAddAdmin = () => {
    setShowModal(true);
  };

  const handleEditAdmin = (adminId) => {
    const admin = adminUsers.find(a => a.id === adminId);
    setEditAdmin({ ...admin });
    setShowEditModal(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    setDeleteAdminId(adminId);
    setShowDeleteModal(true);
    setOtp('');
    setOtpStatus('');
    setOtpError('');
    try {
      await companyAPI.sendAdminDeleteOTP(adminId);
      setOtpStatus('OTP sent successfully. Please check your email.');
    } catch (err) {
      setOtpStatus('');
      setOtpError('Failed to send OTP.');
      toast.error('Failed to send OTP.');
    }
  };

  const handleVerifyDelete = async () => {
    setOtpError('');
    try {
      await companyAPI.verifyAdminDeleteOTP(deleteAdminId, otp);
      setShowDeleteModal(false);
      setDeleteAdminId(null);
      setOtp('');
      setOtpStatus('');
      dispatch(fetchAdminUsers());
    } catch (err) {
      setOtpError(err?.response?.data?.detail || 'Invalid OTP');
      toast.error(err?.response?.data?.detail || 'Invalid OTP');
    }
  };

  const handleSaveEditAdmin = async () => {
    if (!editAdmin) return;
    try {
      await companyAPI.updateAdminUser(editAdmin.id, {
        first_name: editAdmin.first_name,
        last_name: editAdmin.last_name,
        email: editAdmin.email,
        phone: editAdmin.phone,
      });
      setShowEditModal(false);
      setEditAdmin(null);
      dispatch(fetchAdminUsers());
      toast.success('Admin user updated successfully');
    } catch (err) {
      toast.error('Failed to update admin user');
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSaveAdmin = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    // Prepare payload for API
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      company_id: user?.company
    };
    console.log('Admin payload:', payload); // Debug log
    try {
      await dispatch(createAdminUser(payload)).unwrap();
      dispatch(fetchAdminUsers()); // Refresh list
      handleCloseModal();
      toast.success('Admin user added successfully');
    } catch (error) {
      setFormErrors({ api: error.message || 'Failed to add admin user' });
      toast.error(error.message || 'Failed to add admin user');
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
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(126, 68, 238, 0.2)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    thead: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #e9ecef'
    },
    th: {
      padding: '16px 20px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '700',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tr: {
      borderBottom: '1px solid #f1f3f4',
      transition: 'background-color 0.2s ease'
    },
    td: {
      padding: '16px 20px',
      fontSize: '14px',
      color: '#374151',
      verticalAlign: 'middle'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#7E44EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#6b7280',
      fontSize: '13px'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
      textAlign: 'center'
    },
    statusActive: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusInactive: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    actions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '6px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    editButton: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    deleteButton: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
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
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      color: '#6b7280'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    inputError: {
      borderColor: '#dc2626'
    },
    passwordWrapper: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '12px',
      marginTop: '4px'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '32px'
    },
    cancelButton: {
      padding: '12px 24px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    saveButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#7E44EE',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  if (loading?.adminUsers) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>Loading admin users...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Users ({adminUsers.length})</h1>
        <button 
          style={styles.addButton}
          onClick={handleAddAdmin}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#6B2FD9';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#7E44EE';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={20} />
          Add Admin User
        </button>
      </div>

      {/* Table */}
      <div style={styles.card}>
        {adminUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <Shield size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <h3>No Admin Users Found</h3>
            <p>Get started by adding your first admin user.</p>
            <button style={styles.addButton} onClick={handleAddAdmin}>
              <Plus size={16} />
              Add Admin User
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((admin) => (
                <tr 
                  key={admin.id}
                  style={styles.tr}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={styles.td}>
                    <div style={styles.userInfo}>
                      <div style={styles.avatar}>
                        {admin.first_name?.[0]}{admin.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {admin.first_name} {admin.last_name}
                        </div>
                        <div style={styles.contactInfo}>
                          <Mail size={14} />
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contactInfo}>
                      <Phone size={14} />
                      {admin.phone}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(admin.is_active ? styles.statusActive : styles.statusInactive)
                    }}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {admin.date_joined ? new Date(admin.date_joined).toLocaleDateString() : ''}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={{...styles.actionButton, ...styles.editButton}}
                        onClick={() => handleEditAdmin(admin.id)}
                        title="Edit Admin"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => handleDeleteAdmin(admin.id)}
                        title="Delete Admin"
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

      {/* Add Admin Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '50px 60px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
            width: '100%',
            maxWidth: '600px',
            border: '1px solid #e8ecf0',
            position: 'relative',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 40 }}>
              <h1 style={{
                color: '#7E44EE',
                fontSize: '32px',
                fontWeight: '700',
                textAlign: 'left',
                margin: 0,
                background: 'none',
                backgroundImage: 'none',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'unset',
                backgroundClip: 'unset',
                padding: 0,
                border: 'none',
                boxShadow: 'none'
              }}>
                Add Admin User
              </h1>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginLeft: 16 }} onClick={handleCloseModal}>
                <X size={28} />
              </button>
            </div>
            <form onSubmit={e => e.preventDefault()} style={{ width: '100%' }}>
              {formErrors.api && (
                <div style={{ color: 'red', marginBottom: 12 }}>{formErrors.api}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8ecf0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      ...(formErrors.firstName ? { borderColor: '#dc2626' } : {})
                    }}
                    placeholder="Enter first name"
                    required
                  />
                  {formErrors.firstName && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.firstName}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8ecf0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      ...(formErrors.lastName ? { borderColor: '#dc2626' } : {})
                    }}
                    placeholder="Enter last name"
                    required
                  />
                  {formErrors.lastName && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.lastName}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8ecf0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      ...(formErrors.email ? { borderColor: '#dc2626' } : {})
                    }}
                    placeholder="Enter email address"
                    required
                  />
                  {formErrors.email && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.email}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8ecf0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      ...(formErrors.phone ? { borderColor: '#dc2626' } : {})
                    }}
                    placeholder="Enter phone number"
                    required
                  />
                  {formErrors.phone && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.phone}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid #e8ecf0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        fontFamily: 'inherit',
                        paddingRight: '48px',
                        ...(formErrors.password ? { borderColor: '#dc2626' } : {})
                      }}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.password}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#34495e', fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid #e8ecf0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        fontFamily: 'inherit',
                        paddingRight: '48px',
                        ...(formErrors.confirmPassword ? { borderColor: '#dc2626' } : {})
                      }}
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.confirmPassword}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                <button
                  type="button"
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 32px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: '120px',
                  }}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    backgroundImage: 'none',
                    backgroundColor: '#7E44EE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '160px',
                    boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)'
                  }}
                  onClick={handleSaveAdmin}
                >
                  Save Admin User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete OTP Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 32, color: '#f59e0b' }}>⚠️</span>
              <h2>Confirm Profile Deletion</h2>
              <p>Deleting this admin's profile is irreversible. Please enter the OTP sent to the company owner to continue.</p>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>Cancel</button>
              <button onClick={handleVerifyDelete} style={{ padding: '10px 20px', borderRadius: 6, background: '#7E44EE', color: '#fff', border: 'none' }} disabled={otp.length !== 6}>Confirm Deletion</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editAdmin && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '50px 60px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
            width: '100%',
            maxWidth: '600px',
            border: '1px solid #e8ecf0',
            position: 'relative',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 40 }}>
              <h1 style={{
                color: '#7E44EE',
                fontSize: '32px',
                fontWeight: '700',
                textAlign: 'left',
                margin: 0
              }}>
                Edit Admin User
              </h1>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginLeft: 16 }} onClick={() => setShowEditModal(false)}>
                <X size={28} />
              </button>
            </div>
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%' }} onSubmit={e => e.preventDefault()}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.label}>First Name</label>
                <input value={editAdmin.first_name} onChange={e => setEditAdmin({ ...editAdmin, first_name: e.target.value })} placeholder="First Name" style={styles.input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.label}>Last Name</label>
                <input value={editAdmin.last_name} onChange={e => setEditAdmin({ ...editAdmin, last_name: e.target.value })} placeholder="Last Name" style={styles.input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.label}>Email</label>
                <input value={editAdmin.email} onChange={e => setEditAdmin({ ...editAdmin, email: e.target.value })} placeholder="Email" style={styles.input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.label}>Phone</label>
                <input value={editAdmin.phone} onChange={e => setEditAdmin({ ...editAdmin, phone: e.target.value })} placeholder="Phone" style={styles.input} />
              </div>
              {/* Empty div to fill grid if needed */}
              <div></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, gridColumn: '1 / span 2', marginTop: 24 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ ...styles.cancelButton, minWidth: 120 }}>Cancel</button>
                <button
                  type="button"
                  onClick={handleSaveEditAdmin}
                  style={{
                    backgroundColor: '#7E44EE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '160px',
                    boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;