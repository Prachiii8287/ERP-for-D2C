import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, syncShopifyCustomers, pushCustomerToShopify, updateCustomer, clearError, clearSyncStatus, setError, setSyncStatus } from '../store/customersSlice';
import EditCustomerModal from './EditCustomerModal';
import { toast } from 'react-toastify';

const CustomerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dispatch = useDispatch();

  const {
    items: customers = [],
    loading,
    error,
    syncStatus,
    metadata
  } = useSelector((state) => state.customers);

  const [isSyncing, setIsSyncing] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.id?.toString().includes(searchLower) ||
      (customer.first_name && customer.first_name.toLowerCase().includes(searchLower)) ||
      (customer.last_name && customer.last_name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(searchLower))
    );
  }) : [];

  useEffect(() => {
    console.log('Current customers in state:', customers); // Debug log
    console.log('Loading state:', loading); // Debug log
    console.log('Error state:', error); // Debug log
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (syncStatus || error) {
      const timer = setTimeout(() => {
        dispatch(clearSyncStatus());
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, error, dispatch]);

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFetchShopify = async () => {
    try {
      setIsSyncing(true);
      console.log('Starting Shopify sync...');
      const result = await dispatch(syncShopifyCustomers()).unwrap();
      console.log('Sync result:', result);
      
      // Fetch customers after successful sync
      if (result.success) {
        console.log('Sync successful, fetching updated customers...');
        await dispatch(fetchCustomers());
        toast.success('Customers synced from Shopify successfully');
      }
    } catch (error) {
      console.error('Error syncing Shopify customers:', error);
      // Show error to user
      dispatch(setError(error.message || 'Failed to sync customers from Shopify'));
      toast.error(error.message || 'Failed to sync customers from Shopify');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushAllToShopify = async () => {
    try {
      setIsSyncing(true);
      const results = {
        success: [],
        failed: []
      };

      for (const customer of customers) {
        try {
          await dispatch(pushCustomerToShopify(customer.id)).unwrap();
          console.log(`Successfully pushed customer ${customer.id} to Shopify`);
          results.success.push(customer.id);
        } catch (error) {
          console.error(`Failed to push customer ${customer.id} to Shopify:`, error);
          results.failed.push({
            id: customer.id,
            error: error.message || 'Unknown error'
          });
        }
      }

      // Show summary message
      const message = `Push completed: ${results.success.length} customers pushed successfully` +
        (results.failed.length > 0 ? `, ${results.failed.length} failed` : '');
      
      // Log detailed results for debugging
      console.log('Push all results:', results);

      // Refresh the customer list after pushing all
      await dispatch(fetchCustomers());

      // Show success/failure message
      if (results.failed.length > 0) {
        dispatch(setError(message));
        toast.error(message);
      } else {
        dispatch(setSyncStatus(message));
        toast.success(message);
      }
    } catch (error) {
      console.error('Error in push all operation:', error);
      dispatch(setError('Failed to complete push all operation'));
      toast.error('Failed to complete push all operation');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushToShopify = async (customerId) => {
    try {
      await dispatch(pushCustomerToShopify(customerId)).unwrap();
      console.log(`Successfully pushed customer ${customerId} to Shopify`);
      // Refresh the customer list after pushing
      await dispatch(fetchCustomers());
      toast.success('Customer pushed to Shopify successfully');
    } catch (error) {
      console.error(`Failed to push customer ${customerId} to Shopify:`, error);
      toast.error('Failed to push customer to Shopify');
    }
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (formData) => {
    try {
      console.log('Selected Customer:', selectedCustomer); // Debug log
      console.log('Form Data:', formData); // Debug log

      // Properly handle tags - ensure it's a JSON string
      const tags = formData.tags ? JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)) : '[]';

      // Format the address properly
      const formattedAddress = {
        address1: formData.default_address_line || '',
        city: formData.city || '',
        province: formData.state || '',
        country: formData.country || '',
      };

      // Create addresses array with the formatted address
      const addresses = [formattedAddress];

      // Preserve the original customer data and merge with form updates
      const updateData = {
        id: selectedCustomer.id,
        shopify_customer_id: selectedCustomer.shopify_customer_id,
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        note: formData.note || '',
        tags: tags, // Now it's a JSON string
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || '',
        default_address_line: formData.default_address_line || '',
        default_address_formatted_area: formData.default_address_formatted_area || '',
        addresses: addresses,
        // Preserve read-only fields
        number_of_orders: selectedCustomer.number_of_orders,
        amount_spent: selectedCustomer.amount_spent,
        currency_code: selectedCustomer.currency_code,
        verified_email: selectedCustomer.verified_email,
        created_at: selectedCustomer.created_at,
        updated_at: selectedCustomer.updated_at
      };

      console.log('Update Data:', updateData); // Debug log

      const result = await dispatch(updateCustomer(updateData)).unwrap();
      console.log('Update Result:', result); // Debug log

      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      // Refresh the customer list
      dispatch(fetchCustomers());
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error('Failed to update customer');
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' // Prevent outer container from scrolling
    }}>
      {/* Fixed Content Container */}
      <div style={{
        padding: '20px',
        width: '100%',
        flexShrink: 0
      }}>
        {/* Controls Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '20px',
          width: '100%'
        }}>
          {/* Search Filter */}
          <div style={{
            position: 'relative',
            flex: 1,
            maxWidth: '400px'
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#7E44EE',
              width: '18px',
              height: '18px'
            }} />
          <input
            type="text"
              placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 45px',
                border: '2px solid #7E44EE',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            />
          </div>

          {/* Shopify Sync Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleFetchShopify}
              disabled={loading || isSyncing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: loading || isSyncing ? '#9B71EE' : '#7E44EE',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: loading || isSyncing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <Download size={18} />
              {isSyncing ? 'Syncing...' : 'Fetch from Shopify'}
            </button>

            <button
              onClick={handlePushAllToShopify}
              disabled={loading || !customers.length}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: loading || !customers.length ? '#9B71EE' : '#7E44EE',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: loading || !customers.length ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <Upload size={18} />
              Push All to Shopify
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(syncStatus || error) && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: error ? '#ffebee' : '#e8f5e9',
            color: error ? '#dc3545' : '#28a745',
            borderRadius: '6px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <span>
              {error ? 
                (typeof error === 'object' && error !== null
                  ? (error.message || 'An error occurred') 
                  : error || 'An error occurred')
                : (typeof syncStatus === 'object' && syncStatus !== null
                  ? (syncStatus.message || 'Operation successful') 
                  : syncStatus || 'Operation successful')
              }
            </span>
            <button
              onClick={() => {
                dispatch(clearError());
                dispatch(clearSyncStatus());
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: error ? '#dc3545' : '#28a745'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {(loading || isSyncing) && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '20px',
            width: '100%'
          }}>
            {loading ? 'Loading customers...' : 'Syncing with Shopify...'}
          </div>
        )}
      </div>
      
      {/* Scrollable Table Container */}
      {!loading && !isSyncing && (
        <div style={{ 
          flex: 1,
          minHeight: 0,
          padding: '0 20px 20px 20px',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: '20px',
            right: '20px',
            bottom: 0,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              overflowX: 'auto',
              overflowY: 'auto',
              flex: 1
            }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#7E44EE',
                  zIndex: 1
                }}>
                  <tr style={{ borderBottom: '2px solid #7E44EE' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Orders</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Amount Spent</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Currency</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Verified Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Address</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>City</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>State</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Country</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Tags</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Note</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Created At</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Updated At</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white' }}>Actions</th>
                  </tr>
                </thead>
            <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px 16px' }}>{customer.shopify_customer_id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {customer.first_name} {customer.last_name}
                  </td>
                        <td style={{ padding: '12px 16px' }}>{customer.email}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.phone}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.number_of_orders}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {customer.amount_spent}
                  </td>
                        <td style={{ padding: '12px 16px' }}>{customer.currency_code}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {customer.verified_email ? 'Yes' : 'No'}
                  </td>
                        <td style={{ padding: '12px 16px' }}>
                          {customer.default_address_line}
                          {customer.default_address_formatted_area && (
                            <br />
                          )}
                          {customer.default_address_formatted_area}
                  </td>
                        <td style={{ padding: '12px 16px' }}>{customer.city}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.state}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.country}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.tags}</td>
                        <td style={{ padding: '12px 16px' }}>{customer.note}</td>
                        <td style={{ padding: '12px 16px' }}>{formatDate(customer.created_at)}</td>
                        <td style={{ padding: '12px 16px' }}>{formatDate(customer.updated_at)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditClick(customer)}
                              style={{
                                backgroundColor: '#7E44EE',
                                color: 'white',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                boxShadow: '0 2px 4px rgba(126, 68, 238, 0.2)',
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handlePushToShopify(customer.id)}
                              style={{
                                backgroundColor: '#7E44EE',
                                color: 'white',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                boxShadow: '0 2px 4px rgba(126, 68, 238, 0.2)',
                              }}
                            >
                              <Upload size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="17" style={{ padding: '20px', textAlign: 'center' }}>
                        No customers found
                  </td>
                </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default CustomerPage;