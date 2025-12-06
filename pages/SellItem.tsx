import React, { useState } from 'react';
import { User } from 'firebase/auth';
import * as firestore from 'firebase/firestore';
import * as storageFuncs from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, DollarSign, ChevronLeft } from 'lucide-react';

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
      const storageRef = storageFuncs.ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
      await storageFuncs.uploadBytes(storageRef, imageFile);
      const imageUrl = await storageFuncs.getDownloadURL(storageRef);

      // 2. Prepare Data
      const price = parseFloat(formData.price);
      const originalPrice = formData.condition === 'used' && formData.originalPrice 
        ? parseFloat(formData.originalPrice) 
        : undefined;

      // 3. Save to Firestore
      await firestore.addDoc(firestore.collection(db, COLLECTIONS.PRODUCTS), {
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
    <div className="bg-gray-100 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-900">
           <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </button>

        <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-6">
          Sell your item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700">
              Product Name / Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#febd69] focus:border-[#febd69] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="e.g. Engineering Mathematics Vol 1"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm rounded-md border"
              >
                <option>Books</option>
                <option>Electronics</option>
                <option>Stationery</option>
                <option>Hostel Needs</option>
                <option>Sports</option>
                <option>Fashion</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-bold text-gray-700">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm rounded-md border"
              >
                <option value="used">Used / Second Hand</option>
                <option value="new">Brand New</option>
              </select>
            </div>
          </div>

          {/* Pricing Logic */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Pricing Details</h3>
             {formData.condition === 'used' ? (
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-500">
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      id="originalPrice"
                      required
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="mt-1 block w-full shadow-sm focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm border-gray-300 rounded-md border p-2"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-bold text-gray-900">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 block w-full shadow-sm focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm border-gray-300 rounded-md border p-2"
                      placeholder="250"
                    />
                  </div>
                  {savings > 0 && (
                    <div className="sm:col-span-2 text-green-700 text-sm font-medium flex items-center bg-green-50 p-2 rounded">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Great! The buyer will save ₹{savings}.
                    </div>
                  )}
               </div>
             ) : (
               <div>
                  <label htmlFor="price" className="block text-sm font-bold text-gray-900">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm border-gray-300 rounded-md border p-2"
                    placeholder="0.00"
                  />
               </div>
             )}
          </div>

          {/* Description & AI */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="description" className="block text-sm font-bold text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="inline-flex items-center px-3 py-1 border border-purple-200 text-xs font-medium rounded-full text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none"
              >
                {generatingDesc ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                Use AI Magic
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#febd69] focus:border-[#febd69] block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              placeholder="What makes this item great? Mention any defects if used."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Photo</label>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors bg-gray-50">
              {imagePreview ? (
                <div className="relative">
                   <img src={imagePreview} alt="Preview" className="h-48 object-contain rounded-md" />
                   <button 
                     type="button" 
                     onClick={() => { setImageFile(null); setImagePreview(null); }}
                     className="absolute -top-2 -right-2 bg-white text-gray-500 border border-gray-200 rounded-full p-1 hover:text-red-500 shadow-sm"
                   >
                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#c45500] hover:text-[#b12704] focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-[#ffd814] hover:bg-[#f7ca00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7ca00]"
            >
              {loading ? 'Publishing...' : 'List Item Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;