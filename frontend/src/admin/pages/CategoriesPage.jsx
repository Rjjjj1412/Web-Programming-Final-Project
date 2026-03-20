import React, { useState, useEffect } from "react";
import { getCategories, deleteCategory } from "../services/categoriesApi";
import CategoryForm from "../components/CategoryForm";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setErrorMessage(error.message || "Failed to fetch categories.");
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteCategory(deleteId);
      setSuccessMessage(response.message);
      fetchCategories();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete category.");
    }
    setDeleteModalOpen(false);
  };

  const handleFormSuccess = (message) => {
    setIsModalOpen(false);
    setSuccessMessage(message);
    fetchCategories();
  };

  const handleFormError = (message) => {
    setIsModalOpen(false);
    setErrorMessage(message);
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0F1E3D] text-white rounded-lg hover:bg-[#0F3B60] transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F1E3D]">
            Manage Categories
          </h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A7BC8] transition-colors"
          >
            Create Category
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {category.category_name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.genre}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {category.productCount || 0}
                  </td>

                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-[#4A90E2] hover:text-[#3A7BC8] mr-4 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(category._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING FORM MODAL */}
      {isModalOpen && (
        <CategoryForm
          category={selectedCategory}
          onSuccess={(message) => handleFormSuccess(message)}
          onClose={() => setIsModalOpen(false)}
          onError={handleFormError}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default CategoriesPage;
