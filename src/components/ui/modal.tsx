import React from "react";
import { motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className=" fixed inset-0 flex items-center justify-center z-50 text-white font-inter">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />
      <motion.div
        className="bg-gray-950 rounded-lg shadow-lg p-6 z-10 max-w-lg w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {children}
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default Modal;
