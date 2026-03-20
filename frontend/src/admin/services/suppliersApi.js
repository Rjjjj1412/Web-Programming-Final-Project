import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/admin/suppliers`;

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(API_URL, supplierData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create supplier";
  }
};

export const getSuppliers = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data;
};

export const getSupplierById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, supplierData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update supplier";
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete supplier";
  }
};

export const checkSupplierName = async (name) => {
  const response = await axios.get(`${API_URL}/check-name/${name}`, {
    withCredentials: true,
  });
  return response.data;
};
