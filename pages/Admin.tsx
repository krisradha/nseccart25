import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { COLLECTIONS, Product, UserProfile } from '../types';
import { Trash2, Shield, Users, ShoppingBag } from 'lucide-react';

const Admin: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [view, setView] = useState<'items' | 'users'>('items');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
      setLoading(true);
      try {
          // Fetch Items
          const prodSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
          const prodList: Product[] = [];
          prodSnap.forEach(d => prodList.push({ id: d.id, ...d.data() } as Product));
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteItem = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this listing?")) return;
      try {
          await db.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
          setItems(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Failed to delete");
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8 text-blue-900" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setView('items')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${view === 'items' ? 'bg-blue-900 text-white' : 'bg-white'}`}
                >
                    <ShoppingBag className="h-4 w-4" /> Listings ({items.length})
                </button>
                <button 
                  onClick={() => setView('users')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${view === 'users' ? 'bg-blue-900 text-white' : 'bg-white'}`}
                >
                    <Users className="h-4 w-4" /> Users ({users.length})
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {view === 'items' ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded object-cover" src={item.imageUrl} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                                <div className="text-sm text-gray-500">{item.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.sellerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.isFree ? 'Free' : `₹${item.price}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                                        <div className="text-sm text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.collegeYear}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.roleIntent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    </div>
  );
};

export default Admin;