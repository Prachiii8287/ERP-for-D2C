// frontend/src/component/CustomerSyncToolbar.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCustomers,
  syncShopifyCustomers,
} from '../store/customersSlice';

const CustomerSyncToolbar = () => {
  const dispatch = useDispatch();
  const { loading, error, syncStatus } = useSelector((state) => state.customers);

  const handleRefresh = () => {
    dispatch(fetchCustomers());
  };

  const handleSync = async () => {
    const result = await dispatch(syncShopifyCustomers());
    if (syncShopifyCustomers.fulfilled.match(result)) {
      dispatch(fetchCustomers());
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      <button
        onClick={handleRefresh}
        disabled={loading}
        style={{ padding: '6px 12px', cursor: 'pointer' }}
      >
        Refresh Customers
      </button>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{ padding: '6px 12px', cursor: 'pointer' }}
      >
        Fetch from Shopify
      </button>
      {syncStatus && (
        <span style={{ marginLeft: '16px', fontSize: '12px', color: 'green' }}>
          {syncStatus}
        </span>
      )}
      {error && (
        <span style={{ marginLeft: '16px', fontSize: '12px', color: 'red' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default CustomerSyncToolbar;
