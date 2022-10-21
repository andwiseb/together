import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAuth = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    return user ? children : <Navigate to="/" replace state={{ path: location.pathname + location.search }}/>;
};

export default RequireAuth;
