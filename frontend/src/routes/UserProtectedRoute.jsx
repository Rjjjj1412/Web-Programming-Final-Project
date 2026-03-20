import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext as CustomerAuthContext } from "../components/CustomerAuthContext";
import { AdminAuthContext } from "../components/AdminAuthContext";
import AuthRedirectModal from "../components/AuthRedirectModal";
import AdminCustomerConflictModal from "../components/AdminCustomerConflictModal";

const UserProtectedRoute = () => {
  const { authState: customerAuthState, loading: customerLoading } =
    useContext(CustomerAuthContext);
  const { authState: adminAuthState, loading: adminLoading } =
    useContext(AdminAuthContext);

  const [modalToShow, setModalToShow] = useState(null); // "adminConflict" | "authRedirect" | null

  useEffect(() => {
    if (customerLoading || adminLoading) return;

    // Priority 1: Admin logged in → conflict modal
    if (adminAuthState.isLoggedIn) {
      setModalToShow("adminConflict");
      return;
    }

    // Priority 2: Customer logged in → allow access
    if (customerAuthState.isLoggedIn) {
      setModalToShow(null);
      return;
    }

    // Priority 3: No one logged in → auth redirect modal
    setModalToShow("authRedirect");
  }, [
    customerLoading,
    adminLoading,
    adminAuthState.isLoggedIn,
    customerAuthState.isLoggedIn,
  ]);

  if (customerLoading || adminLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Show page if customer logged in */}
      {customerAuthState.isLoggedIn && <Outlet />}

      {/* Admin accessing customer pages */}
      <AdminCustomerConflictModal
        isOpen={modalToShow === "adminConflict"}
        onClose={() => setModalToShow(null)}
      />

      {/* Not logged in → show customer login redirect */}
      <AuthRedirectModal
        isOpen={modalToShow === "authRedirect"}
        onClose={() => setModalToShow(null)}
      />
    </>
  );
};

export default UserProtectedRoute;
