import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { Product, COLLECTIONS, Order } from '../types';
import { User } from 'firebase/auth';
import { Loader2, ShieldCheck, Share2, Star, Lock, AlertTriangle } from 'lucide-react';

interface ProductDetailProps {
  user: User | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!user || !product) return;
    
    setOrdering(true);
    try {
        const newOrder: Omit<Order, 'id'> = {
            productId: product.id,
            productTitle: product.title,
            productImage: product.imageUrl,
            productPrice: product.price,
            buyerId: user.uid,
            buyerName: user.displayName || 'Student',
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            sellerWhatsapp: product.sellerWhatsapp,
            status: 'pending',
            createdAt: Date.now()
        };

        await db.collection(COLLECTIONS.ORDERS).add(newOrder);
        navigate('/orders');
    } catch (e) {
        console.error("Order failed", e);
        alert("Could not place order. Try again.");
    } finally {
        setOrdering(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-gray-800" /></div>;
  if (!product) return <div className="text-center mt-20">Product not found.</div>;

  const isSoldOut = product.status === 'reserved' || product.status === 'sold';
  
  const savings = product.condition === 'used' && product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
  const discountPercentage = product.condition === 'used' && product.originalPrice
    ? Math.round((savings / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Breadcrumb-ish */}
      <div className="bg-[#fafafa] border-b px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:underline">Home</Link> &rsaquo; 
        <span className="hover:underline">{product.category}</span> &rsaquo; 
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          
          {/* Left Column: Image (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-white relative group min-h-[400px]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className={`max-h-[400px] object-contain ${isSoldOut ? 'grayscale opacity-60' : ''}`} />
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}
                {isSoldOut && (
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                         <span className="bg-red-600 text-white text-2xl font-bold px-6 py-2 rounded shadow-xl -rotate-12 border-4 border-white">
                             SOLD OUT
                         </span>
                     </div>
                )}
             </div>
          </div>

          {/* Middle Column: Details (4 cols) */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            <h1 className="text-2xl font-medium text-gray-900 leading-tight">{product.title}</h1>
            
            <div className="border-t border-b border-gray-100 py-3 my-3">
              <div className="flex items-baseline">
                <span className="text-sm text-gray-500 mr-2">Price:</span>
                <span className="text-2xl font-medium text-[#B12704]">
                    {product.isFree ? 'FREE' : `₹${product.price}`}
                </span>
              </div>
              
              {!product.isFree && product.condition === 'used' && product.originalPrice && (
                <div className="mt-1">
                  <span className="text-sm text-gray-500 mr-2">M.R.P.:</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                  <span className="text-sm text-[#B12704] ml-2">You Save: ₹{savings} ({discountPercentage}%)</span>
                </div>
              )}
            </div>

            <div className="mt-4">
               <h3 className="font-bold text-sm mb-2">About this item</h3>
               <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                 <li><span className="font-bold">Condition:</span> {product.condition === 'new' ? 'Brand New' : 'Used - Good Condition'}</li>
                 <li><span className="font-bold">Category:</span> {product.category}</li>
                 <li><span className="font-bold">Description:</span> {product.description}</li>
               </ul>
            </div>
          </div>

          {/* Right Column: Buy Box (3 cols) */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
             <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                <div className="text-xl font-medium text-[#B12704] mb-2">
                    {product.isFree ? 'FREE' : `₹${product.price}`}
                </div>
                
                {isSoldOut ? (
                    <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-md flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-sm text-red-800 font-medium">Currently Unavailable. This item has been reserved or sold.</span>
                    </div>
                ) : (
                    <div className="text-sm text-[#007600] font-medium mb-4">
                        Available in College Campus.
                    </div>
                )}
                
                <div className="text-sm text-gray-600 mb-4">
                   Sold by <span className="text-blue-600">{product.sellerName}</span>.
                </div>

                {!isSoldOut && (
                    <>
                        {user ? (
                        user.uid === product.sellerId ? (
                            <button className="w-full block text-center bg-gray-200 border border-gray-300 rounded-full py-2 text-sm font-medium shadow-sm mb-3 cursor-not-allowed">
                                This is your item
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={ordering}
                                className="w-full block text-center bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2 text-sm font-medium shadow-sm mb-3"
                            >
                                {ordering ? 'Processing...' : 'Place Order'}
                            </button>
                        )
                        ) : (
                        <Link
                            to="/login"
                            className="w-full block text-center bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2 text-sm font-medium shadow-sm mb-3"
                        >
                            Login to Buy
                        </Link>
                        )}
                    </>
                )}

                <div className="flex items-start text-xs text-gray-500 mt-4">
                   <Lock className="h-3 w-3 mr-1 mt-0.5" />
                   <span>Secure transaction. Payment happens offline.</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;