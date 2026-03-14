import React from 'react';
import { Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ChildrenPage from './pages/ChildrenPage';
import AppointmentsPage from './pages/AppointmentsPage';
import VaccineSchedulePage from './pages/VaccineSchedulePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HealthCenterDashboardPage from './pages/HealthCenterDashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';

const Routes = () => {
    return (
        <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/admin" component={AdminDashboardPage} requiredRole="admin" />
            <ProtectedRoute path="/health-center" component={HealthCenterDashboardPage} requiredRoles={['health-center', 'admin']} />
            <ProtectedRoute path="/children" component={ChildrenPage} requiredRole="citizen" />
            <ProtectedRoute path="/appointments" component={AppointmentsPage} requiredRole="citizen" />
            <Route path="/vaccines" component={VaccineSchedulePage} />
            <Route path="/vaccine-schedule" component={VaccineSchedulePage} />
        </Switch>
    );
};

export default Routes;