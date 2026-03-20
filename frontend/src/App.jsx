import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider as CustomerAuthProvider } from "./components/CustomerAuthContext.jsx";
import { AdminAuthProvider } from "./components/AdminAuthContext.jsx";
import { CartProvider } from "./components/CartContext.jsx";

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";

import HomePage from "./pages/Home.jsx";
import BrowseBooksPage from "./pages/BrowseBooks.jsx";
import AboutPage from "./pages/AboutUs.jsx";
import ContactPage from "./pages/ContactUs.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import EditProfilePage from "./pages/EditProfile.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderStatusPage from "./pages/OrderStatusPage.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";

import UserProtectedRoute from "./routes/UserProtectedRoute.jsx";
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute.jsx";

import AdminPanel from "./admin/pages/AdminPanel.jsx";
import AdminLoginPage from "./pages/AdminLogin.jsx";
import ProductsPage from "./admin/pages/ProductsPage";
import CategoriesPage from "./admin/pages/CategoriesPage";
import SuppliersPage from "./admin/pages/SuppliersPage";
import InventoryPage from "./admin/pages/InventoryPage";
import OrdersPage from "./admin/pages/OrdersPage";
import ViewOrderPage from "./admin/pages/ViewOrderPage.jsx";
import ReportsPage from "./admin/pages/ReportsPage";

const App = () => {
  return (
    <Router>
      <CustomerAuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <NavBar />

            <div className="min-h-screen flex flex-col">
              <main className="flex-1 min-h-0 bg-[#F5F7FA]">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<BrowseBooksPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Admin Login Page */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Customer Protected Routes */}
                  <Route element={<UserProtectedRoute />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route
                      path="/order-status/:orderId"
                      element={<OrderStatusPage />}
                    />
                    <Route
                      path="/order-history"
                      element={<OrderHistoryPage />}
                    />
                    <Route path="/edit-profile" element={<EditProfilePage />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin-panel" element={<AdminPanel />} />
                    <Route path="/admin/products" element={<ProductsPage />} />
                    <Route
                      path="/admin/categories"
                      element={<CategoriesPage />}
                    />
                    <Route
                      path="/admin/suppliers"
                      element={<SuppliersPage />}
                    />
                    <Route
                      path="/admin/inventory"
                      element={<InventoryPage />}
                    />
                    <Route path="/admin/orders" element={<OrdersPage />} />
                    <Route
                      path="/admin/orders/:orderId"
                      element={<ViewOrderPage />}
                    />
                    <Route path="/admin/reports" element={<ReportsPage />} />
                  </Route>
                </Routes>
              </main>

              <Footer />
            </div>
          </CartProvider>
        </AdminAuthProvider>
      </CustomerAuthProvider>
    </Router>
  );
};

export default App;
