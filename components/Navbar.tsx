import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../services/firebase';
import { LogOut, PlusCircle, ShoppingBag, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User;
  profile: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ user, profile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">NSE Cart</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/sell"
              className="hidden sm:flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Sell Item
            </Link>

            {/* Mobile Sell Icon */}
            <Link to="/sell" className="sm:hidden p-2 text-blue-600">
               <PlusCircle className="h-6 w-6" />
            </Link>

            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                 {user.photoURL ? (
                    <img className="h-8 w-8 rounded-full border border-gray-200" src={user.photoURL} alt="" />
                 ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserIcon className="h-5 w-5" />
                    </div>
                 )}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Signed in as<br/>
                  <span className="font-semibold text-gray-900 truncate block">{profile.displayName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;