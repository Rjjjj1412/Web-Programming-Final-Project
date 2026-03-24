import React from "react";
import { X } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div id="delete-modal-overlay" data-testid="delete-modal-overlay" className="fixed inset-0 flex items-center justify-center z-50">
      <div
        id="delete-modal-backdrop"
        data-testid="delete-modal-backdrop"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      <div 
        id="delete-modal"
        data-testid="delete-modal"
        className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
        >
        <div className="flex justify-between items-start">
          <h2 id="delete-modal-title" data-testid="delete-modal-title" className="text-xl font-bold text-[#0F1E3D]">{title}</h2>
          <button id="close-delete-modal-btn" data-testid="close-delete-modal-btn" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p id="delete-modal-message" data-testid="delete-modal-message" className="text-gray-600 my-4">{message}</p>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            id="cancel-delete-btn"
            data-testid="cancel-delete-btn"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            data-testid="confirm-delete-btn"
            onClick={onConfirm}
            className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
