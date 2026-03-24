import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { useCart } from "../components/CartContext.jsx";
import { AuthContext } from "../components/CustomerAuthContext.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("[CheckoutPage] cartItems:", cartItems);

  const palette = {
    primary: "#1F3B6D",
    accent: "#4A90E2",
    background: "#F5F3F0",
    gray: "#757575",
    white: "#FFFFFF",
  };

  // shipping_address is a single string per your Order model
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // compute total from cartItems (matches Order.total_amount)
  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.unit_price ?? 0) * Number(item.quantity ?? 0),
    0,
  );

  const validateForm = () => {
    if (!shippingAddress || shippingAddress.trim().length === 0) {
      setError(
        "Please provide a shipping address (as a single address string).",
      );
      return false;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const cart = cartItems.map((item) => ({
        product_id: item._id,
        quantity: Number(item.quantity || 0),
      }));

      const payload = {
        cart,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      };

      const response = await axios.post(`${BASE_URL}/api/orders`, payload, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setConfirmationModal({
        isOpen: true,
        title: "Order Placed",
        message: `Order created (id: ${response.data.order_id ?? "—"}).`,
        onConfirm: () => {
          clearCart();
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          const id = response.data.order_id;
          if (id) navigate(`/order-status/${id}`);
          else navigate("/order-history");
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: palette.background }}>
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ color: palette.primary }}
          >
            Checkout
          </h1>
          <p style={{ color: palette.gray }} className="text-lg mb-6">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="px-6 py-3 text-white rounded-lg font-semibold"
            style={{ background: palette.primary }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader className="animate-spin text-white" size={48} />
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        confirmText="Continue"
        cancelText="Cancel"
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1
          className="text-4xl font-bold mb-8"
          style={{ color: palette.primary }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form simplified to match Order model */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg shadow-md p-6 mb-6"
              style={{ background: palette.white }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: palette.primary }}
              >
                Shipping Address
              </h2>

              {error && (
                <div
                  className="flex gap-3 p-4 rounded-lg mb-6 border"
                  style={{
                    background: "#FFF0F0",
                    color: "#D8000C",
                    borderColor: "#D8000C",
                  }}
                >
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: palette.primary }}
                  >
                    Shipping Address (single-line or multi-line string)
                  </label>
                  <textarea
                    data-testid="shipping-address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Main St, Apt 4B, City, State, ZIP, Country"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    rows={4}
                    style={{
                      borderColor: "#E0E0E0",
                      "--tw-ring-color": palette.primary,
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div
              className="rounded-lg shadow-md p-6"
              style={{ background: palette.white }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: palette.primary }}
              >
                Payment
              </h2>

              <div className="space-y-3">
                <label
                  className="flex items-center justify-between gap-3 p-3 border-2 rounded-lg cursor-pointer"
                  style={{
                    borderColor:
                      paymentMethod === "credit_card"
                        ? palette.accent
                        : "#E0E0E0",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      data-testid="payment-card"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={loading}
                    />
                    <span className="font-semibold">Credit Card</span>
                  </div>
                  {paymentMethod === "credit_card" && (
                    <CheckCircle color={palette.accent} />
                  )}
                </label>

                <label
                  className="flex items-center justify-between gap-3 p-3 border-2 rounded-lg cursor-pointer"
                  style={{
                    borderColor:
                      paymentMethod === "cod" ? palette.accent : "#E0E0E0",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      data-testid="payment-cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={loading}
                    />
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <CheckCircle color={palette.accent} />
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              items={cartItems}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
