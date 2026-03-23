import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Loader } from "lucide-react";

import AuthRedirectModal from "../components/AuthRedirectModal";
import AdminCustomerConflictModal from "../components/AdminCustomerConflictModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { AuthContext as CustomerAuthContext } from "../components/CustomerAuthContext.jsx";
import { AdminAuthContext } from "../components/AdminAuthContext.jsx";
import { useCart } from "../components/CartContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminConflictModalOpen, setIsAdminConflictModalOpen] =
    useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel",
    iconType: "info",
  });

  const { authState: customerAuthState } = useContext(CustomerAuthContext);
  const { authState: adminAuthState } = useContext(AdminAuthContext);
  const { addToCart } = useCart();

  const inStock = product?.inventory?.stock_quantity ?? 0;

  // Fetch product details
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch recommendations
  useEffect(() => {
    if (!product) return;

    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/products?category_id=${product.category_id._id}&limit=5`,
        );
        const recItems = Array.isArray(res.data)
          ? res.data
          : (res.data?.items ?? []);
        setRecommendations(recItems.filter((p) => p._id !== product._id));
      } catch (err) {
        console.error("Failed to fetch recommendations.", err);
      }
    };
    fetchRecommendations();
  }, [product]);

  // Add to cart handler
  const handleAddToCart = () => {
    const isAdmin =
      adminAuthState.isLoggedIn &&
      (adminAuthState.user?.role === "admin" ||
        adminAuthState.user?.role === "manager");

    // Admin trying to access customer action → show conflict modal
    if (isAdmin) {
      setIsAdminConflictModalOpen(true);
      return;
    }

    // Customer not logged in → show auth redirect
    if (!customerAuthState.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    // Out of stock
    if (inStock === 0) {
      setConfirmationModal({
        isOpen: true,
        title: "Out of Stock",
        message: "This item is currently out of stock.",
        onConfirm: null,
        confirmText: null,
        cancelText: "OK",
        iconType: "warning",
      });
      return;
    }

    // Logged-in customer, item in stock → confirm add to cart
    setConfirmationModal({
      isOpen: true,
      title: "Add to Cart",
      message: "Proceed to add this item to your cart?",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        await addToCart(product);
        navigate("/cart");
      },
      confirmText: "Proceed",
      cancelText: "Cancel",
      iconType: "info",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-full">
        <Loader className="animate-spin w-12 h-12 text-[#1F3B6D]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!product) {
    return (
      <div className="text-center p-8 text-[#1F3B6D]">Product not found.</div>
    );
  }

  const imageUrl = product.image_url?.startsWith("http")
    ? product.image_url
    : product.image_url
      ? `${BASE_URL}images/${product.image_url.split("/").pop()}`
      : "https://via.placeholder.com/400x400?text=No+Image";

  const categoryName = product.category_id?.category_name ?? "N/A";
  const categoryGenre = product.category_id?.genre ?? "N/A";
  const supplierName = product.supplier_id?.supplier_name ?? "N/A";

  return (
    <div className="min-h-full flex flex-col p-6">
      {/* Modals */}
      <AuthRedirectModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <AdminCustomerConflictModal
        isOpen={isAdminConflictModalOpen}
        onClose={() => setIsAdminConflictModalOpen(false)}
      />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        iconType={confirmationModal.iconType}
      />

      {/* Product Details */}
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={imageUrl}
              alt={product.product_name}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1F3B6D] mb-2"
                data-testid={`product-title-${product._id}`}
              >
              {product.product_name}
            </h1>
            <p className="text-xl text-[#757575] mb-4">
              by {product.author ?? "Unknown Author"}
            </p>

            <p className="text-[#4A90E2] mb-6">
              ${product.unit_price?.toFixed(2) ?? "0.00"}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center bg-[#4A90E2] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3A7BC8] transition-colors"
              >
                <ShoppingCart className="mr-2" />
                Add to Cart
              </button>
              <span
                className={`text-sm font-semibold ${
                  inStock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {inStock > 0 ? `${inStock} in stock` : "Out of Stock"}
              </span>
            </div>

            {/* Product Info */}
            <div className="space-y-2 text-[#333333]">
              <p>
                <strong className="text-[#1F3B6D]">Publisher:</strong>{" "}
                {product.publisher ?? "N/A"}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Publication Year:</strong>{" "}
                {product.publication_year ?? "N/A"}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">ISBN:</strong>{" "}
                {product.isbn ?? "N/A"}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Genre:</strong>{" "}
                {categoryGenre}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Category:</strong>{" "}
                {categoryName}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Supplier:</strong>{" "}
                {supplierName}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Format:</strong>{" "}
                {product.format ?? "N/A"}
              </p>
              <p>
                <strong className="text-[#1F3B6D]">Pages:</strong>{" "}
                {product.number_of_pages ?? "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 pt-8 border-t border-[#E0E0E0]">
          <h2 className="text-2xl font-bold text-[#1F3B6D] mb-4">
            Description
          </h2>
          <p className="text-[#757575] leading-relaxed">
            {product.description ?? "No description available."}
          </p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#E0E0E0]">
            <h2 className="text-2xl font-bold text-[#1F3B6D] mb-4">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <ProductCard key={rec._id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple product card for recommendations
const ProductCard = ({ product }) => {
  const imageUrl = product.image_url?.startsWith("http")
    ? product.image_url
    : product.image_url
      ? `${BASE_URL}/images/${product.image_url.split("/").pop()}`
      : "https://via.placeholder.com/150x150?text=No+Image";

  return (
    <Link
      to={`/product/${product._id}`}
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <img
        src={imageUrl}
        alt={product.product_name}
        className="w-full h-48 object-cover mb-4"
      />
      <h3 className="font-bold text-lg">{product.product_name}</h3>
      <p className="text-gray-500">{product.author}</p>
      <p className="font-bold text-[#4A90E2] mt-2">
        ${product.unit_price?.toFixed(2) ?? "0.00"}
      </p>
    </Link>
  );
};

export default ProductDetailsPage;
