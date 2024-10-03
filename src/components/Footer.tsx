import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo or Site Name */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Thelewale</h1>
          <p className="text-sm">Bringing street food to your doorstep!</p>
        </div>

        {/* Links */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <Link to="/" className="text-white hover:text-gray-400">
            Home
          </Link>
          <Link to="/add-vendor" className="text-white hover:text-gray-400">
            Add Vendor
          </Link>
          <Link to="/about" className="text-white hover:text-gray-400">
            About Us
          </Link>
        </div>

        
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center border-t border-gray-700 pt-4">
        <p>&copy; {new Date().getFullYear()} Thelewale. All rights reserved to me.</p>
      </div>
    </footer>
  );
};

export default Footer;
