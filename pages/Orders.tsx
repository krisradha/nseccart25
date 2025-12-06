import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../services/firebase';
import { Order, COLLECTIONS } from '../types';
import { Loader2, Package, CheckCircle, XCircle, MessageCircle, Clock, Check, AlertTriangle } from 'lucide-react';

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-render every minute to update cancellation timer UI
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleAcceptOrder = async (order: Order) => {
      try {
          const batch = db.batch();
          
          // 1. Update Order Status
          const orderRef = db.collection(COLLECTIONS.ORDERS).doc(order.id);
          batch.update(orderRef, { 
              status: 'accepted',
              acceptedAt: Date.now() 
          });

          // 2. Update Product Status to Reserved (Sold Out in UI)
          const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(order.productId);
          batch.update(productRef, { status: 'reserved' });

          await batch.commit();
      } catch (e) {
          console.error("Error accepting order", e);
          alert("Failed to accept order");
      }
  };

  const handleRejectOrder = async (orderId: string) => {
      // Logic: Just mark order rejected. Product remains available.
      try {
          await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({ status: 'rejected' });
      } catch (e) {
          alert("Failed to reject");
      }
  };

  const handleBuyerCancel = async (order: Order) => {
      if (!window.confirm("Are you sure you want to cancel this order?")) return;
      try {
          const batch = db.batch();
          
          // 1. Update Order Status
          const orderRef = db.collection(COLLECTIONS.ORDERS).doc(order.id);
          batch.update(orderRef, { status: 'cancelled' });

          // 2. Release Product (Make Available again)
          const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(order.productId);
          batch.update(productRef, { status: 'available' });

          await batch.commit();
      } catch (e) {
          alert("Failed to cancel");
      }
  };

  const handleCompleteOrder = async (order: Order) => {
      if (!window.confirm("Have you received the item and paid the seller?")) return;
      try {
          const batch = db.batch();
          
          // 1. Update Order Status
          const orderRef = db.collection(COLLECTIONS.ORDERS).doc(order.id);
          batch.update(orderRef, { 
              status: 'completed',
              completedAt: Date.now()
          });

          // 2. Update Product Status to Sold (Permanently)
          const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(order.productId);
          batch.update(productRef, { status: 'sold' });

          await batch.commit();
      } catch (e) {
          alert("Failed to complete");
      }
  };

  const isCancellationAllowed = (order: Order) => {
      if (order.status !== 'accepted' || !order.acceptedAt) return false;
      const hoursDiff = (Date.now() - order.acceptedAt) / (1000 * 60 * 60);
      return hoursDiff < 3;
  };

  const getCancellationTimeLeft = (order: Order) => {
      if (!order.acceptedAt) return "";
      const deadline = order.acceptedAt + (3 * 60 * 60 * 1000);
      const diff = deadline - Date.now();
      if (diff <= 0) return "Time expired";
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)));
      return `${hours}h ${minutes}m left to decline`;
  };

  const renderStatus = (status: string) => {
      switch(status) {
          case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
          case 'accepted': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</span>;
          case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><Check className="w-3 h-3 mr-1"/> Paid & Received</span>;
          case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
          case 'cancelled': return <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full font-bold flex items-center"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>;
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
             <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4 relative">
                 {/* Image */}
                 <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 relative">
                     <img src={order.productImage} alt={order.productTitle} className="w-full h-full object-contain" />
                     {/* Overlay if cancelled/rejected */}
                     {(order.status === 'cancelled' || order.status === 'rejected') && (
                         <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                             <XCircle className="text-red-500 h-6 w-6" />
                         </div>
                     )}
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

                     {/* Cancellation Timer Message */}
                     {order.status === 'accepted' && activeTab === 'buying' && isCancellationAllowed(order) && (
                         <p className="text-xs text-orange-600 mt-2 flex items-center font-medium">
                             <Clock className="h-3 w-3 mr-1" />
                             You can decline this order: {getCancellationTimeLeft(order)}
                         </p>
                     )}

                     {/* Actions */}
                     <div className="mt-4 flex gap-3 flex-wrap">
                         
                         {/* SELLER ACTIONS */}
                         {activeTab === 'selling' && order.status === 'pending' && (
                             <>
                                <button 
                                    onClick={() => handleAcceptOrder(order)}
                                    className="bg-[#ffd814] text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#f7ca00]"
                                >
                                    Accept Order (Mark Sold Out)
                                </button>
                                <button 
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-300"
                                >
                                    Reject
                                </button>
                             </>
                         )}

                         {activeTab === 'selling' && order.status === 'accepted' && (
                             <p className="text-xs text-blue-600 font-medium border border-blue-200 bg-blue-50 px-3 py-1 rounded">
                                 Wait for buyer to confirm receipt. Item marked as 'Reserved'.
                             </p>
                         )}

                         {/* BUYER ACTIONS */}
                         {activeTab === 'buying' && order.status === 'accepted' && (
                             <>
                                <button 
                                    onClick={() => handleCompleteOrder(order)}
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

                                {isCancellationAllowed(order) && (
                                    <button 
                                        onClick={() => handleBuyerCancel(order)}
                                        className="bg-white border border-red-300 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-50 flex items-center"
                                    >
                                        <XCircle className="h-3 w-3 mr-1" /> Decline Order
                                    </button>
                                )}
                             </>
                         )}

                         {order.status === 'completed' && (
                             <span className="text-xs text-gray-500 italic">Transaction closed successfully.</span>
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