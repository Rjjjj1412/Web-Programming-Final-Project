import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const palette = {
    primary: "#0F1E3D",
    accent: "#4A90E2",
    white: "#FFFFFF",
    gray: "#A0A0A0",
  };

  // Scroll to top helper
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      className="w-full mt-12"
      style={{ background: palette.primary, color: palette.white }}
    >
      {/* Top section: Brand + Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="text-white text-2xl font-bold tracking-wide"
            onClick={scrollToTop}
          >
            BookHub
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            Your go-to online bookstore for all genres.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0">
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={scrollToTop}
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={scrollToTop}
          >
            Browse Books
          </Link>
          <Link
            to="/about"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={scrollToTop}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={scrollToTop}
          >
            Contact Us
          </Link>
        </div>

        {/* Social or quick info (optional) */}
        <div className="flex space-x-4">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        className="text-center text-sm text-gray-500 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.2)" }}
      >
        &copy; {new Date().getFullYear()} BookHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
