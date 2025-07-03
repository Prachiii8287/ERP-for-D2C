import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../store/companySlice';

const Departments = () => {
  const dispatch = useDispatch();
  const { departments, loading, errors } = useSelector((state) => state.company);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setLocalError('Department name is required');
      return;
    }
    try {
      if (editId) {
        await dispatch(updateDepartment({ deptId: editId, data: form })).unwrap();
      } else {
        await dispatch(createDepartment(form)).unwrap();
      }
      setForm({ name: '', description: '' });
      setLocalError('');
      setShowAdd(false);
      setEditId(null);
    } catch (err) {
      setLocalError(err?.message || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '' });
    setEditId(dept.id);
    setShowAdd(true);
  };

  const handleDelete = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await dispatch(deleteDepartment(deptId));
    }
  };

  const handleCancel = () => {
    setShowAdd(false);
    setEditId(null);
    setForm({ name: '', description: '' });
    setLocalError('');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0 }}>Departments</h1>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', description: '' }); }}
          style={{ background: '#7E44EE', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
        >
          + Add Department
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 32, maxWidth: 700, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Department Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 8 }}
                placeholder="Enter department name"
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 8, minHeight: 60 }}
                placeholder="Enter description (optional)"
              />
            </div>
            {localError && <div style={{ color: '#ef4444', marginBottom: 12 }}>{localError}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={loading?.createDepartment || loading?.updateDepartment}
                style={{ background: '#7E44EE', color: '#fff', padding: '12px 32px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >
                {editId ? (loading?.updateDepartment ? 'Saving...' : 'Save Changes') : (loading?.createDepartment ? 'Adding...' : 'Add Department')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{ background: '#e5e7eb', color: '#374151', padding: '12px 32px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Existing Departments</h2>
          {loading?.departments ? (
            <div>Loading departments...</div>
          ) : departments.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No departments found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '12px 16px' }}>{dept.name}</td>
                    <td style={{ padding: '12px 16px' }}>{dept.description}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        style={{ marginRight: 8, background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#7E44EE', fontWeight: 600 }}
                        onClick={() => handleEdit(dept)}
                      >Edit</button>
                      <button
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                        onClick={() => handleDelete(dept.id)}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Departments; 