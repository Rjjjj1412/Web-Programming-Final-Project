import React from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiGrid, FiUsers, FiPackage, FiShoppingCart, FiBarChart2 } from 'react-icons/fi';

const AdminCard = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1"
  >
    <div className="flex items-center">
      <div className="text-3xl text-blue-600 mr-4">{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

const AdminPanel = () => {
  const adminModules = [
    {
      to: '/admin/products',
      icon: <FiBox />,
      title: 'Manage Products',
      description: 'Create, update, and delete products.',
    },
    {
      to: '/admin/categories',
      icon: <FiGrid />,
      title: 'Manage Categories',
      description: 'Organize products into categories.',
    },
    {
      to: '/admin/suppliers',
      icon: <FiUsers />,
      title: 'Manage Suppliers',
      description: 'Keep track of product suppliers.',
    },
    {
      to: '/admin/inventory',
      icon: <FiPackage />,
      title: 'Manage Inventory',
      description: 'Monitor and adjust stock levels.',
    },
    {
      to: '/admin/orders',
      icon: <FiShoppingCart />,
      title: 'Process Orders',
      description: 'View and update customer orders.',
    },
    {
      to: '/admin/reports',
      icon: <FiBarChart2 />,
      title: 'Generate Reports',
      description: 'Get insights into sales and performance.',
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mb-10">
          Welcome to the control center. Manage your e-commerce operations from here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminModules.map((module) => (
            <AdminCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
