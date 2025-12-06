import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { COLLECTIONS, Product, UserProfile, Order } from '../types';
import { Trash2, Shield, Users, ShoppingBag, Lock, Key, Loader2, LogOut, AlertCircle, BarChart3, CheckCircle } from 'lucide-react';

// Admin Credentials Configuration
const ADMIN_EMAIL = "talkwithpritamdas@gmail.com";
const ADMIN_PASS = "RAYGTFcHareKrishan jyTDCf25DHE";

const Admin: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'items' | 'users'>('items');
  const [loading, setLoading] = useState(false);
  
  // Security States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const currentUser = auth.currentUser;

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput.trim() === ADMIN_PASS) {
          setIsAuthorized(true);
          setAuthError('');
          fetchData();
      } else {
          setAuthError('Access Denied: Invalid Security Code');
      }
  };

  const fetchData = async () => {
      setLoading(true);
      try {
          // Fetch Items
          const prodSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
          const prodList: Product[] = [];
          prodSnap.forEach(d => prodList.push({ id: d.id, ...d.data() } as Product));
          prodList.sort((a, b) => b.createdAt - a.createdAt);
          setItems(prodList);

          // Fetch Users
          const userSnap = await db.collection(COLLECTIONS.USERS).get();
          const userList: UserProfile[] = [];
          userSnap.forEach(d => userList.push({ id: d.id, ...d.data() } as unknown as UserProfile));
          setUsers(userList);

          // Fetch Orders (For Stats)
          const orderSnap = await db.collection(COLLECTIONS.ORDERS).get();
          const orderList: Order[] = [];
          orderSnap.forEach(d => orderList.push({ id: d.id, ...d.data() } as Order));
          setOrders(orderList);

      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteItem = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this listing?")) return;
      try {
          await db.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
          setItems(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Failed to delete item.");
      }
  };

  // Stats
  const successfulOrdersCount = orders.filter(o => o.status === 'completed').length;
  const activeOrdersCount = orders.filter(o => o.status === 'accepted').length;

  if (!currentUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white p-6 rounded shadow text-center">
                  <p className="text-red-600 font-bold">Please Log In First</p>
                  <p className="text-sm text-gray-500 mt-2">You need to be signed in to access the admin panel.</p>
              </div>
          </div>
      );
  }

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
                  
                  {currentUser.email !== ADMIN_EMAIL && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mb-4 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <p className="text-xs text-yellow-700">
                              You are logged in as <strong>{currentUser.email}</strong>. 
                          </p>
                      </div>
                  )}

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
                                placeholder="Enter admin pass phrase"
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-900 p-2 rounded text-white">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Admin Panel</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage listings and verification</p>
                    </div>
                </div>
                <button onClick={() => setIsAuthorized(false)} className="text-sm text-red-600 hover:text-red-800 flex items-center font-medium bg-red-50 px-3 py-1 rounded-full">
                    <LogOut className="h-4 w-4 mr-1" /> Lock Dashboard
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Successful Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{successfulOrdersCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Active Listings</p>
                        <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Registered Users</p>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setView('items')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm ${view === 'items' ? 'bg-[#232F3E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    <ShoppingBag className="h-4 w-4" /> Listings
                </button>
                <button 
                  onClick={() => setView('users')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm ${view === 'users' ? 'bg-[#232F3E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    <Users className="h-4 w-4" /> Users
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.status === 'reserved' || item.status === 'sold' ? (
                                                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Sold Out
                                                     </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)} 
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Card</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(u => (
                                        <tr key={u.uid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                                                <div className="text-xs text-gray-500">{u.collegeYear}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded inline-block">
                                                    ID: {u.studentId || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {u.phoneNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {u.idCardUrl ? (
                                                    <a href={u.idCardUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">View ID</a>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Upload</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
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