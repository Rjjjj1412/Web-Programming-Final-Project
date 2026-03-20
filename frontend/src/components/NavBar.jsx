import React, { useState, useEffect, useContext } from "react";
import {
  Home,
  ShoppingCart,
  BookOpen,
  Info,
  Menu,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  History,
  Shield, // Import Shield icon
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/CustomerAuthContext.jsx";
import { AdminAuthContext } from "../components/AdminAuthContext.jsx";
import { useCart } from "./CartContext.jsx";
import axios from "axios";

const navLinks = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Browse Books", icon: BookOpen, path: "/browse" },
  { name: "About Us", icon: Info, path: "/about" },
  { name: "Contact Us", icon: Info, path: "/contact" },
];

const NavBar = () => {
  const { authState: customerAuthState, logout: customerLogout } =
    useContext(AuthContext);
  const { authState: adminAuthState, logout: adminLogout } =
    useContext(AdminAuthContext);
  const { cartItems } = useCart();

  // Determine which auth state is active
  const currentAuthState = adminAuthState.isLoggedIn
    ? adminAuthState
    : customerAuthState;
  const currentLogout = adminAuthState.isLoggedIn
    ? adminLogout
    : customerLogout;

  const { isLoggedIn, user } = currentAuthState;
  const userRole = user?.role;
  const isAdmin = userRole === "admin" || userRole === "manager";

  const navigate = useNavigate(); // Initialize navigate hook

  const [showNavbar, setShowNavbar] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoriesByGenre, setCategoriesByGenre] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/categories/by-genre",
          { withCredentials: true }
        );
        const genres = res.data.genres || {};
        const transformed = Object.keys(genres).reduce((acc, g) => {
          acc[g] = Array.isArray(genres[g])
            ? genres[g].map((c) => c.category_name)
            : [];
          return acc;
        }, {});
        setCategoriesByGenre(transformed);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Scroll detection
  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLogoutClick = () => {
    currentLogout();
    setProfileOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/browse") {
      return (
        location.pathname === path || location.pathname.startsWith("/product/")
      );
    }
    // Make admin link active for all admin pages
    if (path === "/admin-panel") {
      return location.pathname.startsWith("/admin");
    }
    return location.pathname === path;
  };

  const palette = {
    primary: "#0F1E3D", // main nav background
    hover: "#4A90E2", // hover & active color for links/icons
    accent: "#4A90E2",
    white: "#FFFFFF",
    background: "#F5F3F0",
    gray: "#757575",
  };

  return (
    <header
      className="w-full sticky top-0 z-50 shadow-md"
      style={{
        background: palette.primary,
        transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white text-2xl font-bold tracking-wide"
            >
              BookHub
            </Link>
            <button
              className="md:hidden text-white p-2 rounded-lg hover:opacity-80 transition-opacity"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center font-medium transition-colors navbar-link ${
                  isActive(link.path)
                    ? "border-b-2 navbar-link-active"
                    : "hover:opacity-80"
                }`}
                style={{
                  borderColor: isActive(link.path)
                    ? palette.hover
                    : "transparent",
                }}
              >
                <link.icon className="w-4 h-4 mr-1" />
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin-panel"
                className={`flex items-center font-medium transition-colors navbar-link ${
                  isActive("/admin-panel")
                    ? "border-b-2 navbar-link-active"
                    : "hover:opacity-80"
                }`}
                style={{
                  borderColor: isActive("/admin-panel")
                    ? palette.hover
                    : "transparent",
                }}
              >
                <Shield className="w-4 h-4 mr-1" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Cart & Profile */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative transition-colors icon-link hover:opacity-80 text-white hover:text-[#4A90E2]"
              >
                <ShoppingCart size={24} />
                {isLoggedIn && cartItems.length > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center"
                    style={{ background: palette.accent }}
                  >
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Orders Icon */}
            {isLoggedIn && !isAdmin && (
              <Link
                to="/order-history"
                className="transition-colors hidden md:block icon-link text-white hover:text-[#4A90E2]"
                title="Order History"
              >
                <History size={24} />
              </Link>
            )}

            {/* Profile */}
            <div className="relative">
              <button
                className="text-white hover:opacity-80 hover:text-[#4A90E2] flex items-center gap-1 transition-opacity icon-link"
                onClick={() => {
                  if (isLoggedIn) setProfileOpen(!profileOpen);
                  else navigate("/login");
                }}
              >
                <UserIcon size={24} />
                {isLoggedIn && (
                  <span className="text-sm hidden md:inline">
                    {user?.username}
                  </span>
                )}
                {isLoggedIn && (
                  <span
                    className={`transition-transform duration-200 hidden md:inline ${
                      profileOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                )}
              </button>

              {profileOpen && isLoggedIn && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-2 z-50 animate-slide-down"
                  style={{ background: palette.white }}
                >
                  <div
                    className="px-4 py-2 text-sm border-b"
                    style={{ color: palette.primary, borderColor: "#F5F7FA" }}
                  >
                    <p className="font-medium">
                      {user?.username || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  {!isAdmin && (
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                      style={{ color: palette.primary }}
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} className="inline mr-2" />
                      Edit Profile
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link
                      to="/order-history"
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors md:hidden"
                      style={{ color: palette.primary }}
                      onClick={() => setProfileOpen(false)}
                    >
                      <History size={16} className="inline mr-2" />
                      My Orders
                    </Link>
                  )}
                  <button
                    onClick={onLogoutClick}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center transition-colors"
                    style={{ color: palette.primary }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav
          className="md:hidden flex flex-col p-4 space-y-2 animate-fade-in"
          style={{ background: palette.primary }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center p-2 rounded-lg navbar-mobile-link transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5 mr-2" />
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin-panel"
              className="flex items-center p-2 rounded-lg navbar-mobile-link transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Shield className="w-5 h-5 mr-2" />
              Admin
            </Link>
          )}

          {!isAdmin && (
            <Link
              to="/cart"
              className="flex items-center p-2 rounded-lg navbar-mobile-link transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {isLoggedIn && cartItems.length > 0 && (
                <span
                  className="ml-1 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center"
                  style={{ background: palette.accent }}
                >
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn && user ? (
            <div
              className="border-t pt-2"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <span className="flex items-center p-2 text-white">
                <UserIcon className="w-5 h-5 mr-2" />
                {user.username || user.email}
              </span>
              {!isAdmin && (
                <Link
                  to="/order-history"
                  className="flex items-center p-2 navbar-mobile-link transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <History className="w-5 h-5 mr-2" />
                  My Orders
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/edit-profile"
                  className="flex items-center p-2 navbar-mobile-link transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Edit Profile
                </Link>
              )}
              <button
                onClick={onLogoutClick}
                className="flex items-center p-2 w-full navbar-mobile-link transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center p-2 navbar-mobile-link transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Login / Sign Up
            </Link>
          )}
        </nav>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.2s ease-out forwards; }

        /* desktop nav links (text + icon) */
        .navbar-link {
          color: ${palette.white};
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
        }

        /* hover effect only when not active */
        .navbar-link:not(.navbar-link-active):hover {
          color: ${palette.hover};
        }

        /* active link: white text + colored underline */
        .navbar-link-active {
          color: ${palette.white} !important;
          border-bottom: 2px solid ${palette.hover};
        }

        /* icons inside nav links inherit text color */
        .navbar-link svg {
          stroke: currentColor;
          color: inherit;
        }

        /* icon links */
        /* These styles are now handled by Tailwind CSS classes applied directly to the elements. */

        /* mobile links */
        /* These styles are now handled by Tailwind CSS classes applied directly to the elements. */

        /* mobile links */
        .navbar-mobile-link { color: ${palette.white}; transition: color 0.15s ease; display: inline-flex; align-items: center; }
        .navbar-mobile-link:hover { color: ${palette.hover}; }
        .navbar-mobile-link svg { stroke: currentColor; color: inherit; }
      `}</style>
    </header>
  );
};

export default NavBar;
