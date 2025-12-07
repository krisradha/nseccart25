import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Search, Wallet, Archive } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

const ProductCard: React.FC<{ product: Product, isSold?: boolean }> = ({ product, isSold }) => (
  <Link 
    to={`/product/${product.id}`} 
    className={`group flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isSold ? 'opacity-75 grayscale' : ''}`}
  >
    {/* Image Container */}
    <div className="relative aspect-[4/3] bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {product.imageUrl ? (
          <img
              src={product.imageUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-gray-400 text-xs">No Image</span>
        )}
        
        {/* Status Badges */}
        {isSold ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg transform -rotate-6 tracking-wider border-2 border-white">
                    SOLD OUT
                </span>
            </div>
        ) : (
          product.condition === 'used' && (
            <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-red-200">
                USED
            </span>
          )
        )}
        
        {product.isFree && !isSold && (
           <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-green-200">
               FREE
           </span>
        )}
    </div>
    
    {/* Content */}
    <div className="flex-1 flex flex-col p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#C7511F] transition-colors mb-2 h-10">
          {product.title}
        </h3>
        
        <div className="mt-auto pt-2 border-t border-dashed border-gray-100">
          <div className="flex items-baseline gap-1">
              <span className="text-xs align-top text-gray-500">₹</span>
              <span className={`text-xl font-bold ${product.isFree ? 'text-green-600' : 'text-gray-900'}`}>
                {product.isFree ? 'FREE' : product.price}
              </span>
              {product.condition === 'used' && product.originalPrice && !product.isFree && (
                <span className="text-xs text-gray-400 line-through ml-1">₹{product.originalPrice}</span>
              )}
          </div>
          {!isSold && (
             <div className="mt-2 text-[10px] text-gray-500 flex justify-between items-center">
               <span>{product.category}</span>
               <span className="text-blue-600 truncate max-w-[80px]">{product.sellerName.split(' ')[0]}</span>
             </div>
          )}
        </div>
    </div>
  </Link>
);

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = db.collection(COLLECTIONS.PRODUCTS);
        const querySnapshot = await q.get();
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        fetchedProducts.sort((a, b) => b.createdAt - a.createdAt);
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

  // Split into Active and Sold
  const activeProducts = filteredProducts.filter(p => p.status !== 'reserved' && p.status !== 'sold');
  const soldProducts = filteredProducts.filter(p => p.status === 'reserved' || p.status === 'sold');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#febd69]" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16 font-sans">
      
      {/* Hero Banner Section */}
      <div className="relative max-w-[1600px] mx-auto mb-8 animate-fade-in">
        <div className="bg-gradient-to-r from-[#1a2530] to-[#2c3e50] h-[220px] sm:h-[320px] w-full relative overflow-hidden shadow-md">
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 text-white z-10">
             <div className="animate-slide-up">
               <span className="inline-block px-3 py-1 bg-[#febd69] text-gray-900 text-xs font-bold rounded-full mb-3 shadow-sm">
                 NSEC Exclusive
               </span>
               <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-tight">
                 Semester Start <span className="text-[#febd69]">Sale</span>
               </h1>
               <p className="text-lg sm:text-xl text-gray-200 max-w-lg mb-6 font-light">
                 Save up to 60% on pre-loved engineering books, drafters, and hostel essentials.
               </p>
               <Link 
                 to="/sell" 
                 className="inline-flex items-center gap-2 bg-[#febd69] text-gray-900 px-6 py-3 rounded-md font-bold hover:bg-[#f3a847] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
               >
                  <Wallet className="h-4 w-4" /> Start Selling
               </Link>
             </div>
          </div>
          {/* Abstract Shapes */}
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-40 w-32 h-32 bg-[#febd69] opacity-10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-20 -mt-10">
        
        {/* HOW IT WORKS SECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-100 animate-slide-up delay-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center tracking-wide uppercase text-xs text-gray-500">
            — Simple Process —
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent transform -translate-x-1/2"></div>

            {/* Buying Process */}
            <div>
               <h3 className="font-bold text-lg text-[#232F3E] mb-5 flex items-center justify-center md:justify-start">
                 <div className="bg-blue-50 p-2 rounded-lg mr-3">
                    <Search className="h-5 w-5 text-blue-600" />
                 </div>
                 For Buyers
               </h3>
               <div className="space-y-6 pl-2">
                  {[
                    { title: "Place Order", desc: "Click 'Place Order' to express interest. No payment yet." },
                    { title: "Wait for Accept", desc: "Seller accepts your request & reserves the item." },
                    { title: "Meet & Pay", desc: "Meet on campus, verify item, and pay cash/UPI." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex-shrink-0 bg-white border-2 border-blue-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">{step.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Selling Process */}
            <div>
               <h3 className="font-bold text-lg text-[#232F3E] mb-5 flex items-center justify-center md:justify-start">
                 <div className="bg-green-50 p-2 rounded-lg mr-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                 </div>
                 For Sellers
               </h3>
               <div className="space-y-6 pl-2">
                  {[
                    { title: "List Item", desc: "Upload details in 30 seconds. It's free." },
                    { title: "Accept Order", desc: "Check 'My Orders' and Accept to reserve for a buyer." },
                    { title: "Exchange", desc: "Coordinate via WhatsApp, hand over item, get paid." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex-shrink-0 bg-white border-2 border-green-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-green-600 text-sm group-hover:border-green-500 group-hover:bg-green-50 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 group-hover:text-green-700 transition-colors">{step.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
        
        {/* Category Rail */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mb-4 px-1">
           {[
             { name: 'Books', img: 'https://cdn-icons-png.flaticon.com/512/3330/3330314.png', color: 'bg-blue-50' },
             { name: 'Calculators', img: 'https://cdn-icons-png.flaticon.com/512/2956/2956799.png', color: 'bg-orange-50' },
             { name: 'Lab Coats', img: 'https://cdn-icons-png.flaticon.com/512/2038/2038020.png', color: 'bg-purple-50' },
             { name: 'Drafters', img: 'https://cdn-icons-png.flaticon.com/512/2892/2892735.png', color: 'bg-yellow-50' },
             { name: 'Sports', img: 'https://cdn-icons-png.flaticon.com/512/2921/2921932.png', color: 'bg-green-50' },
           ].map(cat => (
             <div key={cat.name} className={`flex-shrink-0 flex flex-col items-center justify-center cursor-pointer ${cat.color} p-4 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-md transition-all min-w-[110px] h-[110px] group`}>
                <img src={cat.img} alt={cat.name} className="h-10 w-10 mb-2 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700">{cat.name}</span>
             </div>
           ))}
        </div>

        {/* ACTIVE LISTINGS SECTION */}
        <div className="mb-12">
           <div className="flex justify-between items-end mb-6 px-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fresh Arrivals</h2>
                <p className="text-sm text-gray-500 mt-1">Available items ready for pickup</p>
              </div>
           </div>
           
           {activeProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="h-8 w-8 text-[#febd69]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No active items found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Be the first to list a book, calculator, or lab coat for the semester.</p>
              <Link to="/sell" className="inline-flex items-center gap-2 bg-[#ffd814] px-6 py-2.5 rounded-full font-bold text-gray-900 border border-[#fcd200] hover:bg-[#f7ca00] transition-colors">
                List an Item Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {activeProducts.map((product) => (
                 <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* SOLD / RESERVED SECTION */}
        {soldProducts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-6 px-1 opacity-70">
                    <Archive className="h-6 w-6 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-700">Recently Sold / Reserved</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {soldProducts.map((product) => (
                        <ProductCard key={product.id} product={product} isSold={true} />
                    ))}
                </div>
            </div>
        )}

        {/* Principal Message / Trust Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">From the Principal's Desk</h3>
            <p className="text-gray-600 max-w-2xl mx-auto italic mb-6 text-lg">
                "Initiatives like NSEC Cart foster a sense of community and responsibility. By reusing academic resources, we not only help juniors financially but also contribute to a greener, more sustainable campus environment."
            </p>
            <div className="flex items-center justify-center gap-4">
                 <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden">
                     {/* Placeholder for Principal Photo if needed */}
                     <span className="h-full w-full flex items-center justify-center text-gray-400 font-bold">P</span>
                 </div>
                 <div className="text-left">
                     <p className="font-bold text-sm text-gray-900">Prof. (Dr.) Tirthankar Datta</p>
                     <p className="text-xs text-gray-500">Principal, Netaji Subhash Engineering College</p>
                 </div>
            </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default Home;