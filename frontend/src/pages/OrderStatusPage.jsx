import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  Clock,
  Truck,
  Home,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { AuthContext } from "../components/CustomerAuthContext";
import OrderItem from "../components/OrderItem";
import AuthRedirectModal from "../components/AuthRedirectModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Authentication check like EditProfilePage
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

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const palette = {
    primary: "#0F1E3D",
    accent: "#4A90E2",
    background: "#F5F7FA",
    gray: "#757575",
    white: "#FFFFFF",
  };

  const statusSteps = [
    {
      key: "Waiting for confirmation",
      label: "Confirmation Pending",
      icon: HelpCircle,
    },
    { key: "Confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "Processing", label: "Processing", icon: Clock },
    { key: "Shipped", label: "Shipped", icon: Truck },
    { key: "Delivered", label: "Delivered", icon: Home },
  ];

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "#10B981";
      case "Pending":
        return "#F59E0B";
      case "Failed":
        return "#EF4444";
      default:
        return palette.gray;
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const token = authState?.token || localStorage.getItem("customerToken");
        if (!token) {
          setError("");
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
          headers,
        });
        setOrder(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch order details. Please try again.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId, authState?.token]);

  if (loading)
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: palette.background }}
      >
        <Loader
          className="animate-spin w-16 h-16"
          style={{ color: palette.primary }}
        />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen" style={{ background: palette.background }}>
        <div className="max-w-5xl mx-auto px-8 py-16">
          <div
            className="flex gap-3 p-8 rounded-lg"
            style={{ background: "#FFE5E5", color: palette.accent }}
          >
            <AlertCircle size={24} />
            <p className="text-lg">{error}</p>
          </div>
          <button
            onClick={() => navigate("/order-history")}
            className="mt-8 px-8 py-4 text-white rounded-lg font-bold"
            style={{ background: palette.primary }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen" style={{ background: palette.background }}>
        <div className="max-w-5xl mx-auto px-8 py-16 text-center">
          <p style={{ color: palette.gray }} className="text-xl mb-8">
            Order not found
          </p>
          <button
            onClick={() => navigate("/order-history")}
            className="px-8 py-4 text-white rounded-lg font-bold"
            style={{ background: palette.primary }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.key === order.order_status,
  );
  const subtotal = order.orderDetails.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  const totalPages = Math.ceil(order.orderDetails.length / itemsPerPage);
  const paginatedItems = order.orderDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-full flex flex-col p-8">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1
          className="text-5xl font-extrabold mb-12"
          style={{ color: palette.primary }}
        >
          Order Tracking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Order Header + Shipping */}
            <div
              className="rounded-lg shadow-lg p-10"
              style={{ background: palette.white }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p style={{ color: palette.gray }} className="text-lg mb-2">
                    Order ID
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    #{order._id.slice(0, 12)}...
                  </p>
                </div>
                <div>
                  <p style={{ color: palette.gray }} className="text-lg mb-2">
                    Order Date
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ color: palette.gray }} className="text-lg mb-2">
                    Payment Status
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: getPaymentStatusColor(order.payment_status),
                    }}
                  >
                    {order.payment_status}
                  </p>
                </div>
                <div>
                  <p style={{ color: palette.gray }} className="text-lg mb-2">
                    Total Amount
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: palette.accent }}
                  >
                    ${order.total_amount?.toFixed(2)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p
                    className="text-lg mb-2 font-semibold"
                    style={{ color: palette.gray }}
                  >
                    Shipping Address
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: palette.primary }}
                  >
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div
              className="rounded-lg shadow-lg p-10"
              style={{ background: palette.white }}
            >
              <h2
                className="text-3xl font-bold mb-8"
                style={{ color: palette.primary }}
              >
                Order Items
              </h2>
              <div className="space-y-6">
                {paginatedItems.map((item) => (
                  <OrderItem key={item._id} item={item} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Prev
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 sticky top-32">
            {order.order_status === "Cancelled" ? (
              <div
                className="rounded-lg shadow-lg p-10 flex flex-col items-center"
                style={{ background: "#FFF0F0" }}
              >
                <XCircle size={64} color="#D8000C" />
                <h2
                  className="text-3xl font-bold mt-6"
                  style={{ color: "#D8000C" }}
                >
                  Order Cancelled
                </h2>
                <p className="mt-4 text-lg" style={{ color: palette.gray }}>
                  This order has been cancelled.
                </p>
              </div>
            ) : (
              <div
                className="rounded-lg shadow-lg p-10"
                style={{ background: palette.white }}
              >
                <h2
                  className="text-3xl font-bold mb-10"
                  style={{ color: palette.primary }}
                >
                  Order Status
                </h2>
                <div className="flex justify-between items-start mb-10 relative">
                  <div
                    className="absolute top-1/2 left-0 w-full h-2"
                    style={{
                      transform: "translateY(-50%)",
                      backgroundColor: "#E0E0E0",
                    }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${
                          (currentStatusIndex / (statusSteps.length - 1)) * 100
                        }%`,
                        backgroundColor: palette.accent,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const IconComponent = step.icon;
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center z-10"
                        style={{ flex: "1 1 0" }}
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                          style={{
                            background: isCompleted
                              ? palette.accent
                              : "#E0E0E0",
                            border: `6px solid ${palette.white}`,
                          }}
                        >
                          <IconComponent
                            size={32}
                            color={isCompleted ? palette.white : palette.gray}
                          />
                        </div>
                        <p
                          className="text-sm font-semibold text-center"
                          style={{
                            color: isCompleted ? palette.primary : palette.gray,
                          }}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p
                  className="text-center text-xl font-bold"
                  style={{ color: palette.primary }}
                >
                  Current Status:{" "}
                  <span style={{ color: palette.accent }}>
                    {order.order_status}
                  </span>
                </p>
              </div>
            )}

            {/* Subtotal / Total */}
            <div
              className="rounded-lg shadow-lg p-10"
              style={{ background: palette.white }}
            >
              <div className="flex justify-between text-xl font-bold mb-4">
                <span style={{ color: palette.primary }}>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold">
                <span style={{ color: palette.primary }}>Total:</span>
                <span style={{ color: palette.accent }}>
                  ${order.total_amount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/order-history")}
          className="mt-12 px-10 py-5 text-white rounded-lg font-bold hover:opacity-90"
          style={{ background: palette.primary }}
        >
          Back to Order History
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;
