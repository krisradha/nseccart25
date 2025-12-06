import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as firestore from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Loader2, MessageCircle, ArrowLeft, ShieldCheck, MapPin, Share2, Star, Lock } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = firestore.doc(db, COLLECTIONS.PRODUCTS, id);
        const docSnap = await firestore.getDoc(docRef);
        if (docSnap.exists()) {
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

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-gray-800" /></div>;
  if (!product) return <div className="text-center mt-20">Product not found.</div>;

  const savings = product.condition === 'used' && product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
  const discountPercentage = product.condition === 'used' && product.originalPrice
    ? Math.round((savings / product.originalPrice) * 100)
    : 0;

  const whatsappMessage = encodeURIComponent(
    `Hi ${product.sellerName}, I found your item "${product.title}" on NSE Cart for ₹${product.price}. Is it still available?`
  );
  
  const whatsappUrl = `https://wa.me/${product.sellerWhatsapp.replace(/\D/g,'')}?text=${whatsappMessage}`;

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
             {/* Main Image Area */}
             <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-white relative group min-h-[400px]">
                <div className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="max-h-[400px] object-contain" />
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}
             </div>
          </div>

          {/* Middle Column: Details (4 cols) */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            <h1 className="text-2xl font-medium text-gray-900 leading-tight">{product.title}</h1>
            
            <div className="flex items-center mt-1 space-x-2">
               <div className="flex text-[#F7CA00]">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 text-gray-300" />
               </div>
               <span className="text-sm text-blue-600 hover:underline cursor-pointer">12 ratings</span>
            </div>

            <div className="border-t border-b border-gray-100 py-3 my-3">
              <div className="flex items-baseline">
                <span className="text-sm text-gray-500 mr-2">Price:</span>
                <span className="text-2xl font-medium text-[#B12704]">₹{product.price}</span>
              </div>
              
              {product.condition === 'used' && product.originalPrice && (
                <div className="mt-1">
                  <span className="text-sm text-gray-500 mr-2">M.R.P.:</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                  <span className="text-sm text-[#B12704] ml-2">You Save: ₹{savings} ({discountPercentage}%)</span>
                </div>
              )}
              
              <div className="mt-1 text-sm text-gray-600">
                Inclusive of all taxes
              </div>
            </div>

            {/* Features / Details */}
            <div className="mt-4">
               <h3 className="font-bold text-sm mb-2">About this item</h3>
               <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                 <li><span className="font-bold">Condition:</span> {product.condition === 'new' ? 'Brand New' : 'Used - Good Condition'}</li>
                 <li><span className="font-bold">Category:</span> {product.category}</li>
                 <li><span className="font-bold">Seller Description:</span> {product.description}</li>
               </ul>
            </div>
          </div>

          {/* Right Column: Buy Box (3 cols) */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
             <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                <div className="text-xl font-medium text-[#B12704] mb-2">₹{product.price}</div>
                
                <div className="text-sm text-[#007600] font-medium mb-4">
                  In stock.
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                   Sold by <span className="text-blue-600">{product.sellerName}</span> and Fulfilled locally on campus.
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2 text-sm font-medium shadow-sm mb-3"
                >
                  Buy Now (WhatsApp)
                </a>

                <button className="w-full block text-center bg-[#FFA41C] hover:bg-[#FA8900] border border-[#FF8F00] rounded-full py-2 text-sm font-medium shadow-sm mb-4">
                  Make an Offer
                </button>

                <div className="flex items-start text-xs text-gray-500 mt-4">
                   <Lock className="h-3 w-3 mr-1 mt-0.5" />
                   <span>Secure transaction. Payment happens offline directly between students.</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs text-gray-500">Seller Contact</span>
                     <span className="text-xs text-blue-600">+91 {product.sellerWhatsapp.slice(0,2)}*****</span>
                   </div>
                   <div className="flex items-center text-xs text-green-700">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;