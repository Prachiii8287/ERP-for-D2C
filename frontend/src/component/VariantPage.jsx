import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

const VariantPage = () => {
  const { id } = useParams(); // product id
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const productRes = await productsAPI.getProduct(id);
        setProduct(productRes.data);
        const allVariants = productRes.data.variants || [];
        setVariants(allVariants);
      } catch (err) {
        setError('Failed to load variants.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
    }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20, background: '#7E44EE', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#7E44EE', color: 'white', padding: '16px', fontSize: '18px', fontWeight: 'bold' }}>
          Variants for: {product?.title || 'Product'}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={thStyle}>Variant ID</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Tax Rate</th>
                <th style={thStyle}>Inventory</th>
                <th style={thStyle}>Available</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24 }}>No variants found.</td></tr>
              ) : (
                variants.map((variant, idx) => (
                  <tr key={variant.id || idx} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{variant.title}</td>
                    <td style={tdStyle}>{variant.sku}</td>
                    <td style={tdStyle}>{variant.price}</td>
                    <td style={tdStyle}>{variant.tax_rate}</td>
                    <td style={tdStyle}>{variant.inventory_quantity}</td>
                    <td style={tdStyle}>{variant.is_available ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>{variant.created_at ? new Date(variant.created_at).toLocaleString() : ''}</td>
                    <td style={tdStyle}>{variant.updated_at ? new Date(variant.updated_at).toLocaleString() : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#7E44EE',
  fontSize: '14px',
};
const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#333',
};

export default VariantPage; 