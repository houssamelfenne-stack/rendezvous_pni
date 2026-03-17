import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/User';

interface ProtectedRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    requiredRole?: UserRole;
    requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, requiredRole, requiredRoles, ...rest }) => {
    const { authReady, isAuthenticated, user } = useAuth();
    const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : []);

    return (
        <Route
            {...rest}
            render={props =>
                !authReady ? null : isAuthenticated ? (
                    allowedRoles.length > 0 && !allowedRoles.includes((user?.role || 'citizen') as UserRole) ? (
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