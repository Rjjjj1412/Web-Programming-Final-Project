import React, { useState, useEffect } from "react";
import {
  createCategory,
  updateCategory,
  checkCategoryName,
} from "../services/categoriesApi";

const CategoryForm = ({ category, onSuccess, onClose, onError }) => {
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    genre: "Fiction",
  });

  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || "",
        description: category.description || "",
        genre: category.genre || "Fiction",
      });
    }
  }, [category]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "category_name") {
      if (value === "" && category?.category_name !== "") {
        return setNameError("");
      }
      const exists = await checkCategoryName(value);
      if (exists.exists && (!category || category.category_name !== value)) {
        setNameError("Category name already exists");
      } else {
        setNameError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nameError) return;

    try {
      if (category) {
        const response = await updateCategory(category._id, formData);
        onSuccess(response.message || "Category updated successfully!");
      } else {
        const response = await createCategory(formData);
        onSuccess(response.message || "Category created successfully!");
      }
    } catch (error) {
      onError(error.message || "Failed to save category");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-[#0F1E3D]">
          {category ? "Edit Category" : "Create Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="category_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Name
            </label>
            <input
              id="category_name"
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
              placeholder="e.g. Science Fiction"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition"
              required
            />
            {nameError && (
              <p className="text-red-600 text-sm mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief description of the category..."
              className="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition"
            >
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!nameError}
              className="px-6 py-2 text-white bg-[#4A90E2] rounded-lg hover:bg-[#3A7BC8] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
