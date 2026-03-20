import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/admin/reports`;

// Get total sales report
export const getTotalSales = async () => {
  const response = await axios.get(`${API_URL}/total-sales`, {
    withCredentials: true,
  });
  return response.data;
};

// Get low stock items report
export const getLowStockItems = async () => {
  const response = await axios.get(`${API_URL}/low-stock`, {
    withCredentials: true,
  });
  return response.data;
};

// Get revenue by category report
export const getRevenueByCategory = async () => {
  const response = await axios.get(`${API_URL}/revenue-by-category`, {
    withCredentials: true,
  });
  return response.data;
};

// Get top selling products report
export const getTopSellingProducts = async () => {
  const response = await axios.get(`${API_URL}/top-selling`, {
    withCredentials: true,
  });
  return response.data;
};

// Get orders summary report
export const getOrdersSummary = async () => {
  const response = await axios.get(`${API_URL}/orders-summary`, {
    withCredentials: true,
  });
  return response.data;
};
