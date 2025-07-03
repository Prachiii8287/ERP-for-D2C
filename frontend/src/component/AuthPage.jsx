import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError } from '../store/authSlice';
import Logo from './Logo.png';

const INDUSTRY_CHOICES = [
    { value: 'IT', label: 'Information Technology' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'OTHER', label: 'Other' }
];

export default function AuthPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        companyName: '',
        registrationNumber: '',
        industry: 'OTHER',
        website: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'PARENT') {
                navigate('/company-dashboard');
            } else if (user.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!isLogin) {
            // Required fields validation
            const requiredFields = {
                firstName: 'First Name',
                lastName: 'Last Name',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                companyName: 'Company Name',
                registrationNumber: 'Registration Number',
                industry: 'Industry',
                address: 'Address',
                city: 'City',
                state: 'State',
                postalCode: 'Postal Code',
                country: 'Country'
            };

            for (const [field, label] of Object.entries(requiredFields)) {
                if (!formData[field]) {
                    alert(`${label} is required`);
                    return false;
                }
            }

            // Password validation
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match');
                return false;
            }

            if (formData.password.length < 8) {
                alert('Password must be at least 8 characters long');
                return false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                return false;
            }

            // Website validation (if provided)
            if (formData.website && !formData.website.startsWith('http')) {
                formData.website = 'https://' + formData.website;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            if (isLogin) {
                await dispatch(login({
                    email: formData.email,
                    password: formData.password
                }));
            } else {
                const registrationData = {
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: 'PARENT',
                    phone: formData.phone || '',
                    company_name: formData.companyName,
                    registration_number: formData.registrationNumber,
                    industry: formData.industry,
                    website: formData.website || '',
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postalCode,
                    country: formData.country
                };
                
                await dispatch(register(registrationData));
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            companyName: '',
            registrationNumber: '',
            industry: 'OTHER',
            website: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        });
        dispatch(clearError());
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(100deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        card: {
            width: '100%',
            maxWidth: '1200px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            minHeight: '600px'
        },
        leftSide: {
            flex: '1',
            background: '#7E44EE',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: 'white',
            textAlign: 'center'
        },
        illustration: {
            position: 'relative',
            zIndex: 10
        },
        illustrationCircle: {
            width: '200px',
            height: '200px',
            margin: '0 auto 32px',
            position: 'relative'
        },
        circle1: {
            position: 'absolute',
            inset: '0',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
        },
        logoImage: {
            width: '60px',
            height: '60px',
            objectFit: 'contain', // Maintains aspect ratio
            borderRadius: '4px' // Optional: slight rounding
        },
        circle2: {
            position: 'absolute',
            inset: '16px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite 0.5s'
        },
        circle3: {
            position: 'absolute',
            inset: '32px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite 1s'
        },
        centerIcon: {
            position: 'absolute',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        iconBox: {
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(12deg)',
            transition: 'transform 0.5s ease',
            cursor: 'pointer'
        },
        iconBoxHover: {
            transform: 'rotate(0deg)'
        },
        userIcon: {
            width: '40px',
            height: '40px',
            color: '#4f46e5'
        },
        leftTitle: {
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px'
        },
        leftSubtitle: {
            fontSize: '18px',
            opacity: 0.9,
            maxWidth: '300px',
            margin: '0 auto',
            lineHeight: '1.6'
        },
        decorativeElement1: {
            position: 'absolute',
            top: '40px',
            left: '40px',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'bounce 2s infinite 1s'
        },
        decorativeElement2: {
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            width: '48px',
            height: '48px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'bounce 2s infinite 2s'
        },
        decorativeElement3: {
            position: 'absolute',
            top: '50%',
            left: '20px',
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'bounce 2s infinite 1.5s'
        },
        rightSide: {
            flex: '1',
            padding: '50px 50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        },
        formContainer: {
            maxWidth: '500px',
            margin: '0 auto',
            width: '100%'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        title: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
        },
        subtitle: {
            color: '#6b7280',
            fontSize: '10px'
        },
        formGroup: {
            marginBottom: '24px'
        },
        nameGroup: {
            marginBottom: '24px',
            transform: isLogin ? 'translateY(-10px)' : 'translateY(0)',
            opacity: isLogin ? 0 : 1,
            height: isLogin ? '0' : 'auto',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
        },
        inputWrapper: {
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '12px 10px 10px 40px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            background: '#f9fafb',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box'
        },
        inputFocus: {
            borderColor: '#4f46e5',
            background: 'white',
            boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
        },
        inputIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            width: '20px',
            height: '20px'
        },
        passwordToggle: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
        },
        passwordToggleHover: {
            color: '#6b7280'
        },
        submitButton: {
            width: '100%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
        },
        submitButtonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
        },
        toggleSection: {
            textAlign: 'center',
            marginTop: '24px'
        },
        toggleText: {
            color: '#6b7280',
            marginBottom: '16px'
        },
        toggleButton: {
            color: '#4f46e5',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            transition: 'color 0.2s ease'
        },
        toggleButtonHover: {
            color: '#4338ca'
        },
        forgotPassword: {
            marginTop: '24px',
            textAlign: 'center'
        },
        forgotLink: {
            color: '#4f46e5',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.2s ease'
        },
        forgotLinkHover: {
            color: '#4338ca'
        },
        // Responsive styles
        '@media (max-width: 768px)': {
            card: {
                flexDirection: 'column',
                maxWidth: '100%',
                margin: '10px'
            },
            leftSide: {
                padding: '10px 10px'
            },
            rightSide: {
                padding: '10px 10px'
            },
            leftTitle: {
                fontSize: '24px'
            },
            title: {
                fontSize: '24px'
            }
        }
    };

    // Add keyframes for animations
    const keyframes = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @media (max-width: 768px) {
            .auth-card {
                flex-direction: column !important;
            }
        }
    `;
    const LogoComponent = () => (
        <img 
            src={Logo} 
            alt="Company Logo" 
            style={styles.logoImage}
        />
    );

    const UserIcon = () => (
        <svg style={styles.userIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    );

    const MailIcon = () => (
        <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );

    const LockIcon = () => (
        <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );

    const EyeIcon = () => (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
    );

    const ArrowRightIcon = () => (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );

    return (
        <div>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.card} className="auth-card">
                    {/* Left Side - Illustration */}
                    <div style={styles.leftSide}>
                        <div style={styles.illustration}>
                            <div style={styles.illustrationCircle}>
                                <div style={styles.circle1}></div>
                                <div style={styles.circle2}></div>
                                <div style={styles.circle3}></div>
                                <div style={styles.centerIcon}>
                                    <div style={styles.iconBox}>
                                        <LogoComponent />
                                    </div>
                                </div>
                            </div>
                            <h2 style={styles.leftTitle}>
                                {isLogin ? 'Welcome Back!' : 'Welcome!'}
                            </h2>
                            <p style={styles.leftSubtitle}>
                                {isLogin 
                                    ? 'Sign in to access your account and continue your journey with us.'
                                    : 'Create your account and start your amazing journey with our platform.'
                                }
                            </p>
                        </div>
                        
                        {/* Decorative elements */}
                        <div style={styles.decorativeElement1}></div>
                        <div style={styles.decorativeElement2}></div>
                        <div style={styles.decorativeElement3}></div>
                    </div>

                    {/* Right Side - Form */}
                    <div style={styles.rightSide}>
                        <div style={styles.formContainer}>
                            <div style={styles.header}>
                                <h1 style={styles.title}>
                                    {isLogin ? 'Sign In' : 'Register Your Company'}
                                </h1>
                                <p style={styles.subtitle}>
                                    {isLogin 
                                        ? 'Sign in to access your account'
                                        : 'Create your company account and start managing your business'
                                    }
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div style={{
                                        padding: '10px',
                                        marginBottom: '20px',
                                        backgroundColor: '#fee2e2',
                                        border: '1px solid #ef4444',
                                        borderRadius: '8px',
                                        color: '#dc2626'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                {!isLogin && (
                                    <>
                                        {/* Personal Information Section */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>
                                                Personal Information
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="firstName">First Name *</label>
                                                    <input
                                                        type="text"
                                                        id="firstName"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter your first name"
                                                        required
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="lastName">Last Name *</label>
                                                    <input
                                                        type="text"
                                                        id="lastName"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter your last name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="email">Email Address *</label>
                                                    <div style={styles.inputWrapper}>
                                                        <MailIcon />
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            style={styles.input}
                                                            placeholder="Enter your email"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="phone">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Information Section */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>
                                                Company Information
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="companyName">Company Name *</label>
                                                    <input
                                                        type="text"
                                                        id="companyName"
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter company name"
                                                        required
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="registrationNumber">Registration Number *</label>
                                                    <input
                                                        type="text"
                                                        id="registrationNumber"
                                                        name="registrationNumber"
                                                        value={formData.registrationNumber}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter registration number"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="industry">Industry *</label>
                                                    <select
                                                        id="industry"
                                                        name="industry"
                                                        value={formData.industry}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        required
                                                    >
                                                        {INDUSTRY_CHOICES.map(choice => (
                                                            <option key={choice.value} value={choice.value}>
                                                                {choice.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="website">Website</label>
                                                    <input
                                                        type="url"
                                                        id="website"
                                                        name="website"
                                                        value={formData.website}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter company website"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={styles.label} htmlFor="address">Address *</label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    style={{ ...styles.input, minHeight: '80px' }}
                                                    placeholder="Enter company address"
                                                    required
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="city">City *</label>
                                                    <input
                                                        type="text"
                                                        id="city"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter city"
                                                        required
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="state">State *</label>
                                                    <input
                                                        type="text"
                                                        id="state"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter state"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="postalCode">Postal Code *</label>
                                                    <input
                                                        type="text"
                                                        id="postalCode"
                                                        name="postalCode"
                                                        value={formData.postalCode}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter postal code"
                                                        required
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="country">Country *</label>
                                                    <input
                                                        type="text"
                                                        id="country"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        style={styles.input}
                                                        placeholder="Enter country"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Section */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>
                                                Account Security
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="password">Password *</label>
                                                    <div style={styles.inputWrapper}>
                                                        <LockIcon />
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            id="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            style={styles.input}
                                                            placeholder="Enter password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            style={styles.passwordToggle}
                                                        >
                                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={styles.label} htmlFor="confirmPassword">Confirm Password *</label>
                                                    <div style={styles.inputWrapper}>
                                                        <LockIcon />
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            style={styles.input}
                                                            placeholder="Confirm password"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isLogin && (
                                    <>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label} htmlFor="email">Email Address</label>
                                            <div style={styles.inputWrapper}>
                                                <MailIcon />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label} htmlFor="password">Password</label>
                                            <div style={styles.inputWrapper}>
                                                <LockIcon />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={styles.passwordToggle}
                                                >
                                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    style={{
                                        ...styles.submitButton,
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                    {!loading && <ArrowRightIcon />}
                                </button>

                                <div style={styles.toggleSection}>
                                    <p style={styles.toggleText}>
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        style={styles.toggleButton}
                                    >
                                        {isLogin ? 'Create Account' : 'Sign In'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}