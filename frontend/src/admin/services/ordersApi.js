import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/admin/orders`;

export const getOrders = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateOrderStatus = async (id, status, paymentStatus) => {
  const payload = {
    order_status: status,
  };
  if (paymentStatus) {
    payload.payment_status = paymentStatus;
  }
  const response = await axios.patch(`${API_URL}/${id}/process`, payload, {
    withCredentials: true,
  });
  return response.data;
};
