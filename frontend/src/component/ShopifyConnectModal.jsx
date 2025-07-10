import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectShopify } from '../store/companySlice';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '28rem',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#1a1a1a'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    color: '#4a5568',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    color: '#4a5568',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
    cursor: 'not-allowed'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%'
  },
  primaryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    width: '100%'
  },
  secondaryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    width: '100%'
  }
};

const ShopifyConnectModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [domain, setDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChangeCredentials, setShowChangeCredentials] = useState(false);
  
  // Safely get Shopify connection status and company profile with fallback defaults
  const {
    shopifyConnected = false,
    profile: companyProfile = {}
  } = useSelector(state => state.company) || {};

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resultAction = await dispatch(connectShopify({ 
        domain, 
        access_token: accessToken 
      })).unwrap();
      
      if (onSuccess) {
        onSuccess();
      }
      setShowChangeCredentials(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect to Shopify');
    } finally {
      setLoading(false);
    }
  };

  const handleShowChangeCredentials = () => {
    setShowChangeCredentials(true);
    setDomain(companyProfile?.shopify_domain || '');
    setAccessToken('');
    setError('');
  };

  if (!isOpen) return null;

  // If already connected and not changing credentials, show connected state
  if (shopifyConnected && !showChangeCredentials) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <h2 style={modalStyles.title}>Shopify Connected</h2>
          <p style={{ marginBottom: '1rem', color: '#4a5568' }}>
            Your Shopify store is already connected. You can sync customers from the customers page.
          </p>
          <div style={modalStyles.buttonContainer}>
          <button
            onClick={onClose}
              style={modalStyles.primaryButton}
          >
            Close
          </button>
            <button
              onClick={handleShowChangeCredentials}
              style={modalStyles.secondaryButton}
            >
              Change Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.title}>{shopifyConnected ? 'Update Shopify Credentials' : 'Connect to Shopify'}</h2>
        <form onSubmit={handleConnect}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Shop Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
              style={modalStyles.input}
              required
            />
          </div>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="shpat_..."
              style={modalStyles.input}
              required
            />
          </div>
          {error && (
            <div style={modalStyles.error}>{error}</div>
          )}
          <div style={modalStyles.buttonGroup}>
            <button
              type="button"
              onClick={() => {
                setShowChangeCredentials(false);
                onClose();
              }}
              style={modalStyles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...modalStyles.submitButton,
                ...(loading ? modalStyles.disabledButton : {})
              }}
            >
              {loading ? 'Connecting...' : (shopifyConnected ? 'Update Connection' : 'Connect')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopifyConnectModal; 