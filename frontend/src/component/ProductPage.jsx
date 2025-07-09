import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useSelector } from 'react-redux';

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await productsAPI.getProducts();
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const lowerSearch = searchTerm.toLowerCase();
    const titleMatch = product.title && product.title.toLowerCase().includes(lowerSearch);
    const descMatch = product.description && product.description.toLowerCase().includes(lowerSearch);
    // Check all variant SKUs
    const skuMatch = product.variants && product.variants.some(variant =>
      variant.sku && variant.sku.toLowerCase().includes(lowerSearch)
    );
    return titleMatch || descMatch || skuMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
      case 'In Stock': return '#28a745';
      case 'low_stock':
      case 'Low Stock': return '#ffc107';
      case 'out_of_stock':
      case 'Out of Stock': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleAction = (action, productId) => {
    alert(`${action} action for product ${productId}`);
  };

  const handleEdit = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleView = (productId) => {
    navigate(`/products/${productId}/variants`);
  };

  const handleVariantSelect = (productId, variantIdx) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantIdx }));
  };

  const handleDelete = async (productId) => {
    try {
      await productsAPI.deleteProduct(productId);
      setProducts(products => products.filter(p => p.id !== productId));
      setDeleteModal({ open: false, product: null });
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>{error}</div>;

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
          onClick={() => navigate('/products/add')}
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
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Variant Type</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>Variant Title</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#7E44EE',
                  fontSize: '14px'
                }}>SKU</th>
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
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', color: '#7E44EE' }}>{index + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{product.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
                    {product.variants && product.variants.length > 0 ? (
                      <>
                        <select
                          value={selectedVariants[product.id] ?? 0}
                          onChange={e => handleVariantSelect(product.id, parseInt(e.target.value))}
                          style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 80 }}
                        >
                          {product.variants.map((variant, idx) => (
                            <option key={variant.id || idx} value={idx}>
                              {variant.title} ({variant.sku})
                            </option>
                          ))}
                        </select>
                        <span style={{ marginLeft: 8, fontWeight: 700 }}>
                          {product.variants[selectedVariants[product.id] ?? 0]?.price ?? '-'}
                        </span>
                      </>
                    ) : (
                      product.price ?? '-'
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: `1px solid ${getStatusColor(product.stock_status)}`,
                      color: getStatusColor(product.stock_status),
                      backgroundColor: 'white',
                      display: 'inline-block'
                    }}>
                      {product.stock_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{product.category?.name || (product.category && typeof product.category === 'string' ? product.category : '')}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{product.vendor?.name || (product.vendor && typeof product.vendor === 'string' ? product.vendor : '')}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666', maxWidth: '200px' }}>{product.description}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                    {product.variants && product.variants.length > 0 ? (
                      product.variants[selectedVariants[product.id] ?? 0]?.type || '-'
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                    {product.variants && product.variants.length > 0 ? (
                      product.variants[selectedVariants[product.id] ?? 0]?.title || '-'
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                    {product.variants && product.variants.length > 0 ? (
                      product.variants[selectedVariants[product.id] ?? 0]?.sku || '-'
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleView(product.id)} style={{ marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="View Variants">
                        <Eye color="#28a745" />
                      </button>
                      <button onClick={() => handleEdit(product.id)} style={{ marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="Edit Product">
                        <Edit color="#ffc107" />
                      </button>
                      {user && (user.role === 'ADMIN' || user.role === 'PARENT') && (
                        <button onClick={() => setDeleteModal({ open: true, product })} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Product">
                          <Trash2 color="#dc3545" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '32px 36px',
            minWidth: 340,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#7E44EE', marginBottom: 16 }}>Confirm Delete</h2>
            <div style={{ marginBottom: 12 }}>
              Are you sure you want to delete the product<br />
              <b>"{deleteModal.product?.title}"</b>?
            </div>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px 32px',
                  cursor: 'pointer',
                  minWidth: 100,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.product.id)}
                style={{
                  background: '#7E44EE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px 32px',
                  cursor: 'pointer',
                  minWidth: 100,
                  boxShadow: '0 4px 12px rgba(126, 68, 238, 0.2)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;