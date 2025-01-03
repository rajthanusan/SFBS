import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://192.168.8.101:5000/api/v1/auth/login', {
        email,
        password,
      });
      const userData = { ...response.data.user, role: response.data.user.role };
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response.data;
    }
  };

  const register = async (firstName, lastName, email, password, role) => {
    try {
      const response = await axios.post('http://192.168.8.101:5000/api/v1/auth/register', {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role,
      });
      const userData = { ...response.data.user, role: response.data.user.role };
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

