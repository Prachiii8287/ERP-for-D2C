import React, { useState } from 'react';

const CustomerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded customer data with 8 customers
  const [customers] = useState([
    {
      id: 1,
      firstName: "Thomas",
      lastName: "Shelby",
      email: "thomas.shelby@example.com",
      phone: "+1-555-123-4567",
      numberOfOrders: 5,
      amountSpent: {
        amount: 1299.99,
        currencyCode: "Rs."
      },
      createdAt: "2023-01-15T10:30:00Z",
      updatedAt: "2024-03-10T14:45:00Z",
      note: "VIP customer, prefers express shipping",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["VIP", "Frequent Buyer", "Express Shipping"],
      lifetimeDuration: "2 years 3 months",
      defaultAddress: "123 Main St, New York, NY 10001",
      addresses: ["123 Main St, New York, NY 10001", "456 Oak Ave, Brooklyn, NY 11201"]
    },
    {
      id: 2,
      firstName: "Arthur",
      lastName: "Shelby",
      email: "arthur.shelby@example.com",
      phone: "+1-555-987-6543",
      numberOfOrders: 12,
      amountSpent: {
        amount: 2599.50,
        currencyCode: "Rs."
      },
      createdAt: "2022-08-22T09:15:00Z",
      updatedAt: "2024-02-28T16:20:00Z",
      note: "Regular customer, likes seasonal promotions",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["Regular", "Seasonal Buyer"],
      lifetimeDuration: "1 year 8 months",
      defaultAddress: "789 Pine St, Los Angeles, CA 90210",
      addresses: ["789 Pine St, Los Angeles, CA 90210"]
    },
    {
      id: 3,
      firstName: "Polly",
      lastName: "Gray",
      email: "polly.gray@example.com",
      phone: "+1-555-456-7890",
      numberOfOrders: 3,
      amountSpent: {
        amount: 599.25,
        currencyCode: "Rs."
      },
      createdAt: "2023-11-05T13:45:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
      note: "New customer, interested in tech products",
      verifiedEmail: false,
      validEmailAddress: true,
      tags: ["New Customer", "Tech Enthusiast"],
      lifetimeDuration: "3 months",
      defaultAddress: "321 Elm St, Chicago, IL 60601",
      addresses: ["321 Elm St, Chicago, IL 60601", "654 Maple Ave, Chicago, IL 60602"]
    },
    {
      id: 4,
      firstName: "Michael",
      lastName: "Gray",
      email: "michael.gray@example.com",
      phone: "+1-555-234-5678",
      numberOfOrders: 8,
      amountSpent: {
        amount: 1850.75,
        currencyCode: "Rs."
      },
      createdAt: "2023-03-20T11:22:00Z",
      updatedAt: "2024-03-05T09:30:00Z",
      note: "Premium customer, always orders in bulk",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["Premium", "Bulk Orders", "Loyal"],
      lifetimeDuration: "1 year 1 month",
      defaultAddress: "555 Broadway, San Francisco, CA 94102",
      addresses: ["555 Broadway, San Francisco, CA 94102", "777 Market St, San Francisco, CA 94103"]
    },
    {
      id: 5,
      firstName: "John",
      lastName: "Shelby",
      email: "john.shelby@example.com",
      phone: "+1-555-345-6789",
      numberOfOrders: 15,
      amountSpent: {
        amount: 3250.00,
        currencyCode: "Rs."
      },
      createdAt: "2022-05-10T14:15:00Z",
      updatedAt: "2024-03-12T16:45:00Z",
      note: "Long-time customer, excellent payment history",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["VIP", "Long-term", "Excellent Credit"],
      lifetimeDuration: "2 years 10 months",
      defaultAddress: "999 Houston St, Austin, TX 78701",
      addresses: ["999 Houston St, Austin, TX 78701"]
    },
    {
      id: 6,
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      phone: "+1-555-567-8901",
      numberOfOrders: 2,
      amountSpent: {
        amount: 299.99,
        currencyCode: "Rs."
      },
      createdAt: "2024-01-08T08:45:00Z",
      updatedAt: "2024-02-20T12:30:00Z",
      note: "New customer, small initial orders",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["New Customer", "Small Orders"],
      lifetimeDuration: "2 months",
      defaultAddress: "246 Cedar Ave, Seattle, WA 98101",
      addresses: ["246 Cedar Ave, Seattle, WA 98101", "135 Pine St, Seattle, WA 98102"]
    },
    {
      id: 7,
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      phone: "+1-555-678-9012",
      numberOfOrders: 7,
      amountSpent: {
        amount: 1125.50,
        currencyCode: "Rs."
      },
      createdAt: "2023-07-12T13:20:00Z",
      updatedAt: "2024-02-15T10:15:00Z",
      note: "Corporate account, bulk purchasing",
      verifiedEmail: true,
      validEmailAddress: true,
      tags: ["Corporate", "Bulk", "B2B"],
      lifetimeDuration: "8 months",
      defaultAddress: "888 Corporate Blvd, Dallas, TX 75201",
      addresses: ["888 Corporate Blvd, Dallas, TX 75201", "333 Business Center Dr, Dallas, TX 75202"]
    },
    {
      id: 8,
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@example.com",
      phone: "+1-555-789-0123",
      numberOfOrders: 9,
      amountSpent: {
        amount: 1775.25,
        currencyCode: "Rs."
      },
      createdAt: "2023-02-28T15:30:00Z",
      updatedAt: "2024-03-08T14:20:00Z",
      note: "Fashion enthusiast, seasonal buyer",
      verifiedEmail: false,
      validEmailAddress: true,
      tags: ["Fashion", "Seasonal", "Trendy"],
      lifetimeDuration: "1 year 1 month",
      defaultAddress: "777 Fashion Ave, Miami, FL 33101",
      addresses: ["777 Fashion Ave, Miami, FL 33101"]
    }
  ]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.id.toString().includes(searchLower) ||
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchLower) ||
      customer.numberOfOrders.toString().includes(searchLower) ||
      customer.amountSpent.amount.toString().includes(searchLower) ||
      customer.amountSpent.currencyCode.toLowerCase().includes(searchLower) ||
      customer.note.toLowerCase().includes(searchLower) ||
      customer.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      customer.lifetimeDuration.toLowerCase().includes(searchLower) ||
      customer.defaultAddress.toLowerCase().includes(searchLower) ||
      customer.addresses.some(address => address.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // SAP-inspired styles with purple theme
  const containerStyle = {
    padding: '24px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    color: '#333'
  };

  const headerContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    padding: '16px 24px',
    backgroundColor: '#7E44EE',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(126, 68, 238, 0.15)'
  };

  const headerStyle = {
    color: 'white',
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.5px'
  };

  const headerSubtitleStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    margin: 0,
    fontWeight: '400'
  };

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9'
  };

  const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const searchInputStyle = {
    padding: '10px 16px',
    fontSize: '14px',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    width: '320px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  const searchLabelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    minWidth: '50px'
  };

  const counterStyle = {
    fontSize: '14px',
    color: '#7E44EE',
    fontWeight: '600',
    padding: '8px 16px',
    backgroundColor: 'rgba(126, 68, 238, 0.1)',
    borderRadius: '20px',
    border: '1px solid rgba(126, 68, 238, 0.2)'
  };

  const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #e1e5e9'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    tableLayout: 'fixed'
  };

  const thStyle = {
    backgroundColor: '#7E44EE',
    color: 'white',
    padding: '4px 3px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '11px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    height: '22px'
  };

  const tdStyle = {
    padding: '3px 3px',
    borderBottom: '1px solid #d0d7de',
    borderRight: '1px solid #d0d7de',
    verticalAlign: 'top',
    fontSize: '11px',
    lineHeight: '1.3',
    height: '22px',
    backgroundColor: '#ffffff'
  };

  // Column widths optimized for SAP-style layout
  const columnWidths = {
    id: '70px',
    name: '130px',
    email: '190px',
    phone: '120px',
    orders: '70px',
    amount: '100px',
    created: '110px',
    updated: '110px',
    status: '90px',
    tags: '150px',
    duration: '100px',
    addresses: '210px',
    notes: '170px'
  };

  const rowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    height: '22px'
  });

  const badgeStyle = {
    display: 'inline-block',
    padding: '1px 3px',
    margin: '1px',
    backgroundColor: 'rgba(126, 68, 238, 0.1)',
    color: '#7E44EE',
    borderRadius: '10px',
    fontSize: '8px',
    fontWeight: '600',
    border: '1px solid rgba(126, 68, 238, 0.2)'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '1px 2px',
    borderRadius: '2px',
    fontSize: '7px',
    fontWeight: '600',
    backgroundColor: status ? '#28a745' : '#dc3545',
    color: 'white',
    minWidth: '15px',
    textAlign: 'center',
    border: '1px solid',
    borderColor: status ? '#1e7e34' : '#bd2130'
  });

  const addressStyle = {
    fontSize: '9px',
    color: '#666',
    marginBottom: '1px',
    lineHeight: '1.1'
  };

  const nameStyle = {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    marginBottom: '2px'
  };

  const emailStyle = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  };

  const amountStyle = {
    fontWeight: '600',
    fontSize: '14px',
    color: '#7E44EE'
  };

  const currencyStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '400'
  };

  return (
    <div style={containerStyle}>
      <div style={toolbarStyle}>
        <div style={searchContainerStyle}>
          <label style={searchLabelStyle}>Filter:</label>
          <input
            type="text"
            placeholder="Search customers by any field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            onFocus={(e) => e.target.style.borderColor = '#7E44EE'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>
        <div style={counterStyle}>
          {filteredCustomers.length} of {customers.length} records
        </div>
      </div>
      
      <div style={tableContainerStyle}>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...thStyle, width: columnWidths.id}}>ID</th>
                <th style={{...thStyle, width: columnWidths.name}}>Name</th>
                <th style={{...thStyle, width: columnWidths.email}}>Email</th>
                <th style={{...thStyle, width: columnWidths.phone}}>Phone</th>
                <th style={{...thStyle, width: columnWidths.orders}}>Orders</th>
                <th style={{...thStyle, width: columnWidths.amount}}>Amount</th>
                <th style={{...thStyle, width: columnWidths.created}}>Created</th>
                <th style={{...thStyle, width: columnWidths.updated}}>Updated</th>
                <th style={{...thStyle, width: columnWidths.status}}>Status</th>
                <th style={{...thStyle, width: columnWidths.tags}}>Tags</th>
                <th style={{...thStyle, width: columnWidths.duration}}>Duration</th>
                <th style={{...thStyle, width: columnWidths.addresses}}>Addresses</th>
                <th style={{...thStyle, width: columnWidths.notes}}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr 
                  key={customer.id} 
                  style={rowStyle(index)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                >
                  <td style={{...tdStyle, width: columnWidths.id, textAlign: 'center'}}>
                    {customer.id}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.name}}>
                    <div style={{ fontWeight: '600', fontSize: '10px' }}>
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.email}}>
                    <div style={{ fontSize: '9px', marginBottom: '1px' }}>{customer.email}</div>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      <span style={statusBadgeStyle(customer.verifiedEmail)}>
                        {customer.verifiedEmail ? 'V' : 'U'}
                      </span>
                      <span style={statusBadgeStyle(customer.validEmailAddress)}>
                        {customer.validEmailAddress ? 'OK' : 'X'}
                      </span>
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.phone, fontSize: '9px'}}>
                    {customer.phone}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.orders, textAlign: 'center', fontWeight: '600'}}>
                    {customer.numberOfOrders}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.amount}}>
                    <div style={{ fontWeight: '600', fontSize: '9px' }}>
                      {customer.amountSpent.currencyCode}
                    </div>
                    <div style={{ fontSize: '9px' }}>
                      {customer.amountSpent.amount.toFixed(2)}
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.created, fontSize: '8px'}}>
                    {formatDate(customer.createdAt)}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.updated, fontSize: '8px'}}>
                    {formatDate(customer.updatedAt)}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.status}}>
                    <div style={{ fontSize: '8px', lineHeight: '1.1' }}>
                      <div style={{ marginBottom: '1px' }}>E: <span style={statusBadgeStyle(customer.verifiedEmail)}>
                        {customer.verifiedEmail ? 'Verified' : 'Unverified'}
                      </span></div>
                      <div>A: <span style={statusBadgeStyle(customer.validEmailAddress)}>
                        {customer.validEmailAddress ? 'Valid' : 'Invalid'}
                      </span></div>
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.tags}}>
                    <div>
                      {customer.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} style={badgeStyle}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.duration, fontSize: '9px'}}>
                    {customer.lifetimeDuration}
                  </td>
                  <td style={{...tdStyle, width: columnWidths.addresses}}>
                    <div style={{ fontSize: '8px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '1px' }}>Default:</div>
                      <div style={addressStyle}>{customer.defaultAddress}</div>
                      {customer.addresses.length > 1 && (
                        <>
                          <div style={{ fontWeight: '600', marginTop: '1px', marginBottom: '1px' }}>
                            All:
                          </div>
                          {customer.addresses.slice(1).map((address, addressIndex) => (
                            <div key={addressIndex} style={addressStyle}>
                              {addressIndex + 2}. {address}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{...tdStyle, width: columnWidths.notes}}>
                    <div style={{ fontSize: '9px', color: '#666' }}>
                      {customer.note}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
