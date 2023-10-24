import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AuthRoute({ children, ...rest }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Route {...rest}>{children}</Route>;
    }

    return <Navigate to="/signin" />;
}

export default AuthRoute;
