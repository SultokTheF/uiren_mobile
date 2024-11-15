import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo } from '../services/getUserInfo'; // Assuming this file exists
import { login as loginService, logout as logoutService } from '../services/AuthService'; // Import login/logout services
import { User } from '../types/types'; // Assuming types exist

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await getUserInfo();
      if (userInfo) setUser(userInfo);
    };

    fetchUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginService(email, password); // Ensure this throws an error if login fails
      const userInfo = await getUserInfo();
      if (!userInfo) {
        throw new Error('Failed to fetch user info after login.');
      }
      setUser(userInfo);
    } catch (error) {
      console.error('Login failed:', error.message || error);
      throw new Error('Неверные данные для входа'); // Explicitly throw error to be caught in LoginScreen
    }
  };  

  const handleLogout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
