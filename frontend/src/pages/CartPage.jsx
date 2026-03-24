import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../components/CartContext";
import { AuthContext } from "../components/CustomerAuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.unit_price * item.quantity;
  }, 0);

  const total = subtotal; // Total = subtotal only

  const handleProceedCheckout = () => {
    if (!authState.isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const handleQtyInput = (productId, rawValue) => {
    const parsed = parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) return;
    updateQuantity(productId, parsed);
  };

  return (
    <div className="min-h-full flex flex-col p-6">
      <div className="max-w-5xl mx-auto px-4 py-12 flex-1">
        <h1 className="text-4xl font-bold mb-8" style={{ color: "#1F3B6D" }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-6" style={{ color: "#757575" }}>
              Your cart is empty
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90"
              style={{ background: "#1F3B6D" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-lg shadow-md p-6 bg-white">
                {cartItems.map((item) => {
                  const stock =
                    item.inventory?.stock_quantity ?? item.stock_quantity ?? 0;
                  const atMax = item.quantity >= stock;
                  const outOfStock = stock === 0;

                  return (
                    <div
                      key={item._id}
                      data-testid={`cart-item-${item._id}`}
                      className="flex gap-4 pb-6 mb-6 border-b"
                      style={{ borderColor: "#E0E0E0" }}
                    >
                      <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={
                            item.image_url?.startsWith("http")
                              ? item.image_url
                              : item.image_url
                                ? `${BASE_URL}/images/${item.image_url
                                    .split("/")
                                    .pop()}`
                                : "https://via.placeholder.com/100x150?text=Book"
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold mb-1"
                          style={{ color: "#1F3B6D" }}
                        >
                          {item.product_name}
                        </h3>

                        <p
                          className="text-sm mb-3"
                          style={{ color: "#757575" }}
                        >
                          by {item.author || "Unknown Author"}
                        </p>

                        <p
                          className="font-semibold mb-4"
                          style={{ color: "#4A90E2" }}
                        >
                          ${item.unit_price?.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                          <button
                            data-testid={`decrease-qty-${item._id}`}
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 rounded border hover:bg-gray-100"
                            style={{
                              borderColor: "#1F3B6D",
                              opacity: item.quantity <= 1 ? 0.5 : 1,
                            }}
                          >
                            <Minus size={18} color="#1F3B6D" />
                          </button>

                          <input
                            data-testid={`cart-qty-${item._id}`}
                            type="number"
                            min={1}
                            max={stock || 999999}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQtyInput(item._id, e.target.value)
                            }
                            className="w-20 text-center border rounded px-2 py-1"
                          />

                          <button
                            data-testid={`increase-qty-${item._id}`}
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                Math.min(item.quantity + 1, stock),
                              )
                            }
                            disabled={outOfStock || atMax}
                            className="p-1 rounded border hover:bg-gray-100"
                            style={{
                              borderColor: "#1F3B6D",
                              opacity: outOfStock || atMax ? 0.5 : 1,
                            }}
                          >
                            <Plus size={18} color="#1F3B6D" />
                          </button>
                        </div>

                        <p
                          className="text-sm mb-3"
                          style={{ color: "#757575" }}
                        >
                          Subtotal:{" "}
                          <span className="font-semibold">
                            ${(item.unit_price * item.quantity).toFixed(2)}
                          </span>
                        </p>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <Trash2 size={18} />
                          Remove
                        </button>

                        {outOfStock && (
                          <p className="text-sm mt-2 text-amber-600">
                            This item is currently out of stock.
                          </p>
                        )}
                        {!outOfStock && atMax && (
                          <p className="text-sm mt-2 text-gray-600">
                            Maximum available quantity reached ({stock}).
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* === ORDER SUMMARY === */}
            <div
              className="rounded-lg shadow-md p-6 h-fit sticky top-20"
              style={{ background: "#FFFFFF" }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "#1F3B6D" }}
              >
                Order Summary
              </h2>

              <div
                className="space-y-4 pb-6 border-b"
                style={{ borderColor: "#E0E0E0" }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "#757575" }}>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 mt-6">
                <span
                  className="text-lg font-bold"
                  style={{ color: "#1F3B6D" }}
                >
                  Total:
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#4A90E2" }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "#4A90E2" }}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/browse")}
                className="w-full mt-3 py-3 text-white rounded-lg font-semibold border-2 hover:opacity-90 transition-opacity"
                style={{
                  borderColor: "#1F3B6D",
                  color: "#1F3B6D",
                  background: "#FFFFFF",
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
