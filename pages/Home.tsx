import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, COLLECTIONS } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Tag, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fresh Recommendations</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items listed yet. Be the first to sell!</p>
          <Link to="/sell" className="mt-4 inline-block text-blue-600 font-medium hover:underline">
            Sell an item now &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 h-full flex flex-col">
                <div className="relative aspect-w-1 aspect-h-1 bg-gray-200 h-48 w-full overflow-hidden">
                   {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover center group-hover:opacity-90 transition-opacity"
                      />
                   ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                   )}
                   {product.condition === 'used' && (
                     <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                       Used
                     </span>
                   )}
                   {product.condition === 'new' && (
                     <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                       Brand New
                     </span>
                   )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">
                    {product.title}
                  </h3>
                  
                  <div className="mt-2 flex items-baseline space-x-2">
                     <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                     {product.condition === 'used' && product.originalPrice && (
                       <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                     )}
                  </div>

                  {product.condition === 'used' && product.originalPrice && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      Save ₹{product.originalPrice - product.price}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                       <Tag className="h-3 w-3 mr-1" /> {product.category}
                    </span>
                    <span>
                       {product.sellerName}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
