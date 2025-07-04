import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const products = [
    {
      id: 'PRD-001',
      name: 'Wireless Bluetooth Headphones',
      priceRange: '₹7,999 - ₹12,499',
      stockStatus: 'In Stock',
      category: 'Electronics',
      vendor: 'AudioTech Solutions',
      description: 'High-quality wireless headphones with noise cancellation'
    },
    {
      id: 'PRD-002',
      name: 'Ergonomic Office Chair',
      priceRange: '₹24,999 - ₹39,999',
      stockStatus: 'Low Stock',
      category: 'Furniture',
      vendor: 'ComfortSeating Inc.',
      description: 'Premium ergonomic chair with lumbar support'
    },
    {
      id: 'PRD-003',
      name: 'Smart Home Security Camera',
      priceRange: '₹15,999 - ₹24,999',
      stockStatus: 'Out of Stock',
      category: 'Security',
      vendor: 'SecureHome Ltd.',
      description: '4K smart camera with night vision and motion detection'
    },
    {
      id: 'PRD-004',
      name: 'Organic Coffee Beans',
      priceRange: '₹1,199 - ₹1,999',
      stockStatus: 'In Stock',
      category: 'Food & Beverages',
      vendor: 'Mountain Peak Coffee',
      description: 'Premium organic single-origin coffee beans'
    },
    {
      id: 'PRD-005',
      name: 'Fitness Tracker Watch',
      priceRange: '₹15,999 - ₹27,999',
      stockStatus: 'In Stock',
      category: 'Wearables',
      vendor: 'FitTech Innovations',
      description: 'Advanced fitness tracker with heart rate monitoring'
    }
  ];

  const filteredProducts = products.filter(product => 
    Object.values(product).some(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return '#28a745';
      case 'Low Stock': return '#ffc107';
      case 'Out of Stock': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleAction = (action, productId) => {
    alert(`${action} action for product ${productId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>


      {/* Controls Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '20px'
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
            placeholder="Search products..."
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

        {/* Add Product Button */}
        <button
          onClick={() => handleAction('Add', 'new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#7E44EE',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#6a3ac7'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#7E44EE'}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#7E44EE',
          color: 'white',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Products ({filteredProducts.length})
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Product ID</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Product Name</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Price Range</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Stock Status</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Category</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Vendor Name</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Description</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.id} style={{
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                }}>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#7E44EE'
                  }}>{product.id}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{product.name}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#333',
                    fontWeight: 'bold'
                  }}>{product.priceRange}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: `1px solid ${getStatusColor(product.stockStatus)}`,
                      color: getStatusColor(product.stockStatus),
                      backgroundColor: 'white',
                      display: 'inline-block'
                    }}>
                      {product.stockStatus}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{product.category}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#333'
                  }}>{product.vendor}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#666',
                    maxWidth: '200px'
                  }}>{product.description}</td>
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => handleAction('View', product.id)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleAction('Edit', product.id)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleAction('Delete', product.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
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

export default ProductPage;