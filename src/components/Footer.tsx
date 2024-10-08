import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-300 font-inter">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-between mt-14">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Thelewale</h2>
            <p className="text-sm">Bringing street food to your doorstep!</p>
            <div className="flex space-x-4">
              <a href="https://x.com/_shukladitya_" target='_blank' aria-label="Twitter">
                <Twitter className="h-6 w-6 hover:text-white transition-colors" />
              </a>
              <a href="https://github.com/AdiShukla06" target='_blank' aria-label="GitHub">
                <Github className="h-6 w-6 hover:text-white transition-colors" />
              </a>
              <a href="https://www.linkedin.com/in/aditya-shukla06/" target='_blank' aria-label="LinkedIn">
                <Linkedin className="h-6 w-6 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:text-right"> {/* Align to the right on medium+ screens */}
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/add-vendor" className="hover:text-white transition-colors">Add Vendor</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              
            </ul>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} Thelewale. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
