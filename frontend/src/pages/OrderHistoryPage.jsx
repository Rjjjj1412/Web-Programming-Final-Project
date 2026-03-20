import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../components/CustomerAuthContext";
import OrderCard from "../components/OrderCard";
import AuthRedirectModal from "../components/AuthRedirectModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const OrderHistoryPage = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const palette = {
    primary: "#0F1E3D",
    accent: "#4A90E2",
    background: "#F5F7FA",
    gray: "#757575",
    white: "#FFFFFF",
  };

  useEffect(() => {
    const isAuthenticated =
      Boolean(authState?.isLoggedIn) ||
      Boolean(authState?.token) ||
      Boolean(localStorage.getItem("customerToken")) ||
      Boolean(localStorage.getItem("authToken"));

    setShowAuthModal(!isAuthenticated);
  }, [authState?.isLoggedIn, authState?.token]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoading(true);
      try {
        const token = authState?.token || localStorage.getItem("customerToken");
        if (!token) {
          setError("You must be logged in to view order history.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${BASE_URL}/api/orders/history/all`, {
          headers,
        });
        setOrders(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch order history. Please try again.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [authState?.token]);

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: palette.background }}
      >
        <Loader
          className="animate-spin w-12 h-12"
          style={{ color: palette.primary }}
        />
      </div>
    );
  }

  if (showAuthModal) {
    return (
      <AuthRedirectModal
        isOpen={true}
        onClose={() => {
          // change destination as needed
          navigate("/", { replace: true });
        }}
      />
    );
  }

  const filterButtons = [
    { value: "all", label: "All Orders" },
    { value: "Waiting for confirmation", label: "Confirmation Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Payment Pending" },
  ];

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (
      [
        "Waiting for confirmation",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ].includes(filter)
    ) {
      return order.order_status === filter;
    }
    if (["Paid", "Pending", "Failed"].includes(filter)) {
      return order.payment_status === filter;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1
          className="text-4xl font-bold mb-8"
          style={{ color: palette.primary }}
        >
          Order History
        </h1>

        {error && (
          <div
            className="flex gap-3 p-4 rounded-lg mb-6"
            style={{ background: "#FFE5E5", color: palette.accent }}
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className="px-4 py-2 rounded-lg font-semibold transition-all"
              style={{
                background:
                  filter === btn.value ? palette.accent : palette.white,
                color: filter === btn.value ? palette.white : palette.primary,
                border: `2px solid ${
                  filter === btn.vealue ? palette.accent : "#E0E0E0"
                }`,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            className="rounded-lg shadow-md p-12 text-center"
            style={{ background: palette.white }}
          >
            <p style={{ color: palette.gray }} className="text-lg">
              No orders found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={() => navigate(`/order-status/${order._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
