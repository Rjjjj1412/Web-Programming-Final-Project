import React, { useContext, useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AdminAuthContext } from "../../components/AdminAuthContext";
import { AuthContext as CustomerAuthContext } from "../../components/CustomerAuthContext";
import AuthRedirectModal from "../../components/AuthRedirectModal";

const AdminProtectedRoute = () => {
  const { authState: adminAuth, loading: adminLoading } =
    useContext(AdminAuthContext);

  const { authState: customerAuth, loading: customerLoading } =
    useContext(CustomerAuthContext);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const loading = adminLoading || customerLoading;

  useEffect(() => {
    if (loading) return;

    // Nobody logged in → show login modal
    if (!adminAuth.isLoggedIn && !customerAuth.isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [loading, adminAuth.isLoggedIn, customerAuth.isLoggedIn]);

  if (loading) return <div>Loading...</div>;

  // CUSTOMER tries to access ADMIN route → Unauthorized page
  if (customerAuth.isLoggedIn && !adminAuth.isLoggedIn) {
    return <Navigate to="/unauthorized" replace />;
  }

  const isAdmin =
    adminAuth.user?.role === "admin" || adminAuth.user?.role === "manager";

  return (
    <>
      {isAdmin ? <Outlet /> : null}

      {/* No one logged in → login modal */}
      <AuthRedirectModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default AdminProtectedRoute;
