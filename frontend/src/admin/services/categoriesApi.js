import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/admin/categories`;

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(API_URL, categoryData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create category";
  }
};

export const getCategories = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, categoryData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update category";
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete category";
  }
};

export const checkCategoryName = async (name) => {
  const response = await axios.get(`${API_URL}/check-name/${name}`, {
    withCredentials: true,
  });
  return response.data;
};
