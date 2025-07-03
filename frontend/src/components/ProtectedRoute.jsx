import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../store/authSlice';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, isAuthenticated, loading]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
                <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    background: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 