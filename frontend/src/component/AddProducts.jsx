import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';

const AddProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    vendor: '',
    stock_status: 'in_stock',
    tags: '',
    tax_rate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    productsAPI.getCategories().then(res => setCategories(res.data)).catch(() => setCategories([]));
    productsAPI.getVendors().then(res => setVendors(res.data)).catch(() => setVendors([]));
    if (id) {
      setLoading(true);
      productsAPI.getProduct(id)
        .then(res => {
          const p = res.data;
          // Parse tags from JSON string to comma-separated string
          let tagsString = '';
          if (p.tags) {
            try {
              const tagsArray = JSON.parse(p.tags);
              tagsString = Array.isArray(tagsArray) ? tagsArray.join(', ') : '';
            } catch (e) {
              // If tags is already a comma-separated string, use it as is
              tagsString = p.tags;
            }
          }
          setForm({
            title: p.title || '',
            description: p.description || '',
            price: p.price || '',
            category: p.category?.name || '',
            vendor: p.vendor?.name || '',
            stock_status: p.stock_status || 'in_stock',
            tags: tagsString,
            tax_rate: p.tax_rate || '',
          });
          setVariants(p.variants || []);
        })
        .catch(() => setError('Failed to load product for editing.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (idx, e) => {
    const { name, value, type, checked } = e.target;
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [name]: type === 'checkbox' ? checked : value } : v));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { type: '', title: '', sku: '', price: '', tax_rate: '', inventory_quantity: '', is_available: true, description: '' }]);
  };

  const removeVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const isFormValid = form.title.trim() && form.category.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.category.trim()) {
      setError('Category is required.');
      setLoading(false);
      return;
    }
    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.title || !v.sku) {
        setError(`Variant #${i + 1} is missing required fields (title and sku are required).`);
        setLoading(false);
        return;
      }
    }
    try {
      // Debug: log variants state
      console.log('Variants state before submit:', variants);
      const payload = {};
      if (form.title && form.title.trim()) payload.title = form.title.trim();
      if (form.description && form.description.trim()) payload.description = form.description.trim();
      if (form.price) payload.price = parseFloat(form.price);
      if (form.tax_rate) payload.tax_rate = parseFloat(form.tax_rate);
      if (form.stock_status) payload.stock_status = form.stock_status;
      // Handle tags - send as comma-separated string, backend will handle conversion
      if (form.tags && form.tags.trim()) {
        payload.tags = form.tags.trim();
      }
      if (form.category && form.category.trim()) payload.category_name = form.category.trim();
      if (form.vendor && form.vendor.trim()) payload.vendor_name = form.vendor.trim();
      // Always include variants_data, even if empty
      payload.variants_data = variants.map(v => ({
        ...v,
        price: v.price ? parseFloat(v.price) : null,
        tax_rate: v.tax_rate ? parseFloat(v.tax_rate) : null,
        inventory_quantity: v.inventory_quantity ? parseInt(v.inventory_quantity) : 0,
      }));
      console.log('Submitting product payload:', payload);
      if (id) {
        await productsAPI.updateProduct(id, payload);
      } else {
        await productsAPI.createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      console.log('Backend error:', err.response?.data);
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (typeof err.response.data === 'object') {
          setError(
            Object.entries(err.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join(' | ')
          );
        } else {
          setError('Failed to add product. Please check your input.');
        }
      } else {
        setError('Failed to add product. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Recursively render error messages
  const renderError = (err) => {
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) return err.map((e, i) => <div key={i}>{renderError(e)}</div>);
    if (typeof err === 'object' && err !== null) {
      return Object.entries(err).map(([key, value], i) => (
        <div key={key} style={{ marginLeft: 12 }}>
          <b>{key}:</b> {renderError(value)}
        </div>
      ));
    }
    return String(err);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '32px',
        minWidth: '400px',
        maxWidth: '500px',
        width: '100%',
      }}>
        <h2 style={{ color: '#7E44EE', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Add Product</h2>
        {id && <div style={{ color: '#7E44EE', marginBottom: 16, textAlign: 'center' }}>(Edit Mode)</div>}
        {error && <div style={{ color: 'red', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{renderError(error)}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Price</label>
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Tax Rate (%)</label>
            <input name="tax_rate" type="number" min="0" step="0.01" value={form.tax_rate} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Category</label>
          <input name="category" value={form.category} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Vendor</label>
          <input name="vendor" value={form.vendor} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Stock Status</label>
          <select name="stock_status" value={form.stock_status} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="pre_order">Pre-Order</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>Variants</label>
          {variants.map((variant, idx) => (
            <div key={idx} style={{
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              background: '#fafaff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Variant Type</label>
                  <input name="type" placeholder="Type (e.g. Size, Color)" value={variant.type} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Title</label>
                  <input name="title" placeholder="Title (e.g. Small, Red/XL)" value={variant.title} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>SKU</label>
                  <input name="sku" placeholder="SKU" value={variant.sku} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Price</label>
                  <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={variant.price} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Tax Rate</label>
                  <input name="tax_rate" type="number" min="0" step="0.01" placeholder="Tax Rate" value={variant.tax_rate} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Inventory</label>
                  <input name="inventory_quantity" type="number" min="0" placeholder="Inventory" value={variant.inventory_quantity} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, marginTop: 24 }}>
                  <input name="is_available" type="checkbox" checked={!!variant.is_available} onChange={e => handleVariantChange(idx, e)} />
                  <span style={{ fontSize: 14 }}>Available</span>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Description</label>
                <textarea name="description" placeholder="Description" value={variant.description} onChange={e => handleVariantChange(idx, e)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 40 }} />
              </div>
              <button type="button" onClick={() => removeVariant(idx)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', marginTop: 4 }}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addVariant} style={{ background: '#7E44EE', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', marginTop: 8 }}>Add Variant</button>
        </div>
        <button type="submit" disabled={loading || !isFormValid} style={{
          width: '100%',
          backgroundColor: '#7E44EE',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProducts; 