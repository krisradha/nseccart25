
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, DollarSign, ChevronLeft, Phone, X, Settings } from 'lucide-react';
import "firebase/compat/storage"; 

interface SellItemProps {
  user: User;
  profile: UserProfile;
}

const SellItem: React.FC<SellItemProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
  // Settings
  const [useCompression, setUseCompression] = useState(true);
  
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
  
  const [imageFile, setImageFile] = useState<Blob | File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setStatus(msg);
  };

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

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Timeout safety
      const timer = setTimeout(() => {
          reject(new Error("Compression timed out"));
      }, 3000);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 600; 
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
            
            canvas.toBlob((blob) => {
              if (blob) {
                  resolve(blob);
              } else {
                  reject(new Error("Canvas blob conversion failed"));
              }
            }, 'image/jpeg', 0.6);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = (err) => { clearTimeout(timer); reject(err); };
      };
      reader.onerror = (err) => { clearTimeout(timer); reject(err); };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addLog(`Selected file: ${file.name} (${Math.round(file.size/1024)}KB)`);
      
      if (useCompression) {
        addLog('Attempting compression...');
        try {
            const resized = await resizeImage(file);
            setImageFile(resized);
            setImagePreview(URL.createObjectURL(resized));
            addLog(`Compression success: ${Math.round(resized.size/1024)}KB`);
        } catch (e: any) {
            addLog(`Compression failed: ${e.message}. Using original.`);
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
      } else {
          addLog('Compression disabled. Using original.');
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      alert("Please enter a product title first.");
      return;
    }
    setGeneratingDesc(true);
    addLog('Requesting AI description...');
    try {
      const desc = await generateProductDescription(formData.title, formData.condition, formData.category);
      setFormData(prev => ({ ...prev, description: desc }));
      addLog('AI description generated.');
    } catch (error: any) {
      addLog('AI Error: ' + error.message);
      alert("Could not generate description.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) { alert("Please upload an image."); return; }
    if (!formData.title) { alert("Please enter a title."); return; }
    if (!formData.whatsappNumber) { alert("WhatsApp number required."); return; }
    
    setLoading(true);
    addLog('Starting submission...');
    
    // 1. UPLOAD IMAGE
    const fileName = `item_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
    addLog(`Uploading to: ${fileName}`);
    
    const storageRef = storage.ref().child(fileName);
    
    try {
        const uploadTask = storageRef.put(imageFile);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setStatus(`Uploading Image... ${Math.round(progress)}%`);
            },
            (error) => {
                console.error("Upload error:", error);
                addLog('Upload Error: ' + error.message);
                setLoading(false);
                alert(`Upload Failed: ${error.message}`);
            },
            async () => {
                addLog('Upload complete. Getting URL...');
                try {
                    const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                    addLog('Image URL retrieved.');

                    // 2. SAVE TO DATABASE
                    const price = formData.isFree ? 0 : Number(formData.price || 0);
                    const originalPrice = formData.condition === 'used' && formData.originalPrice 
                    ? Number(formData.originalPrice) 
                    : null;

                    const productData = {
                        sellerId: user.uid,
                        sellerName: profile.displayName || 'Student',
                        sellerWhatsapp: formData.whatsappNumber,
                        title: formData.title,
                        description: formData.description || 'No description provided.',
                        category: formData.category,
                        condition: formData.condition,
                        price: price,
                        originalPrice: originalPrice,
                        isFree: formData.isFree,
                        imageUrl: imageUrl, // Safe URL
                        createdAt: Date.now(),
                    };

                    addLog('Saving to Firestore...');
                    // Use sanitize to remove undefined
                    const sanitizedData = JSON.parse(JSON.stringify(productData)); 
                    
                    await db.collection(COLLECTIONS.PRODUCTS).add(sanitizedData);
                    
                    addLog('Saved successfully!');
                    setStatus('Success! Redirecting...');
                    setTimeout(() => navigate('/'), 1500);

                } catch (dbError: any) {
                    console.error("DB Error:", dbError);
                    addLog('DB Save Error: ' + dbError.message);
                    setLoading(false);
                    alert("Image uploaded, but saving details failed: " + dbError.message);
                }
            }
        );
    } catch (startError: any) {
        addLog('Init Error: ' + startError.message);
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
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 shadow-sm focus:ring-[#febd69] focus:border-[#febd69] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="e.g. Engineering Mathematics Vol 1"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700">Category</label>
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
              <label htmlFor="condition" className="block text-sm font-bold text-gray-700">Condition</label>
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

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Pricing</h3>
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
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {formData.condition === 'used' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-500">Original MRP (₹)</label>
                        <input
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                        />
                        </div>
                    )}
                    <div>
                    <label className="block text-sm font-bold text-gray-900">Selling Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                    />
                    </div>
                 </div>
             )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-bold text-gray-700">WhatsApp Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                name="whatsappNumber"
                required
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="focus:ring-[#febd69] focus:border-[#febd69] block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="inline-flex items-center px-3 py-1 border border-purple-200 text-xs font-medium rounded-full text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                {generatingDesc ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                Auto-Generate
              </button>
            </div>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#febd69] focus:border-[#febd69] block w-full sm:text-sm border-gray-300 rounded-md border p-2"
            />
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Upload Photo</label>
                <div className="flex items-center text-xs text-gray-500">
                    <input 
                        type="checkbox" 
                        checked={useCompression} 
                        onChange={e => setUseCompression(e.target.checked)} 
                        className="mr-1"
                    />
                    <label>Compress Image</label>
                </div>
            </div>
            
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
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
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#c45500] hover:text-[#b12704]">
                      <span>Select Image</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Debug Console */}
          {debugLog.length > 0 && (
              <div className="bg-gray-900 text-green-400 text-xs p-3 rounded font-mono h-32 overflow-y-auto">
                  {debugLog.map((log, i) => (
                      <div key={i}>{log}</div>
                  ))}
              </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-[#ffd814] hover:bg-[#f7ca00] disabled:opacity-70"
            >
              {loading ? status : 'List Item Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
