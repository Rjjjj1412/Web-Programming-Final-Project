import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/CustomerAuthContext.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    if (!emailOrUsername.trim()) {
      setError("Please enter your email or username.");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailOrUsername.includes("@") && !emailRegex.test(emailOrUsername)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInput()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/customers/login`,
        { username: emailOrUsername, email: emailOrUsername, password },
        { withCredentials: true },
      );

      const customer = response.data.customer;
      const token = response.data.token;

      login(customer, token);

      navigate("/");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 404) {
        setError("No account found with that email/username.");
      } else if (err.response?.status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError("Server is unreachable. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-[#0F1E3D] mb-6 text-center">
          BookHub Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F1E3D] text-white py-2 rounded-lg hover:bg-[#0F3B60] transition-colors font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[#4A4A4A] text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#33A6B8] hover:text-[#0F3B60] font-medium transition-colors"
          >
            Register
          </Link>
        </p>
        <p className="mt-2 text-sm text-[#4A4A4A] text-center">
          Login as Admin/Manager?{" "}
          <Link
            to="/admin/login"
            className="text-[#33A6B8] hover:text-[#0F3B60] font-medium transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
