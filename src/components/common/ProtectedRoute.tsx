import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/User';

interface ProtectedRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, requiredRole, ...rest }) => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Route
            {...rest}
            render={props =>
                isAuthenticated ? (
                    requiredRole && user?.role !== requiredRole ? (
                        <Redirect to="/dashboard" />
                    ) : (
                    <Component {...props} />
                    )
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    );
};

export default ProtectedRoute;