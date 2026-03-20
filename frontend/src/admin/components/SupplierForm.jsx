import React, { useState, useEffect } from "react";
import {
  createSupplier,
  updateSupplier,
  checkSupplierName,
} from "../services/suppliersApi";

const SupplierForm = ({ supplier, onSuccess, onClose, onError }) => {
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name || "",
        contact_person: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    }
  }, [supplier]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "supplier_name") {
      if (value === "" && supplier?.supplier_name !== "") {
        return setNameError("");
      }
      const exists = await checkSupplierName(value);
      if (exists.exists && (!supplier || supplier.supplier_name !== value)) {
        setNameError("Supplier name already exists");
      } else {
        setNameError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nameError) return;

    try {
      if (supplier) {
        const response = await updateSupplier(supplier._id, formData);
        onSuccess(response.message || "Supplier updated successfully!");
      } else {
        const response = await createSupplier(formData);
        onSuccess(response.message || "Supplier created successfully!");
      }
    } catch (error) {
      onError(error.message || "Failed to save supplier");
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
          {supplier ? "Edit Supplier" : "Create Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Supplier Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="supplier_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Supplier Name
            </label>
            <input
              id="supplier_name"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              placeholder="e.g. Acme Supplies"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
              required
            />
            {nameError && (
              <p className="text-red-600 text-sm mt-1">{nameError}</p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label
              htmlFor="contact_person"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Person
            </label>
            <input
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Main St, City, Country"
              className="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>

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
              disabled={!!nameError}
              className="px-6 py-2 text-white bg-[#4A90E2] rounded-lg hover:bg-[#3A7BC8] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {supplier ? "Save Changes" : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
