import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../services/firebase';
import { LogOut, Plus, Search, ShoppingCart, MapPin, Menu, Package, ShieldCheck, School } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
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
            <span className="text-xl font-bold leading-none tracking-tighter">NSEC</span>
            <span className="text-xl font-bold text-[#febd69] leading-none">Cart</span>
          </div>
          <span className="text-[10px] text-gray-300 leading-none text-right">Campus Store</span>
        </div>

        {/* Location (Desktop) */}
        <div className="hidden md:flex flex-col leading-tight text-xs hover:border hover:border-white p-2 rounded cursor-pointer mx-2 min-w-[120px]">
          {user && profile ? (
             <>
               <span className="text-gray-300 ml-4">Deliver to {profile.displayName?.split(' ')[0]}</span>
               <div className="flex items-center font-bold">
                 <MapPin className="h-4 w-4 mr-1 text-white" />
                 <span>{profile.collegeYear} Campus</span>
               </div>
             </>
          ) : (
            <>
               <span className="text-gray-300 ml-4">Hello</span>
               <div className="flex items-center font-bold">
                 <MapPin className="h-4 w-4 mr-1 text-white" />
                 <span>Select your location</span>
               </div>
            </>
          )}
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
              placeholder="Search for books, instruments, drafters..."
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
          
          {/* NSEC Site Link */}
          <a href="https://www.nsec.ac.in/" target="_blank" rel="noreferrer" className="hidden lg:flex items-center gap-1 hover:border hover:border-white p-2 rounded text-xs font-bold text-gray-300">
             <School className="h-4 w-4" />
             <span>NSEC Site</span>
          </a>

          {/* Sell Button */}
          <Link to="/sell" className="hidden md:flex items-center gap-1 hover:border hover:border-white p-2 rounded">
            <Plus className="h-5 w-5 text-[#febd69]" />
            <span className="font-bold text-sm">Sell</span>
          </Link>

          {/* Account */}
          <div className="group relative cursor-pointer hover:border hover:border-white p-2 rounded">
            <div className="text-xs text-gray-300">Hello, {user ? (profile?.displayName?.split(' ')[0] || 'Student') : 'Sign in'}</div>
            <div className="font-bold text-sm leading-none flex items-center gap-1">
              Account & Lists
            </div>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg py-2 hidden group-hover:block z-50">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b">
                    <p className="text-gray-800 font-bold text-sm">Your Account</p>
                  </div>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Package className="h-4 w-4 mr-2" /> My Orders
                  </Link>
                  <Link to="/sell" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Listings</Link>
                  <Link to="/setup-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Profile</Link>
                  <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2" /> Admin Panel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </button>
                </>
              ) : (
                 <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-[#febd69] text-gray-900 text-xs font-bold py-1 rounded-sm shadow-sm mb-1"
                    >
                      Sign In
                    </button>
                    <p className="text-[10px] text-gray-500">New customer? <Link to="/login" className="text-blue-600 hover:underline">Start here.</Link></p>
                 </div>
              )}
            </div>
          </div>

          {/* Orders Link */}
          <Link to="/orders" className="flex items-end cursor-pointer hover:border hover:border-white p-2 rounded relative">
             <Package className="h-8 w-8" />
             <span className="font-bold text-sm leading-none mb-1 hidden md:block">Orders</span>
          </Link>
        </div>
      </nav>

      {/* Sub-Header / Categories Rail */}
      <div className="bg-[#232f3e] text-white text-sm flex items-center gap-4 px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-1 font-bold cursor-pointer">
          <Menu className="h-5 w-5" /> All
        </div>
        {['Fresh Arrivals', 'Books', 'Electronics', 'Stationery', 'Hostel Needs', 'Sports', 'Lab Coats'].map(cat => (
          <span key={cat} className="cursor-pointer hover:border hover:border-white px-2 py-1 rounded">{cat}</span>
        ))}
      </div>
      
      {/* Mobile Search Bar (visible only on small screens) */}
      <div className="sm:hidden bg-[#131921] p-3 pb-4 border-t border-gray-700">
          <div className="flex w-full h-10 rounded-md overflow-hidden bg-white">
            <input 
              type="text" 
              className="flex-1 px-3 text-black outline-none"
              placeholder="Search NSEC Cart..."
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