import React from "react";

const OrderItem = ({ item }) => {
  const palette = {
    primary: "#1F3B6D",
    gray: "#757575",
  };

  const imageUrl = item.product_id?.image_url?.startsWith("http")
    ? item.product_id?.image_url
    : item.product_id?.image_url
    ? `http://localhost:5000/public/images/${item.product_id?.image_url
        .split("/")
        .pop()}`
    : "https://via.placeholder.com/80x120?text=Book";

  return (
    <div
      className="flex gap-4 pb-4 border-b"
      style={{ borderColor: "#E0E0E0" }}
    >
      <img
        src={imageUrl}
        alt={item.product_id?.product_name}
        className="w-20 h-28 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-bold mb-1" style={{ color: palette.primary }}>
          {item.product_id?.product_name}
        </h3>
        <p style={{ color: palette.gray }} className="text-sm mb-2">
          by {item.product_id?.author || "Unknown"}
        </p>
        <div className="flex justify-between">
          <span style={{ color: palette.gray }}>
            Qty: <span className="font-semibold">{item.quantity}</span>
          </span>
          <span style={{ color: palette.gray }}>
            ${item.unit_price?.toFixed(2)} each
          </span>
          <span className="font-bold">
            ${(item.quantity * item.unit_price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
