import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mt-2">
          Sorry, you do not have the necessary permissions to access this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-[#4A90E2] px-6 py-3 text-white not-only:bg-[#4A90E2]rounded-md hover:bg-[#3A7BC8] transition-transform duration-300 transform hover:scale-105"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
