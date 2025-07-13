import React, { createContext, useState, useContext, useEffect } from "react";
import api from '../utils/axiosConfig'; // Import the configured axios instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Get all authentication data
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        const storedUserInfo = localStorage.getItem("userInfo");

        if (token && (userType || storedUserInfo)) {
          let userData = {};

          // Parse existing userInfo if available
          if (storedUserInfo) {
            userData = JSON.parse(storedUserInfo);
          }

          // Ensure role property exists - use userType as fallback
          if (!userData.role && userType) {
            userData.role = userType;
          }

          // Store the token for easy access
          userData.token = token;

          // Update localStorage with consistent structure
          localStorage.setItem("userInfo", JSON.stringify(userData));

          console.log("Auth initialized with role:", userData.role);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        // Clear potentially corrupted data
        localStorage.removeItem("userInfo");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Login function - use this when authenticating a user
  const login = (userData) => {
    // Ensure userData has all required fields
    if (!userData.role && userData.userType) {
      userData.role = userData.userType;
    }

    // Set token
    localStorage.setItem("token", userData.token);
    // Set userType for backwards compatibility
    localStorage.setItem("userType", userData.role || userData.userType);
    // Store full user info
    localStorage.setItem("userInfo", JSON.stringify(userData));

    setCurrentUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userInfo");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
