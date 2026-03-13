import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Vaccination Calendar</h2>
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/children">Manage Children</Link>
                </li>
                <li>
                    <Link to="/appointments">Appointments</Link>
                </li>
                <li>
                    <Link to="/vaccine-schedule">Vaccine Schedule</Link>
                </li>
                <li>
                    <Link to="/profile">Profile</Link>
                </li>
                <li>
                    <Link to="/logout">Logout</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;