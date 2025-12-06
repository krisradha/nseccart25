import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use a simple collection query and sort client-side to avoid "Missing Index" errors
        const q = collection(db, COLLECTIONS.PRODUCTS);
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // Client-side sort desc
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
      <div className="flex justify-center items-center h-96 bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      
      {/* Hero Banner Section */}
      <div className="relative max-w-[1500px] mx-auto">
        <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] h-[200px] sm:h-[300px] w-full relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 text-white z-10">
             <h1 className="text-3xl sm:text-5xl font-bold mb-2">Semester Start Sale</h1>
             <p className="text-lg sm:text-xl opacity-90 max-w-lg mb-4">Up to 60% off on Used Engineering Books & Drafters.</p>
             <Link to="/sell" className="bg-[#febd69] text-gray-900 px-6 py-2 rounded-md font-bold w-fit hover:bg-[#f3a847] shadow-lg">
                Sell Your Old Items
             </Link>
          </div>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          {/* Gradient fade at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-100 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 -mt-16 sm:-mt-24 relative z-20">
        
        {/* Category Rail */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6 py-2">
           {[
             { name: 'Books', img: 'https://cdn-icons-png.flaticon.com/512/3330/3330314.png' },
             { name: 'Calculators', img: 'https://cdn-icons-png.flaticon.com/512/2956/2956799.png' },
             { name: 'Lab Coats', img: 'https://cdn-icons-png.flaticon.com/512/2038/2038020.png' },
             { name: 'Drafters', img: 'https://cdn-icons-png.flaticon.com/512/2892/2892735.png' },
             { name: 'Sports', img: 'https://cdn-icons-png.flaticon.com/512/2921/2921932.png' },
           ].map(cat => (
             <div key={cat.name} className="flex-shrink-0 flex flex-col items-center justify-center cursor-pointer bg-white p-3 rounded-lg shadow-sm min-w-[120px] h-[120px] hover:shadow-md transition-all">
                <img src={cat.img} alt={cat.name} className="h-12 w-12 mb-2 object-contain" />
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
             </div>
           ))}
        </div>

        {/* Product Grid */}
        <div className="bg-white p-4 sm:p-6 shadow-sm rounded-t-lg min-h-[500px]">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recommended for you</h2>
              <span className="text-sm text-blue-600 cursor-pointer hover:underline">See more</span>
           </div>
           
           {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-lg">No items listed yet.</p>
              <p className="text-gray-400 text-sm mb-4">Be the first to sell something!</p>
              <Link to="/sell" className="inline-block bg-[#ffd814] px-4 py-2 rounded-md font-medium text-gray-900 border border-[#fcd200]">
                List an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group flex flex-col h-full border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all rounded-sm p-3 bg-white">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-white mb-2 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                    
                    {/* Badge */}
                    {product.condition === 'used' && (
                       <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                         USED
                       </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col text-left">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-[#C7511F] transition-colors mb-1 h-10">
                      {product.title}
                    </h3>
                    
                    {/* Mock Rating */}
                    <div className="flex items-center mb-1">
                      <div className="flex text-[#F7CA00]">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                      <span className="text-[10px] text-blue-600 ml-1">45</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs align-top">₹</span>
                        <span className="text-xl font-medium text-gray-900">{product.price}</span>
                        {product.condition === 'used' && product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      {product.condition === 'used' && product.originalPrice && (
                         <div className="text-[10px] text-gray-500">
                           Save ₹{product.originalPrice - product.price}
                         </div>
                      )}

                      <div className="text-[10px] text-gray-500 mt-2">
                        Get it by <span className="font-bold text-gray-700">Tomorrow</span>
                      </div>
                    </div>
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