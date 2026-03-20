import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../services/ordersApi";
import { FiEye, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const statusOptions = [
    "Waiting for confirmation",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(
        data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
      );
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders.");
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find((o) => o._id === orderId);
    setSelectedOrder(order);
    setSelectedStatus(newStatus);
    setModalIsOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder || !selectedStatus) return;

    const statusValues = {
      "Waiting for confirmation": 0,
      Confirmed: 1,
      Processing: 2,
      Shipped: 3,
      Delivered: 4,
      Cancelled: 5,
    };

    const currentStatusValue = statusValues[selectedOrder.order_status];
    const newStatusValue = statusValues[selectedStatus];

    if (newStatusValue === 1 && currentStatusValue >= 1) {
      toast.error(
        "Order has already been confirmed. Stock was not reduced again."
      );
      setModalIsOpen(false);
      return; // Prevent updateOrderStatus call
    }

    let paymentStatus = selectedOrder.payment_status;

    if (selectedStatus === "Cancelled") {
      paymentStatus = "Failed";
    } else if (selectedStatus !== "Delivered") {
      if (paymentStatus === "Paid") {
        paymentStatus = "Pending";
      }
      if (selectedOrder.payment_method === "cod") {
        paymentStatus = "Pending";
      }
    } else if (
      selectedStatus === "Delivered" &&
      selectedOrder.payment_method === "cod"
    ) {
      paymentStatus = "Paid";
    }

    const toastId = toast.loading("Updating order status...");

    try {
      await updateOrderStatus(selectedOrder._id, selectedStatus, paymentStatus);
      if (selectedStatus === "Confirmed") {
        toast.success(
          "Order status updated to Confirmed. Stock quantity has been reduced.",
          { id: toastId }
        );
      } else {
        toast.success("Order status updated successfully!", { id: toastId });
      }
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.", { id: toastId });
    } finally {
      setModalIsOpen(false);
      setSelectedOrder(null);
      setSelectedStatus("");
    }
  };

  const getStatusStyle = (status) => {
    let backgroundColor;
    switch (status) {
      case "Delivered":
        backgroundColor = "#10B981";
        break;
      case "Shipped":
        backgroundColor = "#4A90E2";
        break;
      case "Confirmed":
        backgroundColor = "#8b5cf6";
        break;
      case "Processing":
        backgroundColor = "#F59E0B";
        break;
      case "Cancelled":
        backgroundColor = "#EF4444";
        break;
      default:
        backgroundColor = "#757575";
    }
    return {
      backgroundColor,
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600",
    };
  };

  const getPaymentStatusStyle = (status) => {
    let backgroundColor;
    switch (status) {
      case "Paid":
        backgroundColor = "#10B981";
        break;
      case "Pending":
      case "cod":
        backgroundColor = "#F59E0B";
        break;
      case "Failed":
        backgroundColor = "#EF4444";
        break;
      default:
        backgroundColor = "#757575";
    }
    return {
      backgroundColor,
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600",
      display: "inline-flex",
    };
  };

  const getDisabledStatus = (currentStatus, targetStatus) => {
    // "Cancelled" is always enabled
    if (targetStatus === "Cancelled") {
      return false;
    }

    // If the order is already cancelled, no other status can be selected
    if (currentStatus === "Cancelled") {
      return true;
    }

    // If the targetStatus is the currentStatus, it should be enabled
    if (currentStatus === targetStatus) {
        return false;
    }

    // Define the valid next status for each current status
    const validNextStatus = {
      "Waiting for confirmation": "Confirmed",
      "Confirmed": "Processing",
      "Processing": "Shipped",
      "Shipped": "Delivered",
      "Delivered": null, // No direct progression from Delivered
    };

    // Check if the targetStatus is the immediate next valid status
    if (targetStatus === validNextStatus[currentStatus]) {
      return false; // Enable the direct next step
    }

    // All other statuses should be disabled
    return true;
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={
          selectedOrder
            ? `Are you sure you want to change order ${selectedOrder._id.slice(
                -8
              )} status to "${selectedStatus}"?`
            : ""
        }
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-[#0F1E3D]">Process Orders</h1>
          <Link
            to="/admin-panel"
            className="inline-flex items-center px-4 py-2 bg-[#0F1E3D] text-white font-semibold rounded-lg hover:bg-[#0F3B60] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white shadow-xl rounded-2xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {order.customer_id?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F1E3D]">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span style={getPaymentStatusStyle(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      style={getStatusStyle(order.order_status)}
                      className="p-1.5 text-xs font-semibold rounded-md border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] transition"
                    >
                      {statusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={getDisabledStatus(order.order_status, status)}
                          style={{
                            backgroundColor: "white",
                            color: getDisabledStatus(order.order_status, status) ? "#ccc" : "black",
                          }}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-[#4A90E2] hover:text-[#0F1E3D] inline-flex items-center font-semibold"
                    >
                      <FiEye className="mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
