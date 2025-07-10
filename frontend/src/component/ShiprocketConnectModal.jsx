import React, { useState, useEffect } from 'react';
import { X, Truck, Mail, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { companyAPI } from '../services/api';

const ShiprocketConnectModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { profile: company } = useSelector((state) => state.company);

  useEffect(() => {
    // Check if Shiprocket is already connected when modal opens
    if (isOpen && company) {
      console.log('Checking company connection:', company);
      
      // Use the integrations field from the company profile
      const isConnected = company.integrations?.shiprocket?.connected || false;
      
      console.log('Connection check:', { 
        isConnected,
        integrations: company.integrations
      });
      
      setConnected(isConnected);
      
      // Only set email and token if they exist
      if (isConnected) {
        setEmail(company.shiprocket_email || '');
        setToken(company.shiprocket_token || '');
      } else {
        setEmail('');
        setToken('');
      }
      
      // Set editing mode based on connection status
      setIsEditing(!isConnected);
    }
  }, [isOpen, company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await companyAPI.updateCompany({
        shiprocket_email: email,
        shiprocket_token: token
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to Shiprocket');
    } finally {
      setLoading(false);
    }
  };

  const ConnectionStatus = ({ isConnected }) => {
    // Only render if we have company data
    if (!company) return null;

    return (
      <div style={{
        backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#16a34a' : '#dc2626',
          boxShadow: `0 0 8px ${isConnected ? '#16a34a40' : '#dc262640'}`,
        }} />
        <span style={{ 
          color: isConnected ? '#16a34a' : '#dc2626', 
          fontWeight: '500' 
        }}>
          {isConnected 
            ? `Connected to Shiprocket with ${company.integrations?.shiprocket?.email || company.shiprocket_email}`
            : `Shiprocket not connected for ${company.name}`
          }
        </span>
      </div>
    );
  };

  const renderConnectedState = () => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <ConnectionStatus isConnected={true} />
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#4b5563', marginBottom: '16px' }}>
          What would you like to do?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#4b5563',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Key size={16} />
            Change Credentials
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
    </div>
  );

  const renderConnectionForm = () => (
    <div>
      <ConnectionStatus isConnected={false} />
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <Mail size={16} />
            Shiprocket Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            <Key size={16} />
            Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Shiprocket token"
            style={styles.input}
            required
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => {
              if (connected) {
                setIsEditing(false);
              } else {
                onClose();
              }
            }}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                'Connecting...'
              ) : (
                <>
                  <Truck size={16} />
                  {connected ? 'Update Connection' : 'Connect Shiprocket'}
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button
          onClick={onClose}
          style={styles.closeButton}
        >
          <X size={20} />
        </button>

        <div style={styles.modalHeader}>
          <Truck size={28} color="#7E44EE" />
          <h2 style={styles.title}>Shiprocket Integration</h2>
        </div>

        {showSuccess && (
          <div style={styles.successMessage}>
            <CheckCircle size={20} />
            Successfully connected to Shiprocket!
          </div>
        )}

        {connected && !isEditing ? renderConnectedState() : renderConnectionForm()}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '500px',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#7E44EE',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default ShiprocketConnectModal; 