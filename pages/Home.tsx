
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Search, Wallet, Quote, GraduationCap, UserCircle2, ArrowRight, Zap, BookOpen, Upload, Handshake } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* Hero Section - Modern Engineering Vibe */}
      <div className="relative bg-[#131921] overflow-hidden">
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L100 0 L100 100 Z" fill="white" />
            </svg>
        </div>
        
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="lg:w-2/3">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900 border border-blue-700 text-blue-100 text-xs font-bold uppercase tracking-wide mb-4">
                <Zap className="h-3 w-3 mr-1 text-[#febd69]" /> NSEC Exclusive
             </div>
             <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
               The Engineer's <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#febd69] to-[#f3a847]">Smart Marketplace</span>
             </h1>
             <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed">
               Pass on your legacy. Buy and sell used engineering books, drafters, and components within the campus. Save money, save paper.
             </p>
             <div className="flex flex-wrap gap-4">
                <Link to="/sell" className="flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-gray-900 bg-[#febd69] hover:bg-[#f3a847] shadow-lg transform hover:-translate-y-1 transition-all">
                   Start Selling
                   <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-white border border-gray-600 hover:bg-gray-800 transition-all">
                   Browse Items
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* HOW IT WORKS - Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
                { title: 'List in Seconds', icon: Upload, desc: 'Snap a photo of your book or instrument. AI helps you write the description.', color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'Connect on Campus', icon: Handshake, desc: 'Chat via WhatsApp. Meet at the canteen or library to exchange.', color: 'text-[#febd69]', bg: 'bg-yellow-50' },
                { title: 'Save Big', icon: Wallet, desc: 'Get books at 60% off. Recover cash from your old semester supplies.', color: 'text-green-600', bg: 'bg-green-50' }
            ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 flex items-start space-x-4 border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className={`p-3 rounded-lg ${item.bg}`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Category Chips */}
        <div className="mb-10">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" /> Browse Categories
             </h2>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {['Computer Science', 'Electronics', 'Civil', 'Mechanical', 'Electrical', 'BCA/MCA', 'Lab Gear'].map(cat => (
                 <button key={cat} onClick={() => {}} className="flex-shrink-0 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm whitespace-nowrap">
                    {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* Product Grid */}
        <div className="mb-16">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Fresh Arrivals</h2>
           </div>
           
           {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg">No items found.</p>
              <p className="text-gray-500 mb-6">Be the first to list something!</p>
              <Link to="/sell" className="inline-block bg-[#ffd814] px-6 py-2 rounded-md font-bold text-gray-900 border border-[#fcd200] hover:shadow-md transition-all">
                List an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredProducts.map((product) => {
                  const isSoldOut = product.status === 'reserved' || product.status === 'sold';
                  return (
                    <Link key={product.id} to={`/product/${product.id}`} className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${isSoldOut ? 'opacity-75' : ''}`}>
                    
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className={`max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale' : ''}`}
                        />
                        ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                        )}
                        
                        {isSoldOut && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow transform -rotate-6">
                                    SOLD OUT
                                </span>
                            </div>
                        )}

                        {!isSoldOut && product.condition === 'used' && (
                           <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                               USED
                           </span>
                        )}
                         {!isSoldOut && product.isFree && (
                           <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                               FREE
                           </span>
                        )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="text-xs text-gray-500 mb-1 line-clamp-1">{product.category}</div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors h-10 leading-snug">
                            {product.title}
                        </h3>
                        
                        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                             <div className="flex flex-col">
                                {product.condition === 'used' && product.originalPrice && (
                                    <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>
                                )}
                                <span className="text-lg font-bold text-gray-900">
                                    {product.isFree ? 'FREE' : `₹${product.price}`}
                                </span>
                             </div>
                             {!isSoldOut && (
                                 <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#febd69] transition-colors">
                                     <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                                 </div>
                             )}
                        </div>
                    </div>
                    </Link>
                  );
              })}
            </div>
          )}
        </div>

        {/* --- PRINCIPAL'S DESK SECTION --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-16">
            <div className="md:flex">
                <div className="md:w-1/3 bg-blue-900 p-8 flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                         <Quote className="h-full w-full text-white transform -rotate-12 scale-150" />
                    </div>
                    <div className="relative z-10">
                        <div className="h-24 w-24 rounded-full bg-white/20 mb-4 mx-auto flex items-center justify-center border-2 border-white/30">
                            <GraduationCap className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">From the Principal's Desk</h3>
                        <p className="text-blue-200 text-sm mt-1">Netaji Subhash Engineering College</p>
                    </div>
                </div>
                <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                    <Quote className="h-8 w-8 text-[#febd69] mb-4 opacity-50" />
                    <p className="text-gray-700 text-lg italic leading-relaxed mb-6">
                        "I am delighted to see our students embracing innovation and sustainability through NSEC Cart. 
                        This platform not only helps in making education more affordable but also fosters a strong 
                        sense of community and resource-sharing. Initiatives like these reflect the true spirit of 
                        engineering—solving real-world problems with efficiency. I encourage every student to 
                        participate responsibly and keep the cycle of knowledge flowing."
                    </p>
                    <div>
                        <p className="font-bold text-gray-900">Prof. (Dr.) Tirthankar Datta</p>
                        <p className="text-sm text-gray-500">Principal, NSEC</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- STUDENT FEEDBACK SECTION --- */}
        <div className="mb-16">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">What Students Are Saying</h2>
                <p className="text-gray-500 mt-2">Join hundreds of students saving money every semester</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { name: "Sounak R.", dept: "CSE, 3rd Year", text: "Sold my 1st-year drafter and books within 2 hours. The WhatsApp integration makes it super easy to coordinate.", color: "bg-purple-50" },
                    { name: "Priya D.", dept: "ECE, 2nd Year", text: "Got a barely used Matrix book for ₹150 which costs ₹500 new. NSEC Cart is a lifesaver for hostelers.", color: "bg-blue-50" },
                    { name: "Rahul K.", dept: "ME, 4th Year", text: "Finally, a way to clear my room before graduation. It feels good to know my notes will help a junior.", color: "bg-orange-50" }
                ].map((feedback, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1 mb-4">
                            {[1,2,3,4,5].map(s => <span key={s} className="text-[#febd69]">★</span>)}
                        </div>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">"{feedback.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${feedback.color} flex items-center justify-center text-gray-700 font-bold text-xs`}>
                                {feedback.name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{feedback.name}</p>
                                <p className="text-xs text-gray-500">{feedback.dept}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;