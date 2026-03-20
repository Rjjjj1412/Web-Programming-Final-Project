import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/CustomerAuthContext.jsx";
import { useNavigate } from "react-router-dom";
import AuthRedirectModal from "../components/AuthRedirectModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const EditProfilePage = () => {
  const { authState, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAuthenticated =
    Boolean(authState?.isLoggedIn) ||
    Boolean(authState?.token) ||
    Boolean(localStorage.getItem("customerToken")) ||
    Boolean(localStorage.getItem("authToken"));

  if (!isAuthenticated) {
    return (
      <AuthRedirectModal
        isOpen={true}
        onClose={() => navigate("/", { replace: true })}
      />
    );
  }

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("customerToken");
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData((prev) => ({
          ...prev,
          username: res.data.username || "",
          email: res.data.email || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch profile data.");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const {
      username,
      email,
      first_name,
      last_name,
      phone,
      address,
      new_password,
      confirm_password,
      old_password,
    } = formData;

    if (!username.trim()) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Enter a valid email.");
    if (!first_name.trim()) return setError("First name is required.");
    if (!last_name.trim()) return setError("Last name is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) return setError("Enter a valid phone number.");
    if (!address.trim()) return setError("Address is required.");

    if (old_password || new_password || confirm_password) {
      if (!old_password || !new_password || !confirm_password) {
        return setError("All password fields are required.");
      }
      if (new_password.length < 6)
        return setError("New password must be at least 6 characters.");
      if (new_password !== confirm_password)
        return setError("New password and confirmation do not match.");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("customerToken");

      const res = await axios.patch(
        `${BASE_URL}/api/customers/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      login(res.data, authState.token);

      setSuccess("Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        old_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-[#0F1E3D] mb-6 text-center">
          Edit Profile
        </h2>

        {error && (
          <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
        )}
        {success && (
          <p className="text-green-600 mb-4 text-center font-medium">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
            />
          </div>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />

          <hr className="my-4 border-[#E0E0E0]" />

          <input
            type="password"
            name="old_password"
            placeholder="Old Password"
            value={formData.old_password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />
          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={formData.new_password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm New Password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33A6B8] transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F1E3D] hover:bg-[#16325A] text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
