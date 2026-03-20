import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const LS_KEY = "bookhub_cart_v1";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      console.log("[CartContext] init cart from localStorage:", parsed);
      return parsed;
    } catch (e) {
      console.error("[CartContext] failed parse localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cartItems));
      console.log("[CartContext] persisted cartItems:", cartItems);
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [cartItems]);

  // ensure item has inventory info (fetch if needed)
  const ensureInventory = async (product) => {
    if (product.inventory || product.stock_quantity !== undefined)
      return product;
    try {
      const res = await axios.get(`${BASE_URL}/api/products/${product._id}`);
      return res.data;
    } catch (err) {
      console.warn("Could not fetch product inventory:", err);
      return product;
    }
  };

  const addToCart = async (product, qty = 1) => {
    const prod = await ensureInventory(product);
    const maxStock =
      prod.inventory?.stock_quantity ?? prod.stock_quantity ?? Infinity;
    if (maxStock === 0) return; // no-op if out of stock

    setCartItems((prev) => {
      const existing = prev.find((p) => p._id === prod._id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, maxStock);
        return prev.map((p) =>
          p._id === prod._id
            ? {
                ...p,
                quantity: newQty,
                inventory: prod.inventory ?? p.inventory,
              }
            : p,
        );
      } else {
        const initialQty = Math.min(qty, maxStock);
        return [
          ...prev,
          { ...prod, quantity: initialQty, inventory: prod.inventory },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((p) => p._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;
        const maxStock =
          item.inventory?.stock_quantity ?? item.stock_quantity ?? Infinity;
        // coerce to integer and clamp
        const qty = Math.max(
          1,
          Math.min(Math.floor(Number(newQuantity) || 1), maxStock),
        );
        return { ...item, quantity: qty };
      }),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
