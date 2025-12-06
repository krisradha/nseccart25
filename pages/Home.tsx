import React, { useEffect, useState } from 'react';
import * as firestore from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, MessageCircle, Star, ShieldCheck } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = firestore.query(firestore.collection(db, COLLECTIONS.PRODUCTS), firestore.orderBy('createdAt', 'desc'));
        const querySnapshot = await firestore.getDocs(q);
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      
      {/* Hero Banner Section (Carousel Style) */}
      <div className="relative max-w-[1500px] mx-auto">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 h-[180px] sm:h-[260px] w-full relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 text-white">
             <h1 className="text-2xl sm:text-4xl font-bold mb-2">Campus Marketplace</h1>
             <p className="text-sm sm:text-lg opacity-90 max-w-lg">Buy and sell books, drafters, and gadgets within the college. Safe, fast, and easy.</p>
             <Link to="/sell" className="mt-4 bg-[#febd69] text-gray-900 px-6 py-2 rounded-md font-bold w-fit hover:bg-[#f3a847] shadow-lg">
                Start Selling
             </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 h-full w-1/2 bg-white/5 skew-x-12 transform origin-bottom-left"></div>
        </div>
        {/* Gradient overlay to fade into content */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-100 to-transparent"></div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 -mt-10 sm:-mt-16 relative z-10">
        
        {/* Category Rail (Blinkit Style) */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6">
           {[
             { name: 'Books', img: 'https://cdn-icons-png.flaticon.com/512/3330/3330314.png' },
             { name: 'Electronics', img: 'https://cdn-icons-png.flaticon.com/512/2956/2956799.png' },
             { name: 'Stationery', img: 'https://cdn-icons-png.flaticon.com/512/2892/2892735.png' },
             { name: 'Sports', img: 'https://cdn-icons-png.flaticon.com/512/2921/2921932.png' },
             { name: 'Fashion', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png' },
           ].map(cat => (
             <div key={cat.name} className="flex-shrink-0 flex flex-col items-center cursor-pointer bg-white p-3 rounded-xl shadow-sm min-w-[100px] hover:shadow-md transition-all">
                <img src={cat.img} alt={cat.name} className="h-10 w-10 sm:h-12 sm:w-12 mb-2 object-contain" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">{cat.name}</span>
             </div>
           ))}
        </div>

        {/* Product Grid */}
        <div className="bg-white p-4 sm:p-6 shadow-sm">
           <h2 className="text-xl font-bold mb-4">Fresh Arrivals</h2>
           
           {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found.</p>
              <Link to="/sell" className="mt-2 inline-block text-blue-600 hover:underline">List an item</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow rounded-lg p-2 bg-white">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gray-50 mb-2 rounded-md overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                    
                    {/* Badge */}
                    {product.condition === 'used' ? (
                       <span className="absolute top-1 left-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200">
                         USED
                       </span>
                    ) : (
                       <span className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                         NEW
                       </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col text-left">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-[#C7511F] transition-colors mb-1">
                      {product.title}
                    </h3>
                    
                    {/* Mock Rating */}
                    <div className="flex items-center mb-1">
                      <div className="flex text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                      <span className="text-[10px] text-blue-600 ml-1">12</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs align-top">₹</span>
                        <span className="text-xl font-bold text-gray-900">{product.price}</span>
                        {product.condition === 'used' && product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      {product.condition === 'used' && product.originalPrice && (
                         <div className="text-[10px] text-green-700 font-medium">
                           Save ₹{product.originalPrice - product.price}
                         </div>
                      )}

                      <div className="text-[10px] text-gray-500 mt-1 flex items-center">
                        Free delivery by <span className="font-bold text-gray-700 ml-1">{product.sellerName.split(' ')[0]}</span>
                      </div>
                    </div>

                    <button className="mt-2 w-full bg-[#ffd814] border border-[#fcd200] rounded-full py-1.5 text-xs font-medium hover:bg-[#f7ca00] shadow-sm">
                       Chat to Buy
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;