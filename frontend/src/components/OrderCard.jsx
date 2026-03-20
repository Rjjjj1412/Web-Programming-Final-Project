import React from "react";
import { ChevronRight } from "lucide-react";

const OrderCard = ({ order, onViewDetails }) => {
  const palette = {
    primary: "#0F1E3D",
    accent: "#4A90E2",
    background: "#F5F7FA",
    gray: "#757575",
    white: "#FFFFFF",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#10B981"; // Green
      case "Shipped":
        return "#3B82F6"; // Blue
      case "Processing":
        return "#F59E0B"; // Amber
      case "Confirmed":
        return "#8B5CF6"; // Violet
      case "Waiting for confirmation":
        return "#757575"; // Gray
      case "Cancelled":
        return "#EF4444"; // Red
      default:
        return palette.gray;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "#10B981"; // Green
      case "Pending":
        return "#F59E0B"; // Amber
      case "Failed":
        return "#EF4444"; // Red
      default:
        return palette.gray;
    }
  };

  return (
    <div
      className="rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      style={{ background: palette.white }}
      onClick={onViewDetails}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div>
          <p style={{ color: palette.gray }} className="text-xs mb-1">
            Order ID
          </p>
          <p className="font-bold" style={{ color: palette.primary }}>
            #{order._id?.substring(0, 8)}
          </p>
        </div>

        <div>
          <p style={{ color: palette.gray }} className="text-xs mb-1">
            Order Date
          </p>
          <p className="font-semibold">
            {new Date(order.order_date).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p style={{ color: palette.gray }} className="text-xs mb-1">
            Total
          </p>
          <p className="font-bold text-lg" style={{ color: palette.accent }}>
            ${order.total_amount?.toFixed(2)}
          </p>
        </div>

        <div>
          <p style={{ color: palette.gray }} className="text-xs mb-1">
            Status
          </p>
          <p
            className="font-semibold px-3 py-1 rounded-full text-white text-sm"
            style={{ background: getStatusColor(order.order_status) }}
          >
            {order.order_status}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p style={{ color: palette.gray }} className="text-xs mb-1">
              Payment
            </p>
            <p
              className="font-semibold px-3 py-1 rounded-full text-white text-sm"
              style={{
                background: getPaymentStatusColor(order.payment_status),
              }}
            >
              {order.payment_status}
            </p>
          </div>
          <ChevronRight size={24} color={palette.primary} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
