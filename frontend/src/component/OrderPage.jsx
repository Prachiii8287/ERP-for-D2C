import React, { useState, useEffect } from 'react';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const OrderPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [syncingShiprocket, setSyncingShiprocket] = useState(false);
  const [refreshingShipping, setRefreshingShipping] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Fetch orders from our database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update ERP Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.post(`/api/orders/${orderId}/update_status/`, { 
        status_type: 'erp_status',
        status: newStatus 
      });
      await fetchOrders();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Fetch orders from Shopify
  const handleFetchFromShopify = async () => {
    try {
      setSyncingOrders(true);
      setError(null); // Clear any previous errors
      const response = await api.post('/api/orders/sync_shopify_orders/');
      await fetchOrders(); // Refresh the orders list after syncing
      alert(response.data.message || 'Successfully synced orders from Shopify!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to sync orders from Shopify. Please try again.';
      setError(errorMessage);
      console.error('Error syncing Shopify orders:', err);
      alert(errorMessage); // Show error in alert for better visibility
    } finally {
      setSyncingOrders(false);
    }
  };

  // Sync with Shiprocket
  const handleSyncShiprocket = async (orderId) => {
    try {
      setSyncingShiprocket(true);
      await api.post(`/api/orders/${orderId}/sync_to_shiprocket/`);
      await fetchOrders();
      setError(null);
      alert('Successfully synced with Shiprocket!');
    } catch (err) {
      setError('Failed to sync with Shiprocket. Please try again.');
      console.error('Error syncing with Shiprocket:', err);
    } finally {
      setSyncingShiprocket(false);
    }
  };

  // Refresh Shipping Status
  const handleRefreshShipping = async (orderId) => {
    try {
      setRefreshingShipping(true);
      await api.post(`/api/orders/${orderId}/refresh_shipping_status/`);
      await fetchOrders();
      setError(null);
    } catch (err) {
      setError('Failed to refresh shipping status. Please try again.');
      console.error('Error refreshing shipping status:', err);
    } finally {
      setRefreshingShipping(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_details?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_details?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         order.erp_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      border: 'none',
      display: 'inline-block'
    };

    switch (status?.toLowerCase()) {
      case 'delivered':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'shipped':
        return { ...baseStyle, backgroundColor: '#cce5ff', color: '#0056b3' };
      case 'processing':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'paid':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'failed':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { ...baseStyle, backgroundColor: '#e9ecef', color: '#495057' };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading orders...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '2px solid #7E44EE',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(126, 68, 238, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#374151',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                minWidth: '150px'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={fetchOrders}
              style={{
                backgroundColor: '#ffffff',
                color: '#7E44EE',
                border: '1px solid #7E44EE',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh Orders"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <button
            style={{
              backgroundColor: syncingOrders ? '#6935c5' : '#7E44EE',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: syncingOrders ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleFetchFromShopify}
            disabled={syncingOrders}
          >
            <Download size={18} />
            {syncingOrders ? 'Syncing...' : 'Fetch from Shopify'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Table Header */}
          <div style={{
            backgroundColor: '#7E44EE',
            color: 'white',
            padding: '16px 20px',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Orders ({filteredOrders.length})</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Customer</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Payment Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>ERP Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Shipping Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#7E44EE', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      No orders found. {!orders.length && 'Click "Fetch from Shopify" to sync orders.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.uuid}
                      style={{ 
                        borderTop: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{order.order_id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {order.customer_details?.full_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        ₹{Number(order.total_price).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span style={getStatusStyle(order.payment_status)}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <select
                          value={order.erp_status}
                          onChange={(e) => handleUpdateStatus(order.uuid, e.target.value)}
                          disabled={updatingStatus}
                          style={{
                            ...getStatusStyle(order.erp_status),
                            cursor: updatingStatus ? 'not-allowed' : 'pointer',
                            border: 'none',
                            outline: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            background: 'transparent'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={getStatusStyle(order.shipment_status || 'Pending')}>
                            {order.shipment_status || 'Pending'}
                          </span>
                          <button
                            onClick={() => handleRefreshShipping(order.uuid)}
                            disabled={refreshingShipping}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: refreshingShipping ? 'not-allowed' : 'pointer',
                              padding: '4px'
                            }}
                          >
                            <RefreshCw size={14} color="#7E44EE" />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleSyncShiprocket(order.uuid)}
                            disabled={syncingShiprocket}
                            style={{
                              backgroundColor: '#7E44EE',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: syncingShiprocket ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Ship
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Eye size={18} color="#7E44EE" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#7E44EE' }}>Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>
            <div>
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
              <p><strong>Created At:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p><strong>Total Price:</strong> ₹{Number(selectedOrder.total_price).toLocaleString()}</p>
              
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {selectedOrder.customer_details?.full_name}</p>
              <p><strong>Email:</strong> {selectedOrder.customer_details?.email}</p>
              
              <h3>Shipping Details</h3>
              <p><strong>Address:</strong> {selectedOrder.shipping_address?.address1}</p>
              <p><strong>City:</strong> {selectedOrder.shipping_address?.city}</p>
              <p><strong>State:</strong> {selectedOrder.shipping_address?.province}</p>
              <p><strong>Postal Code:</strong> {selectedOrder.shipping_address?.zip}</p>
              
              <h3>Order Items</h3>
              {selectedOrder.line_items?.map((item, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <p><strong>{item.title}</strong></p>
                  <p>Quantity: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;