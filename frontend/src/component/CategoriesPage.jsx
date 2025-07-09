import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useSelector } from 'react-redux';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await productsAPI.getCategories();
        setCategories(res.data);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddOrEditCategory = async () => {
    if (formData.name.trim()) {
      try {
        if (editId) {
          await productsAPI.updateCategory(editId, { name: formData.name, description: formData.description });
        } else {
          await productsAPI.createCategory({ name: formData.name, description: formData.description });
        }
        // Refresh categories from backend
        const res = await productsAPI.getCategories();
        setCategories(res.data);
        setFormData({ name: '', description: '' });
        setEditId(null);
        setShowModal(false);
      } catch (err) {
        alert('Failed to save category');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsAPI.deleteCategory(id);
      // Refresh categories from backend
      const res = await productsAPI.getCategories();
      setCategories(res.data);
      setDeleteModal({ open: false, category: null });
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleEdit = (id) => {
    const cat = categories.find(c => c.id === id);
    if (cat) {
      setFormData({ name: cat.name || '', description: cat.description || '' });
      setEditId(id);
      setShowModal(true);
    }
  };

  const modalStyles = {
    overlay: {
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
    },
    modal: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '400px',
      maxWidth: '90%',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#555'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    primaryButton: {
      backgroundColor: '#8b5cf6',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button 
          onClick={() => { setShowModal(true); setEditId(null); setFormData({ name: '', description: '' }); }}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          + Add Category
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Category
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Description
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'red', padding: 24 }}>{error}</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>No categories found.</td></tr>
            ) : categories.map((category) => (
              <tr key={category.id} style={{
                borderBottom: '1px solid #f3f4f6'
              }}>
                <td style={{
                  padding: '12px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {category.name}
                </td>
                <td style={{
                  padding: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {category.description}
                </td>
                <td style={{
                  padding: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button onClick={() => handleEdit(category.id)} style={{ backgroundColor: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 4, padding: '6px 16px', marginRight: 8, cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                    {(user && (user.role === 'ADMIN' || user.role === 'PARENT')) && (
                      <button onClick={() => setDeleteModal({ open: true, category })} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.modalHeader}>{editId ? 'Edit Category' : 'Add Category'}</div>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Category Name</label>
              <input
                style={modalStyles.input}
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Description</label>
              <input
                style={modalStyles.input}
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div style={modalStyles.buttonGroup}>
              <button
                style={{ ...modalStyles.button, ...modalStyles.secondaryButton }}
                onClick={() => { setShowModal(false); setFormData({ name: '', description: '' }); setEditId(null); }}
              >
                Cancel
              </button>
              <button
                style={{ ...modalStyles.button, ...modalStyles.primaryButton }}
                onClick={handleAddOrEditCategory}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
              Are you sure you want to delete the category<br />
              <b>"{deleteModal.category?.name}"</b>?
            </div>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={() => setDeleteModal({ open: false, category: null })}
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
                onClick={() => handleDelete(deleteModal.category.id)}
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

export default CategoriesPage;