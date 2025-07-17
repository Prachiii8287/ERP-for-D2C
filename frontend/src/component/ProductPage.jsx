import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const user = useSelector(state => state.auth.user);
  const [syncLoading, setSyncLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pushingProducts, setPushingProducts] = useState(new Set());

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
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncShopify = async () => {
    try {
      setSyncLoading(true);
      const response = await productsAPI.syncShopifyProducts();
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh products list after sync
        await fetchProducts();
      } else {
        toast.error(response.data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error(error.response?.data?.error || 'Failed to sync products');
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePushToShopify = async (productId) => {
    try {
      setPushingProducts(prev => new Set([...prev, productId]));
      const response = await productsAPI.pushProductToShopify(productId);
      
      if (response.success) {
        toast.success('Product pushed to Shopify successfully');
        // Don't refresh the entire product list, just update the status if needed
        return true;
      } else {
        toast.error(response.error || 'Push failed');
        return false;
      }
    } catch (error) {
      console.error('Error pushing product:', error);
      toast.error(error.response?.data?.error || 'Failed to push product to Shopify');
      return false;
    } finally {
      setPushingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handlePushAllToShopify = async () => {
    if (filteredProducts.length === 0) {
      toast.warning('No products available to push');
      return;
    }

    setPushLoading(true);
    setSuccessMessage('');
    let successCount = 0;
    let errorCount = 0;

    try {
      // Push products in batches of 5 to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < filteredProducts.length; i += batchSize) {
        const batch = filteredProducts.slice(i, i + batchSize);
        await Promise.all(batch.map(async (product) => {
          try {
            const success = await handlePushToShopify(product.id);
            if (success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`Error pushing product ${product.id}:`, error);
            errorCount++;
          }
        }));
      }

      if (successCount > 0) {
        const message = `Successfully pushed ${successCount} products to Shopify`;
        toast.success(message);
        setSuccessMessage(message);
        // Only fetch products once at the end
        await fetchProducts();
      }
      if (errorCount > 0) {
        toast.error(`Failed to push ${errorCount} products`);
      }
    } catch (error) {
      console.error('Error in batch push:', error);
      toast.error('Error during batch push to Shopify');
    } finally {
      setPushLoading(false);
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

        {/* Add Product and Shopify Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/products/add')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#7E44EE',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(126, 68, 238, 0.2)',
            }}
          >
            <Plus size={18} />
            Add Product
          </button>

          <button
            onClick={handleSyncShopify}
            disabled={syncLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#7E44EE',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: syncLoading ? 'not-allowed' : 'pointer',
              opacity: syncLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(126, 68, 238, 0.2)',
            }}
          >
            <Download size={18} />
            {syncLoading ? 'Syncing...' : 'Sync from Shopify'}
          </button>

          <button
            onClick={handlePushAllToShopify}
            disabled={pushLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#7E44EE',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: pushLoading ? 'not-allowed' : 'pointer',
              opacity: pushLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(126, 68, 238, 0.2)',
            }}
          >
            <Upload size={18} />
            {pushLoading ? 'Pushing...' : 'Push All to Shopify'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#155724"/>
          </svg>
          {successMessage}
        </div>
      )}

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
                }}>Title</th>
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
                        <>
                          <button onClick={() => setDeleteModal({ open: true, product })} style={{ marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Product">
                            <Trash2 color="#dc3545" />
                          </button>
                          <button 
                            onClick={() => handlePushToShopify(product.id)}
                            disabled={pushingProducts.has(product.id)}
                            style={{
                              background: '#7E44EE',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 8px',
                              cursor: pushingProducts.has(product.id) ? 'not-allowed' : 'pointer',
                              opacity: pushingProducts.has(product.id) ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              boxShadow: '0 2px 8px rgba(126, 68, 238, 0.2)',
                            }}
                            title="Push to Shopify"
                          >
                            {pushingProducts.has(product.id) ? (
                              <span style={{ fontSize: '12px', color: 'white' }}>Pushing...</span>
                            ) : (
                              <Upload color="white" size={16} />
                            )}
                          </button>
                        </>
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