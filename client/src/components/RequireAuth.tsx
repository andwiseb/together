import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const RequireAuth = ({ children }) => {
    const { user } = useUser();
    const location = useLocation();

    return user ? children : <Navigate to="/" replace state={{ path: location.pathname + location.search }}/>;
};

export default RequireAuth;
