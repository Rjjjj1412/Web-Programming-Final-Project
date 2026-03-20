import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Base URL for admin API
const API_BASE_URL = `${BASE_URL}/api/admin`; // base for categories, suppliers, products

// Create Product
export const createProduct = async (productData) => {
  const response = await axios.post(`${API_BASE_URL}/products`, productData, {
    withCredentials: true,
  });
  return response.data;
};

// Get all Products
export const getProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`, {
    withCredentials: true,
  });
  return response.data;
};

// Get Product by ID
export const getProductById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update Product
export const updateProduct = async (id, productData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/products/${id}`,
    productData,
    { withCredentials: true },
  );
  return response.data;
};

// Delete Product
export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/products/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Categories
export const getCategories = async () => {
  const res = await axios.get(`${API_BASE_URL}/categories`, {
    withCredentials: true,
  });
  return res.data;
};

// Suppliers
export const getSuppliers = async () => {
  const res = await axios.get(`${API_BASE_URL}/suppliers`, {
    withCredentials: true,
  });
  return res.data;
};
