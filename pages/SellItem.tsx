import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, DollarSign } from 'lucide-react';

interface SellItemProps {
  user: User;
  profile: UserProfile;
}

const SellItem: React.FC<SellItemProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Books',
    condition: 'used', // 'new' or 'used'
    price: '',
    originalPrice: '',
    description: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      alert("Please enter a product title first.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const desc = await generateProductDescription(formData.title, formData.condition, formData.category);
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please upload an image of the item.");
      return;
    }
    
    setLoading(true);

    try {
      // 1. Upload Image
      const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Prepare Data
      const price = parseFloat(formData.price);
      const originalPrice = formData.condition === 'used' && formData.originalPrice 
        ? parseFloat(formData.originalPrice) 
        : undefined;

      // 3. Save to Firestore
      await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        sellerId: user.uid,
        sellerName: profile.displayName,
        sellerWhatsapp: profile.phoneNumber,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: price,
        originalPrice: originalPrice,
        imageUrl: imageUrl,
        createdAt: Date.now(),
      });

      navigate('/');
    } catch (error) {
      console.error("Error listing item:", error);
      alert("Failed to list item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const savings = (formData.condition === 'used' && formData.originalPrice && formData.price)
    ? parseFloat(formData.originalPrice) - parseFloat(formData.price)
    : 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Sell an Item
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                placeholder="e.g. Engineering Mathematics Vol 1"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option>Books</option>
                <option>Electronics</option>
                <option>Stationery</option>
                <option>Furniture</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value="used">Used / Second Hand</option>
                <option value="new">Brand New</option>
              </select>
            </div>
          </div>

          {/* Pricing Logic */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
             {formData.condition === 'used' ? (
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-500">
                      Bought Price (Original MRP)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="originalPrice"
                        id="originalPrice"
                        required
                        value={formData.originalPrice}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                      Selling Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        value={formData.price}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {savings > 0 && (
                    <div className="sm:col-span-2 text-green-600 text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Buyer saves ₹{savings} on this deal!
                    </div>
                  )}
               </div>
             ) : (
               <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                    Selling Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md border p-2"
                      placeholder="0.00"
                    />
                  </div>
               </div>
             )}
          </div>

          {/* Description & AI */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {generatingDesc ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                Auto-Write with AI
              </button>
            </div>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                placeholder="Describe condition, reason for selling, etc."
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
              {imagePreview ? (
                <div className="relative">
                   <img src={imagePreview} alt="Preview" className="h-48 object-contain" />
                   <button 
                     type="button" 
                     onClick={() => { setImageFile(null); setImagePreview(null); }}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                   >
                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Listing Item...' : 'Post Item'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellItem;
