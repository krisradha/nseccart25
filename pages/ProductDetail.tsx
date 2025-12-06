import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Loader2, MessageCircle, ArrowLeft, ShieldCheck, MapPin } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        const docSnap = await getDoc(docRef);
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

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!product) return <div className="text-center mt-20">Product not found.</div>;

  const savings = product.condition === 'used' && product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
  const discountPercentage = product.condition === 'used' && product.originalPrice
    ? Math.round((savings / product.originalPrice) * 100)
    : 0;

  const whatsappMessage = encodeURIComponent(
    `Hi ${product.sellerName}, I am interested in buying your item "${product.title}" listed on NSE Cart for ₹${product.price}. Is it still available?`
  );
  
  const whatsappUrl = `https://wa.me/${product.sellerWhatsapp.replace(/\D/g,'')}?text=${whatsappMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image Gallery */}
        <div className="flex flex-col">
          <div className="w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden sm:aspect-w-4 sm:aspect-h-3">
             {product.imageUrl ? (
               <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain object-center" />
             ) : (
               <div className="flex items-center justify-center h-96 text-gray-400">No Image Available</div>
             )}
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <div className="mb-4">
             {product.condition === 'used' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Used Condition
                </span>
             ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Brand New
                </span>
             )}
             <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
               {product.category}
             </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.title}</h1>

          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <div className="flex items-end">
               <p className="text-3xl text-gray-900 font-bold">₹{product.price}</p>
               {product.condition === 'used' && product.originalPrice && (
                 <div className="ml-4 pb-1">
                   <p className="text-lg text-gray-500 line-through">₹{product.originalPrice}</p>
                 </div>
               )}
            </div>
            {product.condition === 'used' && discountPercentage > 0 && (
              <p className="mt-1 text-sm text-green-600 font-semibold">
                Save ₹{savings} ({discountPercentage}% off market price)
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-4 whitespace-pre-line">
              {product.description}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
             <h3 className="text-sm font-medium text-gray-900">Seller Information</h3>
             <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                   {product.sellerName.charAt(0)}
                </div>
                <div className="ml-3">
                   <div className="text-sm font-medium text-gray-900">{product.sellerName}</div>
                   <div className="flex items-center text-xs text-gray-500">
                     <ShieldCheck className="h-3 w-3 mr-1 text-green-500" /> Verified Student
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg shadow-md transition-all"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Buy on WhatsApp
            </a>
            <p className="text-center text-xs text-gray-500">
              Transactions happen offline. Meet on campus to exchange items safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
