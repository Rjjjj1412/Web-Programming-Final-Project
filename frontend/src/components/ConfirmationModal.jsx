import React from "react";
import { X, AlertTriangle, ShoppingCart } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  iconType = "info", // 'info', 'warning', 'error'
}) => {
  if (!isOpen) return null;

  const icons = {
    info: <ShoppingCart className="w-16 h-16 text-blue-500" />,
    warning: <AlertTriangle className="w-16 h-16 text-yellow-500" />,
    error: <X className="w-16 h-16 text-red-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all pointer-events-auto">
        <div className="flex justify-center mb-4">{icons[iconType]}</div>

        <h2 className="text-xl font-bold text-center mb-3 text-[#1F3B6D]">
          {title}
        </h2>

        <p className="text-center text-gray-600 mb-6">{message}</p>

        <div className="flex flex-col space-y-3">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-lg text-lg font-bold text-white transition-colors duration-300 hover:bg-opacity-90 bg-[#4A90E2]"
            >
              {confirmText || "Confirm"}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg text-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {cancelText || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
