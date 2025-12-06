import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232F3E] text-white mt-12">
      <div className="bg-[#37475A] py-3 text-center text-sm font-medium hover:bg-[#485769] cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        Back to top
      </div>
      
      <div className="max-w-[1000px] mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        
        {/* Column 1: College Info */}
        <div>
          <h3 className="font-bold text-base mb-3">Partner Institution</h3>
          <div className="mb-4 bg-white p-2 rounded-md inline-block">
             <img 
               src="https://www.nsec.ac.in/images/Logo_16X35inch.jpg" 
               alt="Netaji Subhash Engineering College" 
               className="h-12 w-auto object-contain"
             />
          </div>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="https://www.nsec.ac.in/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                NSEC Official Website <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li><a href="https://www.nsec.ac.in/page.php?id=37" target="_blank" rel="noreferrer" className="hover:underline">Admissions 2025-26</a></li>
            <li><a href="https://www.nsec.ac.in/page.php?id=38" target="_blank" rel="noreferrer" className="hover:underline">Academics</a></li>
          </ul>
        </div>
        
        {/* Column 2: Selling */}
        <div>
          <h3 className="font-bold text-base mb-3">Make Money with Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/sell" className="hover:underline">Sell on NSEC Cart</Link></li>
            <li><Link to="/value" className="hover:underline text-[#febd69] font-medium">Is it worth it? (Read)</Link></li>
            <li><Link to="/sell" className="hover:underline">Protect your Brand</Link></li>
          </ul>
        </div>
        
        {/* Column 3: Legal */}
        <div>
          <h3 className="font-bold text-base mb-3">Legal & Help</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:underline">Help & Support</Link></li>
          </ul>
        </div>

        {/* Column 4: Connect */}
        <div>
          <h3 className="font-bold text-base mb-3">Connect</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span>NSEC Media Channel</span>
            </li>
            <li>
               <div className="border border-gray-500 rounded p-2 text-xs text-center mt-2 text-gray-400">
                 Student Innovation Initiative
               </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-600 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center items-center gap-4 mb-2">
           <span className="font-bold text-lg text-white">NSEC Cart</span>
        </div>
        <p>&copy; 2025 NSEC Cart. All rights reserved.</p>
        <p className="mt-2">
           Developed by <a href="https://krishost.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">krishost.com</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;