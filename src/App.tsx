import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppPreferencesProvider } from './context/AppPreferencesContext';
import Routes from './routes';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const App: React.FC = () => {
  return (
    <AppPreferencesProvider>
      <AuthProvider>
        <Router>
          <div className="app-shell">
            <Navbar />
            <Routes />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </AppPreferencesProvider>
  );
};

export default App;