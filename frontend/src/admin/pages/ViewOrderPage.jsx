import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/ordersApi";
import {
  FiArrowLeft,
  FiUser,
  FiHome,
  FiCreditCard,
  FiCheckCircle,
  FiPackage,
  FiClipboard,
} from "react-icons/fi";

const ViewOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-8 bg-[#F5F7FA] min-h-screen text-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 bg-[#F5F7FA] min-h-screen text-center">
        Order not found.
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-violet-100 text-indigo-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
      case "cod":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/admin/orders"
          className="inline-flex items-center text-[#4A90E2] hover:text-[#0F1E3D] mb-6 font-semibold"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>

        {/* Order Details */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-[#0F1E3D] mb-6">
            Order Details
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="flex items-center space-x-3">
              <FiClipboard className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Order ID:</span> {order._id}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiPackage className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Order Date:</span>{" "}
                {new Date(order.order_date).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiCheckCircle className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Order Status:</span>{" "}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    order.order_status
                  )}`}
                >
                  {order.order_status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiCreditCard className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Payment Status:</span>{" "}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiCreditCard className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Total Amount:</span>{" "}
                <span className="font-bold text-[#0F1E3D]">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiCreditCard className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Payment Method:</span>{" "}
                {order.payment_method}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0F1E3D] mb-4">
            Customer Information
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center space-x-3">
              <FiUser className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Name:</span>{" "}
                {order.customer_id?.username}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiUser className="text-[#4A90E2]" />
              <div>
                <span className="font-semibold">Email:</span>{" "}
                {order.customer_id?.email}
              </div>
            </div>
            <div className="flex items-start space-x-3 mt-4">
              <FiHome className="text-[#4A90E2] mt-1" />
              <div>
                <span className="font-semibold">Shipping Address:</span>
                <br />
                {order.shipping_address}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#0F1E3D] mb-4">
            Order Items
          </h2>
          <div className="divide-y divide-gray-200">
            {order.order_details && order.order_details.length > 0 ? (
              order.order_details.map((item) => (
                <div
                  key={item._id}
                  className="py-4 flex justify-between items-center text-gray-700"
                >
                  {/* Product Info */}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {item.product_id?.product_name ||
                        "Product name not available"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Qty: {item.quantity} @ ${item.unit_price.toFixed(2)}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="font-medium text-gray-800">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No items found for this order.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderPage;
