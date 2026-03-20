import React, { useState, useEffect } from "react";
import { getInventory, deleteInventory } from "../services/inventoryApi";
import InventoryForm from "../components/InventoryForm";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InventoryPage = () => {
  const navigate = useNavigate();
  const [inventoryList, setInventoryList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchInventory();
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

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventoryList(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setErrorMessage(error.message || "Failed to fetch inventory.");
    }
  };

  const handleCreate = () => {
    setSelectedInventory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inventory) => {
    setSelectedInventory(inventory);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteInventory(deleteId);
      setSuccessMessage(response.message || "Inventory deleted successfully!");
      fetchInventory();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete inventory.");
    }
    setDeleteModalOpen(false);
  };

  const handleFormSuccess = (message) => {
    setIsModalOpen(false);
    setSuccessMessage(message);
    fetchInventory();
  };

  const handleFormError = (message) => {
    setIsModalOpen(false);
    setErrorMessage(message);
  };

  const getStockColor = (quantity, reorderLevel) => {
    if (quantity <= reorderLevel) return "text-red-600 font-bold";
    if (quantity <= reorderLevel * 1.5) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0F1E3D] text-white rounded-lg hover:bg-[#0F3B60] transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* Messages */}
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
            Manage Inventory
          </h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A7BC8] transition-colors"
          >
            Add Inventory
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Stock Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                    {item.product_id.image_url ? (
                      <img
                        src={
                          item.product_id.image_url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={item.product_id.product_name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                    <span>{item.product_id.product_name}</span>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm ${getStockColor(
                      item.stock_quantity,
                      item.reorder_level
                    )}`}
                  >
                    {item.stock_quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.reorder_level}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.max_stock_level || "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-[#4A90E2] hover:text-[#3A7BC8] font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(item._id)}
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

      {isModalOpen && (
        <InventoryForm
          inventory={selectedInventory}
          existingInventory={inventoryList}
          onSuccess={handleFormSuccess}
          onClose={() => setIsModalOpen(false)}
          onError={handleFormError}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Inventory"
        message="Are you sure you want to delete this inventory record?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default InventoryPage;
