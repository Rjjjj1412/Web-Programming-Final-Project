import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Create Admin context
export const AdminAuthContext = createContext();

// Provider component
export const AdminAuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setAuthState({
      isLoggedIn: false,
      user: null,
      token: null,
    });

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    delete axios.defaults.headers.common["Authorization"];

    document.cookie
      .split(";")
      .forEach(
        (c) =>
          (document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            ))
      );
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (token && user) {
      const decodedToken = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        logout();
      } else {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({
          isLoggedIn: true,
          user: JSON.parse(user),
          token,
        });
      }
    }
    setLoading(false);

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.status === 403 ||
            (error.response.data &&
              error.response.data.message &&
              error.response.data.message.includes("jwt expired")))
        ) {
          logout();
          navigate("/admin/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, navigate]);

  const login = (userData, token) => {
    setAuthState({
      isLoggedIn: true,
      user: userData,
      token,
    });

    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(userData));

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        authState,
        setAuthState,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
