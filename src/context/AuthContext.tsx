import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { RegisterUserData, User } from '../types/User';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (nationalId: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterUserData) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  const login = async (nationalId: string, password: string) => {
    const loggedInUser = await authService.login(nationalId, password);
    setUser(loggedInUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData: RegisterUserData) => {
    await authService.register(userData);
    const newUser = await authService.login(userData.nationalId, userData.password);
    setUser(newUser);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((currentUser) => {
      const nextUser = currentUser ? { ...currentUser, ...userData } : null;

      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser));
      }

      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isAdmin: user?.role === 'admin', login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};