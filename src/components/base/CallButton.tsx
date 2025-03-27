// components/CallButton.tsx
import React from "react";
import { FaPhone } from "react-icons/fa";

const CallButton: React.FC = () => {
  return (
    <a
      href="tel:+601136907583"
      className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out"
      title="Call Us"
    >
      <FaPhone className="text-2xl" />
    </a>
  );
};

export default CallButton;
