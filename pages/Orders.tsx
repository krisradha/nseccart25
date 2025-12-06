import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../services/firebase';
import { Order, COLLECTIONS } from '../types';
import { Loader2, Package, CheckCircle, XCircle, MessageCircle, Clock, Check } from 'lucide-react';

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener for Buying
    const qBuy = db.collection(COLLECTIONS.ORDERS).where("buyerId", "==", user.uid);
    const unsubBuy = qBuy.onSnapshot((snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() } as Order));
        // Sort by date desc
        orders.sort((a,b) => b.createdAt - a.createdAt);
        setBuyOrders(orders);
    });

    // Listener for Selling
    const qSell = db.collection(COLLECTIONS.ORDERS).where("sellerId", "==", user.uid);
    const unsubSell = qSell.onSnapshot((snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() } as Order));
        orders.sort((a,b) => b.createdAt - a.createdAt);
        setSellOrders(orders);
        setLoading(false);
    });

    return () => {
        unsubBuy();
        unsubSell();
    };
  }, [user]);

  const updateStatus = async (orderId: string, status: Order['status']) => {
      try {
          await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({ status });
      } catch (e) {
          console.error("Error updating status", e);
          alert("Failed to update status");
      }
  };

  const renderStatus = (status: string) => {
      switch(status) {
          case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
          case 'accepted': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</span>;
          case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><Check className="w-3 h-3 mr-1"/> Paid & Received</span>;
          case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
          default: return null;
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      
      <div className="flex border-b mb-6">
          <button 
            className={`px-6 py-2 font-medium text-sm ${activeTab === 'buying' ? 'border-b-2 border-[#febd69] text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('buying')}
          >
              Buying ({buyOrders.length})
          </button>
          <button 
            className={`px-6 py-2 font-medium text-sm ${activeTab === 'selling' ? 'border-b-2 border-[#febd69] text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('selling')}
          >
              Selling ({sellOrders.length})
          </button>
      </div>

      {loading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}

      <div className="space-y-4">
         {(activeTab === 'buying' ? buyOrders : sellOrders).map(order => (
             <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                 {/* Image */}
                 <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0">
                     <img src={order.productImage} alt={order.productTitle} className="w-full h-full object-contain" />
                 </div>

                 {/* Details */}
                 <div className="flex-grow">
                     <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900">{order.productTitle}</h3>
                            <p className="text-sm text-gray-500">Order ID: #{order.id.slice(0,6)}</p>
                        </div>
                        {renderStatus(order.status)}
                     </div>
                     
                     <div className="mt-2 text-sm">
                         {activeTab === 'buying' ? (
                             <p>Sold by: <span className="font-bold">{order.sellerName}</span></p>
                         ) : (
                             <p>Buyer: <span className="font-bold">{order.buyerName}</span></p>
                         )}
                         <p className="font-bold text-[#B12704] mt-1">Amount: {order.productPrice === 0 ? 'FREE' : `₹${order.productPrice}`}</p>
                     </div>

                     {/* Actions */}
                     <div className="mt-4 flex gap-3">
                         {activeTab === 'selling' && order.status === 'pending' && (
                             <>
                                <button 
                                    onClick={() => updateStatus(order.id, 'accepted')}
                                    className="bg-[#ffd814] text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#f7ca00]"
                                >
                                    Accept Order
                                </button>
                                <button 
                                    onClick={() => updateStatus(order.id, 'rejected')}
                                    className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-300"
                                >
                                    Reject
                                </button>
                             </>
                         )}

                         {activeTab === 'selling' && order.status === 'accepted' && (
                             <p className="text-xs text-blue-600 font-medium">Waiting for buyer to confirm receipt.</p>
                         )}

                         {activeTab === 'buying' && order.status === 'accepted' && (
                             <>
                                <button 
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-700"
                                >
                                    Mark Received & Paid
                                </button>
                                <a 
                                    href={`https://wa.me/${order.sellerWhatsapp.replace(/\D/g,'')}?text=Hi, I placed an order for ${order.productTitle}. When can we meet?`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#25D366] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#128C7E] flex items-center"
                                >
                                    <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp Seller
                                </a>
                             </>
                         )}

                         {order.status === 'completed' && (
                             <span className="text-xs text-gray-500 italic">Transaction closed.</span>
                         )}
                     </div>
                 </div>
             </div>
         ))}

         {(activeTab === 'buying' ? buyOrders : sellOrders).length === 0 && (
             <div className="text-center py-12 text-gray-500">
                 <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                 <p>No orders found.</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default Orders;