import React, { useState, useEffect, useRef } from "react";
import { getProducts, deleteProduct } from "../services/productsApi";
import ProductForm from "../components/ProductForm";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const topScrollRef = useRef(null);
  const tableWrapperRef = useRef(null);

  const PRODUCTS_PER_PAGE = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setErrorMessage(error.message || "Failed to fetch products.");
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteProduct(deleteId);
      setSuccessMessage(response.message);
      fetchProducts();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete product.");
    }
    setDeleteModalOpen(false);
  };

  // Scroll syncing
  const syncScroll = (source, target) => {
    if (target.current && source.current) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  // Pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

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

        {/* Success/Error */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Success!</strong> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong> {errorMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-[#0F1E3D]">Manage Products</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A7BC8] transition-colors"
          >
            Create Product
          </button>
        </div>

        {/* Top Scrollbar */}
        <div className="mb-2">
          <span className="text-sm text-gray-600 mb-1 block">
            Table has many columns — scroll horizontally to view all.
          </span>
          <div
            ref={topScrollRef}
            className="overflow-x-auto h-4"
            onScroll={() => syncScroll(topScrollRef, tableWrapperRef)}
          >
            <div style={{ width: "1200px", height: "1px" }}></div>
          </div>
        </div>

        {/* Table */}
        <div
          ref={tableWrapperRef}
          className="bg-white shadow-lg rounded-xl overflow-x-auto"
          style={{ maxHeight: "500px" }} // keeps table small for bottom scroll
          onScroll={() => syncScroll(tableWrapperRef, topScrollRef)}
        >
          <table className="min-w-[1200px] divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-64">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                  Publisher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">
                  Format
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded object-cover"
                        src={
                          product.image_url || "https://via.placeholder.com/150"
                        }
                        alt={product.product_name}
                      />
                      <span>{product.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.publisher}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.isbn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category_id?.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.supplier_id?.supplier_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.language}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.number_of_pages}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.publication_year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.format}
                  </td>
                  <td className="px-6 py-4 text-right text-sm flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[#4A90E2] hover:text-[#3A7BC8] font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(product._id)}
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

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ProductForm
          product={selectedProduct}
          onSuccess={(message) => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            setSuccessMessage(message);
            setErrorMessage("");
            fetchProducts();
          }}
          onError={(message) => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            setErrorMessage(message);
            setSuccessMessage("");
          }}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
