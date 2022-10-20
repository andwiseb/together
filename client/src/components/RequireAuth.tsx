import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const RequireAuth = ({ children }) => {
    const { user } = useUser();
    return user ? children : <Navigate to="/" replace />;
};

export default RequireAuth;
