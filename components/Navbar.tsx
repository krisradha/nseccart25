import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../services/firebase';
import { LogOut, Plus, Search, ShoppingCart, MapPin, Menu, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User;
  profile: UserProfile;
  searchValue: string;
  onSearch: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, profile, searchValue, onSearch }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-full z-50">
      {/* Top Navbar (Amazon Style Dark) */}
      <nav className="bg-[#131921] text-white px-4 py-2 flex items-center gap-4 sticky top-0 z-50">
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex flex-col cursor-pointer hover:border hover:border-white p-1 rounded min-w-fit"
        >
          <div className="flex items-end">
            <span className="text-xl font-bold leading-none tracking-tighter">NSE</span>
            <span className="text-xl font-bold text-[#febd69] leading-none">cart</span>
          </div>
          <span className="text-[10px] text-gray-300 leading-none text-right">.in</span>
        </div>

        {/* Location (Desktop) */}
        <div className="hidden md:flex flex-col leading-tight text-xs hover:border hover:border-white p-2 rounded cursor-pointer mx-2">
          <span className="text-gray-300 ml-4">Deliver to {profile.displayName?.split(' ')[0]}</span>
          <div className="flex items-center font-bold">
            <MapPin className="h-4 w-4 mr-1 text-white" />
            <span>{profile.collegeYear} Campus</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl relative hidden sm:flex">
          <div className="flex w-full h-10 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-100 text-gray-600 px-3 flex items-center border-r border-gray-300 text-xs cursor-pointer hover:bg-gray-200">
              All
            </div>
            <input 
              type="text" 
              className="flex-1 px-3 text-black outline-none"
              placeholder="Search for books, instruments..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center text-gray-800">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto min-w-fit">
          
          {/* Sell Button */}
          <Link to="/sell" className="hidden md:flex items-center gap-1 hover:border hover:border-white p-2 rounded">
            <Plus className="h-5 w-5 text-[#febd69]" />
            <span className="font-bold text-sm">Sell</span>
          </Link>

          {/* Account */}
          <div className="group relative cursor-pointer hover:border hover:border-white p-2 rounded">
            <div className="text-xs text-gray-300">Hello, {profile.displayName?.split(' ')[0]}</div>
            <div className="font-bold text-sm leading-none flex items-center gap-1">
              Account & Lists
            </div>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg py-2 hidden group-hover:block z-50">
              <div className="px-4 py-2 border-b">
                 <p className="text-gray-800 font-bold text-sm">Your Account</p>
              </div>
              <Link to="/sell" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Listings</Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </button>
            </div>
          </div>

          {/* "Cart" Placeholder */}
          <div className="flex items-end cursor-pointer hover:border hover:border-white p-2 rounded relative">
             <ShoppingCart className="h-8 w-8" />
             <span className="font-bold text-sm leading-none mb-1 hidden md:block">Items</span>
             <span className="absolute top-1 right-2 md:right-8 bg-[#febd69] text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </div>
        </div>
      </nav>

      {/* Sub-Header / Categories Rail */}
      <div className="bg-[#232f3e] text-white text-sm flex items-center gap-4 px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-1 font-bold cursor-pointer">
          <Menu className="h-5 w-5" /> All
        </div>
        {['Fresh Arrivals', 'Books', 'Electronics', 'Stationery', 'Hostel Needs', 'Sports'].map(cat => (
          <span key={cat} className="cursor-pointer hover:border hover:border-white px-2 py-1 rounded">{cat}</span>
        ))}
      </div>
      
      {/* Mobile Search Bar (visible only on small screens) */}
      <div className="sm:hidden bg-[#131921] p-3 pb-4">
          <div className="flex w-full h-10 rounded-md overflow-hidden bg-white">
            <input 
              type="text" 
              className="flex-1 px-3 text-black outline-none"
              placeholder="Search NSE Cart..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
            />
            <button className="bg-[#febd69] px-4 flex items-center justify-center text-gray-800">
              <Search className="h-5 w-5" />
            </button>
          </div>
      </div>
    </div>
  );
};

export default Navbar;