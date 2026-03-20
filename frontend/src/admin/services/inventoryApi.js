import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/admin/inventory`;

const PRODUCT_URL = `${BASE_URL}/api/admin/products`;

// Create inventory
export const createInventory = async (inventoryData) => {
  try {
    const response = await axios.post(API_URL, inventoryData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create inventory";
  }
};

// Get all inventory
export const getInventory = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data;
};

// Get inventory by ID
export const getInventoryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update inventory (PATCH)
export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, inventoryData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update inventory";
  }
};

// Delete inventory
export const deleteInventory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete inventory";
  }
};

// Get all products for dropdown
export const getProducts = async () => {
  const response = await axios.get(PRODUCT_URL, { withCredentials: true });
  return response.data;
};
