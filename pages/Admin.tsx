import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { COLLECTIONS, Product, UserProfile } from '../types';
import { Trash2, Shield, Users, ShoppingBag, Lock, Key, Loader2, LogOut } from 'lucide-react';

// Admin Credentials Configuration
const ADMIN_EMAIL = "talkwithpritamdas@gmail.com";
const ADMIN_PASS = "RAYGTFcHareKrishan jyTDCf25DHE";

const Admin: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [view, setView] = useState<'items' | 'users'>('items');
  const [loading, setLoading] = useState(false);
  
  // Security States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const currentUser = auth.currentUser;

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === ADMIN_PASS) {
          setIsAuthorized(true);
          fetchData();
      } else {
          setAuthError('Incorrect Admin Password');
      }
  };

  const fetchData = async () => {
      setLoading(true);
      try {
          // Fetch Items
          const prodSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
          const prodList: Product[] = [];
          prodSnap.forEach(d => prodList.push({ id: d.id, ...d.data() } as Product));
          // Sort items by newest first
          prodList.sort((a, b) => b.createdAt - a.createdAt);
          setItems(prodList);

          // Fetch Users
          const userSnap = await db.collection(COLLECTIONS.USERS).get();
          const userList: UserProfile[] = [];
          userSnap.forEach(d => userList.push({ id: d.id, ...d.data() } as unknown as UserProfile));
          setUsers(userList);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteItem = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
      try {
          await db.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
          setItems(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Failed to delete item.");
      }
  };

  // 1. Access Denied (Wrong Email)
  if (currentUser?.email !== ADMIN_EMAIL) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col p-4">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full border border-gray-200">
                <div className="mx-auto bg-red-50 p-4 rounded-full w-fit mb-4">
                     <Shield className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                <p className="text-gray-500 mb-6 text-sm">This dashboard is strictly accessible only to the site administrator.</p>
                <div className="bg-gray-50 p-3 rounded text-xs text-left border border-gray-100">
                    <p className="font-bold text-gray-700">Current Session:</p>
                    <p className="text-gray-600 truncate">{currentUser?.email || 'Guest User'}</p>
                </div>
              </div>
          </div>
      );
  }

  // 2. Password Prompt (Correct Email, Not yet entered password)
  if (!isAuthorized) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full border border-gray-200">
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-blue-50 rounded-full border border-blue-100">
                          <Lock className="h-8 w-8 text-blue-900" />
                      </div>
                  </div>
                  <h2 className="text-center text-2xl font-bold mb-2 text-gray-900">Admin Login</h2>
                  <p className="text-center text-xs text-gray-500 mb-6">Secure Gateway for NSEC Cart Management</p>
                  
                  <form onSubmit={handleLogin}>
                      <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">Security Code</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                placeholder="Enter admin password"
                                autoFocus
                            />
                          </div>
                      </div>
                      {authError && (
                          <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-4 text-center border border-red-100 font-medium">
                              {authError}
                          </div>
                      )}
                      <button type="submit" className="w-full bg-[#232F3E] text-white py-2.5 rounded-md font-bold hover:bg-[#37475A] transition shadow-md transform active:scale-95 text-sm">
                          Access Dashboard
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // 3. Dashboard (Authorized)
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-900 p-2 rounded text-white">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Admin Panel</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage listings and users</p>
                    </div>
                </div>
                <button onClick={() => setIsAuthorized(false)} className="text-sm text-red-600 hover:text-red-800 flex items-center font-medium bg-red-50 px-3 py-1 rounded-full">
                    <LogOut className="h-4 w-4 mr-1" /> Lock Dashboard
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setView('items')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm ${view === 'items' ? 'bg-[#232F3E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    <ShoppingBag className="h-4 w-4" /> Listings ({items.length})
                </button>
                <button 
                  onClick={() => setView('users')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm ${view === 'users' ? 'bg-[#232F3E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    <Users className="h-4 w-4" /> Users ({users.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-900" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {view === 'items' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                        <img className="h-10 w-10 object-contain" src={item.imageUrl} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{item.title}</div>
                                                        <div className="text-xs text-gray-500">{item.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.sellerName}</div>
                                                <div className="text-xs text-gray-500">{item.sellerWhatsapp}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.isFree ? (
                                                    <span className="text-green-600">Free</span>
                                                ) : (
                                                    `₹${item.price}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.condition === 'new' ? 'New' : 'Used'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)} 
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
                                                    title="Delete Listing"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                                No listings found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Year & Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(u => (
                                        <tr key={u.uid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{u.collegeYear}</div>
                                                <div className="text-xs text-gray-500">{u.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 border border-gray-200">
                                                    {u.roleIntent}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {u.phoneNumber}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default Admin;