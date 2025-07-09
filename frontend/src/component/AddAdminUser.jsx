// frontend/src/components/AddAdminUser.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Save, User, Mail, Phone, Lock } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { createAdminUser } from '../store/companySlice';

// const AddAdminUser = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading, errors } = useSelector((state) => state.company);
//   const user = useSelector((state) => state.auth.user);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [localErrors, setLocalErrors] = useState({});

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (localErrors[name]) {
//       setLocalErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//     if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
//     setLocalErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     const payload = {
//       first_name: formData.firstName,
//       last_name: formData.lastName,
//       email: formData.email,
//       phone: formData.phone,
//       password: formData.password,
//       role: 'ADMIN',
//       company_id: user?.company
//     };
//     try {
//       await dispatch(createAdminUser(payload)).unwrap();
//       navigate('/admin-users');
//     } catch (error) {
//       setLocalErrors({ submit: error?.message || error || 'Failed to create admin user. Please try again.' });
//     }
//   };

//   const handleBack = () => {
//     navigate('/admin-users');
//   };

//   const styles = {
//     container: {
//       padding: '32px',
//       backgroundColor: '#f8f9fa',
//       minHeight: '100vh',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center'
//     },
//     header: {
//       display: 'flex',
//       alignItems: 'center',
//       marginBottom: '32px'
//     },
//     backButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       backgroundColor: 'transparent',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       padding: '8px 16px',
//       cursor: 'pointer',
//       color: '#6b7280',
//       transition: 'all 0.2s ease',
//       marginRight: '16px'
//     },
//     title: {
//       fontSize: '32px',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       margin: 0
//     },
//     card: {
//       backgroundColor: 'white',
//       borderRadius: '12px',
//       padding: '32px',
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
//       border: '1px solid #e5e7eb',
//       maxWidth: '600px'
//     },
//     form: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '24px'
//     },
//     row: {
//       display: 'flex',
//       gap: '16px'
//     },
//     formGroup: {
//       display: 'flex',
//       flexDirection: 'column',
//       flex: 1
//     },
//     label: {
//       fontSize: '14px',
//       fontWeight: '600',
//       color: '#374151',
//       marginBottom: '8px',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px'
//     },
//     inputWrapper: {
//       position: 'relative'
//     },
//     input: {
//       width: '100%',
//       padding: '12px 16px',
//       border: '2px solid #e5e7eb',
//       borderRadius: '8px',
//       fontSize: '16px',
//       transition: 'all 0.2s ease',
//       outline: 'none',
//       boxSizing: 'border-box'
//     },
//     inputError: {
//       borderColor: '#ef4444'
//     },
//     inputFocus: {
//       borderColor: '#7E44EE',
//       boxShadow: '0 0 0 3px rgba(126, 68, 238, 0.1)'
//     },
//     error: {
//       color: '#ef4444',
//       fontSize: '14px',
//       marginTop: '4px'
//     },
//     submitError: {
//       color: '#ef4444',
//       fontSize: '14px',
//       textAlign: 'center',
//       padding: '12px',
//       backgroundColor: '#fee2e2',
//       border: '1px solid #ef4444',
//       borderRadius: '6px'
//     },
//     buttonGroup: {
//       display: 'flex',
//       gap: '16px',
//       justifyContent: 'flex-end',
//       marginTop: '8px'
//     },
//     cancelButton: {
//       padding: '12px 24px',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       backgroundColor: 'white',
//       color: '#6b7280',
//       cursor: 'pointer',
//       fontSize: '16px',
//       fontWeight: '600',
//       transition: 'all 0.2s ease'
//     },
//     submitButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '12px 24px',
//       backgroundColor: '#7E44EE',
//       color: 'white',
//       border: 'none',
//       borderRadius: '8px',
//       fontSize: '16px',
//       fontWeight: '600',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       // opacity: loading ? 0.7 : 1
//     }
//   };

//   return (
//     <div style={styles.container}>
//       {/* Back Button */}
//       <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
//         <button 
//           style={styles.backButton}
//           onClick={handleBack}
//           onMouseEnter={(e) => {
//             e.target.style.backgroundColor = '#f3f4f6';
//             e.target.style.borderColor = '#9ca3af';
//             e.target.style.color = 'white';
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.backgroundColor = 'transparent';
//             e.target.style.borderColor = '#d1d5db';
//             e.target.style.color = '#6b7280';
//           }}
//         >
//           <ArrowLeft size={20} />
//           Back
//         </button>
//       </div>
//       {/* Header */}
//       <div style={styles.header}>
//         <h1 style={{
//           color: '#7E44EE',
//           fontSize: '32px',
//           fontWeight: '700',
//           textAlign: 'left',
//           margin: 0,
//           background: 'none',
//           backgroundImage: 'none',
//           WebkitBackgroundClip: 'unset',
//           WebkitTextFillColor: 'unset',
//           backgroundClip: 'unset',
//           padding: 0,
//           border: 'none',
//           boxShadow: 'none'
//         }}>
//           Add Admin User
//         </h1>
//       </div>

//       {/* Form */}
//       <div style={styles.card}>
//         <form onSubmit={handleSubmit} style={styles.form}>
//           {/* Name Row */}
//           <div style={styles.row}>
//             <div style={styles.formGroup}>
//               <label htmlFor="firstName" style={styles.label}>
//                 <User size={16} />
//                 First Name *
//               </label>
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.firstName ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.firstName ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Enter first name"
//                 required
//               />
//               {localErrors.firstName && <div style={styles.error}>{localErrors.firstName}</div>}
//             </div>

//             <div style={styles.formGroup}>
//               <label htmlFor="lastName" style={styles.label}>
//                 Last Name *
//               </label>
//               <input
//                 type="text"
//                 id="lastName"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.lastName ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.lastName ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Enter last name"
//                 required
//               />
//               {localErrors.lastName && <div style={styles.error}>{localErrors.lastName}</div>}
//             </div>
//           </div>

//           {/* Contact Row */}
//           <div style={styles.row}>
//             <div style={styles.formGroup}>
//               <label htmlFor="email" style={styles.label}>
//                 <Mail size={16} />
//                 Email Address *
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.email ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.email ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Enter email address"
//                 required
//               />
//               {localErrors.email && <div style={styles.error}>{localErrors.email}</div>}
//             </div>

//             <div style={styles.formGroup}>
//               <label htmlFor="phone" style={styles.label}>
//                 <Phone size={16} />
//                 Phone Number *
//               </label>
//               <input
//                 type="tel"
//                 id="phone"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.phone ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.phone ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Enter phone number"
//                 required
//               />
//               {localErrors.phone && <div style={styles.error}>{localErrors.phone}</div>}
//             </div>
//           </div>

//           {/* Password Row */}
//           <div style={styles.row}>
//             <div style={styles.formGroup}>
//               <label htmlFor="password" style={styles.label}>
//                 <Lock size={16} />
//                 Password *
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.password ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.password ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Enter password"
//                 required
//               />
//               {localErrors.password && <div style={styles.error}>{localErrors.password}</div>}
//             </div>

//             <div style={styles.formGroup}>
//               <label htmlFor="confirmPassword" style={styles.label}>
//                 Confirm Password *
//               </label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 style={{
//                   ...styles.input,
//                   ...(localErrors.confirmPassword ? styles.inputError : {})
//                 }}
//                 onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = localErrors.confirmPassword ? '#ef4444' : '#e5e7eb';
//                   e.target.style.boxShadow = 'none';
//                 }}
//                 placeholder="Confirm password"
//                 required
//               />
//               {localErrors.confirmPassword && <div style={styles.error}>{localErrors.confirmPassword}</div>}
//             </div>
//           </div>

//           {/* Submit Error */}
//           {localErrors.submit && (
//             <div style={styles.submitError}>{localErrors.submit}</div>
//           )}
//           {errors?.adminUser && (
//             <div style={styles.submitError}>{errors.adminUser}</div>
//           )}

//           {/* Buttons */}
//           <div style={styles.buttonGroup}>
//             <button
//               type="button"
//               onClick={handleBack}
//               style={styles.cancelButton}
//               onMouseEnter={(e) => {
//                 e.target.style.backgroundColor = '#f3f4f6';
//                 e.target.style.color = 'white';
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.backgroundColor = 'white';
//                 e.target.style.color = '#6b7280';
//               }}
//             >
//               Cancel
//             </button>
            
//             <button
//               type="submit"
//               disabled={loading?.createAdminUser}
//               style={{
//                 ...styles.submitButton,
//                 background: 'none',
//                 backgroundImage: 'none',
//                 backgroundColor: '#7E44EE',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 fontSize: '16px',
//                 fontWeight: '600',
//                 padding: '12px 24px',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//                 minWidth: '160px',
//                 boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)'
//               }}
//               onMouseEnter={e => {
//                 if (!loading?.createAdminUser) {
//                   e.target.style.backgroundColor = '#6B2FD9';
//                   e.target.style.transform = 'translateY(-1px)';
//                 }
//               }}
//               onMouseLeave={e => {
//                 if (!loading?.createAdminUser) {
//                   e.target.style.backgroundColor = '#7E44EE';
//                   e.target.style.transform = 'translateY(0)';
//                 }
//               }}
//             >
//               {loading?.createAdminUser ? (
//                 <>
//                   <div style={{
//                     width: '16px',
//                     height: '16px',
//                     border: '2px solid #ffffff',
//                     borderTop: '2px solid transparent',
//                     borderRadius: '50%',
//                     animation: 'spin 1s linear infinite'
//                   }}></div>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={20} />
//                   Save Admin User
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AddAdminUser;