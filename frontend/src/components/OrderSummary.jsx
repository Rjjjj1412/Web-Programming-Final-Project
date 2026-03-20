import React from "react";
import { Loader } from "lucide-react";

const OrderSummary = ({ items, onPlaceOrder, loading }) => {
  const palette = {
    primary: "#1F3B6D",
    accent: "#4A90E2",
    background: "#F5F3F0",
    gray: "#757575",
    white: "#FFFFFF",
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const total = subtotal; // total = subtotal

  return (
    <div
      className="rounded-lg shadow-md p-6 h-fit sticky top-20"
      style={{ background: palette.white }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: palette.primary }}
      >
        Order Summary
      </h2>

      <div
        className="space-y-3 pb-6 mb-6 border-b"
        style={{ borderColor: "#E0E0E0" }}
      >
        {items.map((item) => (
          <div key={item._id} className="flex justify-between">
            <span style={{ color: palette.gray }}>
              {item.product_name} x {item.quantity}
            </span>
            <span className="font-semibold">
              ${(item.unit_price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Subtotal only*/}
      <div className="pb-6 border-b" style={{ borderColor: "#E0E0E0" }}>
        <div className="flex justify-between">
          <span style={{ color: palette.gray }}>Subtotal:</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between mb-6 mt-6">
        <span className="text-lg font-bold" style={{ color: palette.primary }}>
          Total:
        </span>
        <span className="text-2xl font-bold" style={{ color: palette.accent }}>
          ${total.toFixed(2)}
        </span>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={loading}
        className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: palette.accent }}
      >
        {loading && <Loader size={20} className="animate-spin" />}
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderSummary;
