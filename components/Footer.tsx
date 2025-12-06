import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232F3E] text-white mt-12">
      <div className="bg-[#37475A] py-3 text-center text-sm font-medium hover:bg-[#485769] cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        Back to top
      </div>
      
      <div className="max-w-[1000px] mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-base mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/terms" className="hover:underline">About NSEC Cart</Link></li>
            <li><a href="https://www.nsec.ac.in/" target="_blank" rel="noreferrer" className="hover:underline">NSEC College Website</a></li>
            <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-base mb-3">Make Money with Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/sell" className="hover:underline">Sell on NSEC Cart</Link></li>
            <li><Link to="/sell" className="hover:underline">Protect your Brand</Link></li>
            <li><Link to="/sell" className="hover:underline">NSEC Global Selling</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-base mb-3">Legal & Help</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:underline">Help</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Connect</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span>WhatsApp Support</span>
            </li>
            <li>
               <div className="border border-gray-500 rounded p-2 text-xs text-center mt-2">
                 Student Developer Project
               </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-600 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center items-center gap-4 mb-2">
           <span className="font-bold text-lg text-white">NSEC Cart</span>
        </div>
        <p>&copy; 2024-2025 NSEC Cart. All rights reserved.</p>
        <p className="mt-1">Designed for Netaji Subhash Engineering College.</p>
      </div>
    </footer>
  );
};

export default Footer;