import React, { useState, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  getProducts,
  getCategories,
  getSuppliers,
} from "../services/productsApi";

const initialState = {
  product_name: "",
  description: "",
  author: "",
  publisher: "",
  isbn: "",
  category_id: "",
  supplier_id: "",
  unit_price: "",
  cost_price: "",
  language: "",
  number_of_pages: "",
  publication_year: "",
  format: "Paperback",
  image_url: "",
  stock_quantity: 0,
  reorder_level: 10,
  max_stock_level: "",
};

const ProductForm = ({ product, onSuccess, onClose, onError }) => {
  const [formData, setFormData] = useState(initialState);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [duplicateName, setDuplicateName] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing products to check duplicates
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cats, sups] = await Promise.all([
          getCategories(),
          getSuppliers(),
        ]);
        setCategories(cats);
        setSuppliers(sups);
      } catch (err) {
        console.error("Failed to fetch categories or suppliers:", err);
      }
    };
    fetchDropdowns();
  }, []);

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || "",
        description: product.description || "",
        author: product.author || "",
        publisher: product.publisher || "",
        isbn: product.isbn || "",
        category_id: product.category_id?._id || "",
        supplier_id: product.supplier_id?._id || "",
        unit_price: product.unit_price || "",
        cost_price: product.cost_price || "",
        language: product.language || "",
        number_of_pages: product.number_of_pages || "",
        publication_year: product.publication_year || "",
        format: product.format || "Paperback",
        image_url: product.image_url || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [product]);

  // Real-time duplicate check
  useEffect(() => {
    const isDuplicate = allProducts.some(
      (p) =>
        p.product_name.toLowerCase() === formData.product_name.toLowerCase() &&
        p._id !== product?._id
    );
    setDuplicateName(isDuplicate);
  }, [formData.product_name, allProducts, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.product_name ||
      !formData.author ||
      !formData.unit_price ||
      !formData.cost_price
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (duplicateName) {
      setError("A product with this name already exists.");
      return;
    }

    try {
      let response;
      if (product) {
        response = await updateProduct(product._id, formData);
      } else {
        response = await createProduct(formData);
      }
      onSuccess(response.message);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Failed to save product.";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#0F1E3D]">
          {product ? "Edit Product" : "Create Product"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label
              htmlFor="product_name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              placeholder="Product Name"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            />
            {duplicateName && (
              <span className="text-red-600 text-sm">
                A product with this name already exists.
              </span>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief description of the product..."
              className="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700"
            >
              Author
            </label>
            <input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="publisher"
              className="block text-sm font-medium text-gray-700"
            >
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="Publisher"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          <div>
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700"
            >
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="ISBN"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="supplier_id"
              className="block text-sm font-medium text-gray-700"
            >
              Supplier
            </label>
            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.supplier_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="unit_price"
              className="block text-sm font-medium text-gray-700"
            >
              Unit Price
            </label>
            <input
              id="unit_price"
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              placeholder="Unit Price"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="cost_price"
              className="block text-sm font-medium text-gray-700"
            >
              Cost Price
            </label>
            <input
              id="cost_price"
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              placeholder="Cost Price"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <input
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Language"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          <div>
            <label
              htmlFor="number_of_pages"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Pages
            </label>
            <input
              id="number_of_pages"
              type="number"
              name="number_of_pages"
              value={formData.number_of_pages}
              onChange={handleChange}
              placeholder="Number of Pages"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          <div>
            <label
              htmlFor="publication_year"
              className="block text-sm font-medium text-gray-700"
            >
              Publication Year
            </label>
            <input
              id="publication_year"
              type="number"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              placeholder="Publication Year"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          <div>
            <label
              htmlFor="format"
              className="block text-sm font-medium text-gray-700"
            >
              Format
            </label>
            <select
              id="format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            >
              <option value="Hardcover">Hardcover</option>
              <option value="Paperback">Paperback</option>
              <option value="eBook">eBook</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="image_url"
              className="block text-sm font-medium text-gray-700"
            >
              Image URL
            </label>
            <input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Image URL"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          {!product && (
            <>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Initial Inventory
                </h3>
              </div>
              <div>
                <label
                  htmlFor="stock_quantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock Quantity
                </label>
                <input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
                />
              </div>
              <div>
                <label
                  htmlFor="reorder_level"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reorder Level
                </label>
                <input
                  id="reorder_level"
                  name="reorder_level"
                  type="number"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
                />
              </div>
              <div>
                <label
                  htmlFor="max_stock_level"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max Stock Level
                </label>
                <input
                  id="max_stock_level"
                  name="max_stock_level"
                  type="number"
                  value={formData.max_stock_level}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
                />
              </div>
            </>
          )}

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
              disabled={duplicateName} // Disable if duplicate
              className={`px-6 py-2 text-white rounded-lg hover:bg-[#3A7BC8] ${
                duplicateName
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4A90E2]"
              }`}
            >
              {product ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
