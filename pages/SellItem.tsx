
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, DollarSign, ChevronLeft, Phone, X } from 'lucide-react';
import "firebase/compat/storage"; 

interface SellItemProps {
  user: User;
  profile: UserProfile;
}

const SellItem: React.FC<SellItemProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); 
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Books',
    condition: 'used',
    price: '',
    isFree: false,
    originalPrice: '',
    description: '',
    whatsappNumber: profile?.phoneNumber || ''
  });
  
  // We store the actual file/blob for uploading, and a string URL for previewing
  const [imageFile, setImageFile] = useState<Blob | File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'isFree') {
        setFormData(prev => ({ ...prev, isFree: checked, price: checked ? '0' : prev.price }));
    }
  };

  // --- ROBUST IMAGE RESIZER (Returns Blob) ---
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 600; // Safe size for mobile uploads
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to Blob (Binary) instead of Base64 string for better upload performance
          canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Canvas conversion failed"));
            }
          }, 'image/jpeg', 0.7);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file (JPG/PNG).");
        return;
      }

      setUploadStatus('Preparing image...');
      try {
        const resizedBlob = await resizeImage(file);
        setImageFile(resizedBlob);
        setImagePreview(URL.createObjectURL(resizedBlob));
        setUploadStatus(''); 
      } catch (err) {
        console.error("Resize failed", err);
        // Fallback: Use original file if resize fails
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadStatus('Using original image.');
      }
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
      alert("Could not generate description. Please write one manually.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!imageFile) {
      alert("Please upload an image of the item.");
      return;
    }
    if (!formData.title) {
      alert("Please enter a title.");
      return;
    }
    if (!formData.whatsappNumber || formData.whatsappNumber.length < 10) {
      alert("Please provide a valid WhatsApp number.");
      return;
    }
    
    setLoading(true);
    setUploadStatus('Initializing upload...');
    
    // 1. UPLOAD IMAGE (Using PUT for Blob support)
    const fileName = `products/${user.uid}/${Date.now()}.jpg`;
    const storageRef = storage.ref().child(fileName);
    
    try {
        const uploadTask = storageRef.put(imageFile);

        // Monitor Progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadStatus(`Uploading... ${Math.round(progress)}%`);
            },
            (error) => {
                // Handle Errors
                console.error("Upload error:", error);
                setLoading(false);
                alert(`Upload Failed: ${error.message}. Check your connection.`);
            },
            async () => {
                // Upload Complete
                try {
                    setUploadStatus('Saving item details...');
                    const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();

                    // 2. SAVE TO DATABASE
                    const price = formData.isFree ? 0 : Number(formData.price);
                    const originalPrice = formData.condition === 'used' && formData.originalPrice 
                    ? Number(formData.originalPrice) 
                    : undefined;

                    await db.collection(COLLECTIONS.PRODUCTS).add({
                    sellerId: user.uid,
                    sellerName: profile.displayName || 'Student',
                    sellerWhatsapp: formData.whatsappNumber,
                    title: formData.title,
                    description: formData.description || 'No description provided.',
                    category: formData.category,
                    condition: formData.condition,
                    price: price,
                    originalPrice: originalPrice || null,
                    isFree: formData.isFree,
                    imageUrl: imageUrl,
                    createdAt: Date.now(),
                    });

                    setUploadStatus('Success!');
                    setTimeout(() => {
                        navigate('/');
                    }, 1000);

                } catch (dbError: any) {
                    console.error("Database error:", dbError);
                    setLoading(false);
                    alert("Image uploaded but failed to save details: " + dbError.message);
                }
            }
        );
    } catch (startError: any) {
        setLoading(false);
        alert("Could not start upload: " + startError.message);
    }
  };

  const savings = (formData.condition === 'used' && formData.originalPrice && formData.price && !formData.isFree)
    ? Number(formData.originalPrice) - Number(formData.price)
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          
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
                <option>Lab Coats</option>
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
             
             {/* Free Checkbox */}
             <div className="flex items-center mb-4">
                <input
                  id="isFree"
                  name="isFree"
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[#febd69] focus:ring-[#febd69] border-gray-300 rounded"
                />
                <label htmlFor="isFree" className="ml-2 block text-sm text-gray-900 font-bold">
                  Give away for Free (Donation)
                </label>
             </div>

             {!formData.isFree && (
                 <>
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
                          min="0"
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
                          min="0"
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
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm focus:ring-[#febd69] focus:border-[#febd69] sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder="0.00"
                      />
                   </div>
                 )}
                 </>
             )}
          </div>

          {/* Contact Details */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-bold text-gray-700">
              WhatsApp Contact Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                name="whatsappNumber"
                id="whatsappNumber"
                required
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="focus:ring-[#febd69] focus:border-[#febd69] block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                placeholder="9876543210"
              />
            </div>
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
                Auto-Generate (AI)
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
              placeholder="Describe the item condition, author, etc."
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
                     <X className="h-4 w-4" />
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
                  <p className="text-xs text-gray-500">JPG, PNG (Max 600px, Auto-resized)</p>
                </div>
              )}
            </div>
            {uploadStatus && (
                <p className="text-xs text-center text-blue-600 mt-2 font-mono font-bold animate-pulse">{uploadStatus}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-[#ffd814] hover:bg-[#f7ca00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7ca00] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Listing Item...' : 'List Item Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
