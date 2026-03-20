import React, { useState, useEffect } from "react";
import {
  createInventory,
  updateInventory,
  getProducts,
} from "../services/inventoryApi";

const InventoryForm = ({
  inventory,
  existingInventory,
  onSuccess,
  onClose,
  onError,
}) => {
  const [formData, setFormData] = useState({
    product_id: "",
    stock_quantity: 0,
    reorder_level: 10,
    max_stock_level: "",
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (inventory) {
      setFormData({
        product_id: inventory.product_id._id || "",
        stock_quantity: inventory.stock_quantity || 0,
        reorder_level: inventory.reorder_level || 10,
        max_stock_level: inventory.max_stock_level || "",
      });
    }
  }, [inventory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (inventory) {
        const response = await updateInventory(inventory._id, formData);
        onSuccess(response.message || "Inventory updated successfully!");
      } else {
        const response = await createInventory(formData);
        onSuccess(response.message || "Inventory created successfully!");
      }
    } catch (error) {
      onError(error.message || "Failed to save inventory");
    }
  };

  const noProductsAvailable = !inventory && products.length === 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#0F1E3D]">
          {inventory ? "Edit Inventory" : "Create Inventory"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Product Dropdown */}
          <div className="md:col-span-2">
            <label
              htmlFor="product_id"
              className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
            >
              Product
              {inventory && (
                <span className="text-sm text-[#4A90E2] italic">
                  (Product already in Inventory)
                </span>
              )}
            </label>

            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
              disabled={!!inventory || noProductsAvailable} // lock if no products
            >
              <option value="">
                {inventory
                  ? inventory.product_id.product_name
                  : noProductsAvailable
                  ? "No products available"
                  : "Select a product"}
              </option>
              {products.map((product) => {
                const isUsed = existingInventory.some(
                  (inv) => inv.product_id._id === product._id
                );
                if (inventory && product._id === inventory.product_id._id) {
                  return (
                    <option key={product._id} value={product._id} selected>
                      {product.product_name}
                    </option>
                  );
                }
                return (
                  <option
                    key={product._id}
                    value={product._id}
                    disabled={!inventory && isUsed}
                  >
                    {product.product_name}{" "}
                    {!inventory && isUsed ? "(Already in inventory)" : ""}
                  </option>
                );
              })}
            </select>

            {noProductsAvailable && (
              <p className="text-sm text-red-600 mt-1">
                No products are available to add into inventory. Please create
                products first.
              </p>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label
              htmlFor="stock_quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock Quantity
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
              disabled={noProductsAvailable} // lock if no products
            />
          </div>

          {/* Reorder Level */}
          <div>
            <label
              htmlFor="reorder_level"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reorder Level
            </label>
            <input
              id="reorder_level"
              name="reorder_level"
              type="number"
              min="0"
              value={formData.reorder_level}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              disabled={noProductsAvailable} // lock if no products
            />
          </div>

          {/* Max Stock Level */}
          <div>
            <label
              htmlFor="max_stock_level"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Stock Level
            </label>
            <input
              id="max_stock_level"
              name="max_stock_level"
              type="number"
              min="0"
              value={formData.max_stock_level}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              disabled={noProductsAvailable} // lock if no products
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 text-white bg-[#4A90E2] rounded-lg hover:bg-[#3A7BC8]"
              disabled={noProductsAvailable} // lock submit if no products
            >
              {inventory ? "Save Changes" : "Create Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
