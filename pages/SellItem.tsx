
import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, ChevronLeft, Phone, Image as ImageIcon, Link as LinkIcon, Book, Monitor, PenTool, Shirt, Dribbble, Terminal } from 'lucide-react';
import "firebase/compat/storage"; 

interface SellItemProps {
  user: User;
  profile: UserProfile;
}

const SellItem: React.FC<SellItemProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
  // Image Input Mode
  const [imageMode, setImageMode] = useState<'upload' | 'default' | 'link'>('upload');
  const [externalLink, setExternalLink] = useState('');

  // Debug & fallback states
  const [logs, setLogs] = useState<string[]>([]);
  const [skipCompression, setSkipCompression] = useState(false);
  const isTimedOut = useRef(false);

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
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    return () => {
      if (imagePreview && imageMode === 'upload') URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview, imageMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'isFree') {
        setFormData(prev => ({ ...prev, isFree: checked, price: checked ? '0' : prev.price }));
    } else if (name === 'skipCompression') {
        setSkipCompression(checked);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      addLog(`Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleDefaultIconSelect = (url: string) => {
      setImagePreview(url);
      setSelectedFile(null); // Clear file
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setExternalLink(e.target.value);
      setImagePreview(e.target.value);
      setSelectedFile(null);
  };

  // --- IMAGE PREPARATION LOGIC ---
  const prepareImageForUpload = async (file: File): Promise<Blob | File> => {
    if (skipCompression) {
        addLog("Skipping compression as requested.");
        return file;
    }
    
    // If small enough, don't touch it
    if (file.size < 1024 * 1024) { // 1MB
        addLog("File under 1MB, skipping compression.");
        return file;
    }

    addLog("Starting image optimization...");
    setUploadStatus("Optimizing image...");
    
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            addLog("Compression timed out (3s). Using original.");
            resolve(file);
        }, 3000); 

        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scale = MAX_WIDTH / img.width;
                const width = scale < 1 ? MAX_WIDTH : img.width;
                const height = scale < 1 ? img.height * scale : img.height;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("No canvas context");

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    clearTimeout(timer);
                    if (blob) {
                        addLog(`Compressed to ${(blob.size / 1024).toFixed(2)} KB`);
                        resolve(blob);
                    } else {
                        addLog("Blob creation failed, using original.");
                        resolve(file);
                    }
                }, 'image/jpeg', 0.7);
            } catch (e) {
                clearTimeout(timer);
                addLog(`Compression error: ${e}`);
                resolve(file);
            }
        };

        img.onerror = (e) => {
            clearTimeout(timer);
            addLog("Image load error during compression.");
            resolve(file);
        };
    });
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
      addLog("AI Gen Error");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const sanitizeData = (data: any) => {
    const clean: any = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            clean[key] = data[key];
        } else {
            clean[key] = null;
        }
    });
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([]);
    addLog("Submit started.");
    isTimedOut.current = false;

    if (!formData.title) { alert("Please enter a title."); return; }
    
    // Check if image is present based on mode
    if (imageMode === 'upload' && !selectedFile) { alert("Please upload an image or choose another method."); return; }
    if (imageMode === 'link' && !externalLink) { alert("Please enter an image link."); return; }
    if (imageMode === 'default' && !imagePreview) { alert("Please select an icon."); return; }

    setLoading(true);
    setUploadProgress(0);
    
    try {
        let finalImageUrl = imagePreview || '';

        // Handle File Upload ONLY if mode is 'upload'
        if (imageMode === 'upload' && selectedFile) {
            const fileToUpload = await prepareImageForUpload(selectedFile);
            addLog("Image prepared for upload.");

            const fileName = `${Date.now()}_img.jpg`;
            const storagePath = `products/${user.uid}/${fileName}`;
            const storageRef = storage.ref().child(storagePath);
            
            setUploadStatus("Uploading...");
            addLog(`Uploading to ${storagePath}`);
            
            const uploadTask = storageRef.put(fileToUpload, {
                contentType: 'image/jpeg',
                customMetadata: { uploader: user.uid }
            });

            // Promisify the upload task to handle it cleaner
            await new Promise<void>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                        setUploadStatus(`Uploading... ${Math.round(progress)}%`);
                    },
                    (error) => {
                        console.error("Upload error:", error);
                        reject(error);
                    },
                    async () => {
                        const url = await uploadTask.snapshot.ref.getDownloadURL();
                        finalImageUrl = url;
                        resolve();
                    }
                );
            });
        }

        addLog("Image URL secured. Saving details...");

        // 3. Save to Firestore
        const price = formData.isFree ? 0 : Number(formData.price || 0);
        const originalPrice = formData.condition === 'used' && formData.originalPrice 
            ? Number(formData.originalPrice) 
            : null;

        const productData = {
            sellerId: user.uid,
            sellerName: profile.displayName || 'Student',
            sellerWhatsapp: formData.whatsappNumber || '',
            title: formData.title,
            description: formData.description || 'No description provided.',
            category: formData.category,
            condition: formData.condition,
            price: price,
            originalPrice: originalPrice,
            isFree: formData.isFree,
            imageUrl: finalImageUrl,
            createdAt: Date.now(),
        };

        addLog("Writing to Firestore...");
        await db.collection(COLLECTIONS.PRODUCTS).add(sanitizeData(productData));
        
        addLog("Firestore Write Success.");
        setUploadStatus("Success!");
        
        setTimeout(() => {
            navigate('/');
        }, 500);

    } catch (err: any) {
        console.error("Submission error:", err);
        addLog(`Error: ${err.message}`);
        setLoading(false);
        alert(`Error: ${err.message}`);
    }
  };

  // Default Categories
  const defaultIcons = [
      { name: 'Book', url: 'https://cdn-icons-png.flaticon.com/512/3330/3330314.png' },
      { name: 'Calc', url: 'https://cdn-icons-png.flaticon.com/512/2956/2956799.png' },
      { name: 'Coat', url: 'https://cdn-icons-png.flaticon.com/512/2038/2038020.png' },
      { name: 'Draft', url: 'https://cdn-icons-png.flaticon.com/512/2892/2892735.png' },
      { name: 'Sport', url: 'https://cdn-icons-png.flaticon.com/512/2921/2921932.png' },
      { name: 'Device', url: 'https://cdn-icons-png.flaticon.com/512/2956/2956799.png' },
  ];

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
            <label className="block text-sm font-bold text-gray-700">Product Name</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#febd69] focus:border-[#febd69]"
              placeholder="e.g. Engineering Mathematics Vol 1"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
              <label className="block text-sm font-bold text-gray-700">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="used">Used / Second Hand</option>
                <option value="new">Brand New</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
             <div className="flex items-center mb-4">
                <input
                  name="isFree"
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[#febd69] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-bold text-gray-900">Give away for Free</label>
             </div>

             {!formData.isFree && (
                 <div className="grid grid-cols-2 gap-4">
                    {formData.condition === 'used' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Original Price (₹)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase">Selling Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                className="pl-10 block w-full border border-gray-300 rounded-md p-2"
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
                className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center"
              >
                {generatingDesc ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                AI Generate
              </button>
            </div>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
              placeholder="Describe the item condition, edition, etc."
            />
          </div>

          {/* --- NEW IMAGE SELECTION TABS --- */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item Image</label>
            
            <div className="flex border-b border-gray-200 mb-4">
                <button
                   type="button"
                   onClick={() => setImageMode('upload')}
                   className={`flex-1 py-2 text-sm font-medium border-b-2 ${imageMode === 'upload' ? 'border-[#febd69] text-black' : 'border-transparent text-gray-500'}`}
                >
                    <Upload className="h-4 w-4 inline mr-1"/> Upload
                </button>
                <button
                   type="button"
                   onClick={() => setImageMode('default')}
                   className={`flex-1 py-2 text-sm font-medium border-b-2 ${imageMode === 'default' ? 'border-[#febd69] text-black' : 'border-transparent text-gray-500'}`}
                >
                    <ImageIcon className="h-4 w-4 inline mr-1"/> Use Icon
                </button>
                <button
                   type="button"
                   onClick={() => setImageMode('link')}
                   className={`flex-1 py-2 text-sm font-medium border-b-2 ${imageMode === 'link' ? 'border-[#febd69] text-black' : 'border-transparent text-gray-500'}`}
                >
                    <LinkIcon className="h-4 w-4 inline mr-1"/> Link
                </button>
            </div>

            {/* TAB 1: UPLOAD */}
            {imageMode === 'upload' && (
                <div className="space-y-2">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                    
                    {imagePreview ? (
                        <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-48 object-contain rounded-md" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded-md">
                            <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded shadow opacity-0 hover:opacity-100">Change Photo</span>
                        </div>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to Upload</span>
                        </div>
                        <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                    />
                    </div>
                    {selectedFile && (
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={skipCompression} onChange={(e) => setSkipCompression(e.target.checked)} id="skip" />
                            <label htmlFor="skip" className="text-xs text-gray-600">Skip Optimization (Try this if upload hangs)</label>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: DEFAULT ICON */}
            {imageMode === 'default' && (
                <div className="grid grid-cols-3 gap-4">
                    {defaultIcons.map((icon) => (
                        <div 
                            key={icon.name}
                            onClick={() => handleDefaultIconSelect(icon.url)}
                            className={`p-4 border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all ${imagePreview === icon.url ? 'border-[#febd69] bg-yellow-50 ring-2 ring-[#febd69]' : 'border-gray-200'}`}
                        >
                            <img src={icon.url} alt={icon.name} className="h-10 w-10 mb-2" />
                            <span className="text-xs font-medium text-gray-700">{icon.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 3: PASTE LINK */}
            {imageMode === 'link' && (
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Paste image URL (e.g., from Google Drive, Imgur, etc)</label>
                    <input 
                        type="text" 
                        value={externalLink}
                        onChange={handleLinkChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    {imagePreview && (
                         <div className="mt-2 h-32 w-full bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                             <img src={imagePreview} alt="Preview" className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                         </div>
                    )}
                </div>
            )}

          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
               <div 
                 className="bg-[#febd69] h-2.5 rounded-full transition-all duration-300" 
                 style={{ width: `${Math.max(5, uploadProgress)}%` }}
               ></div>
               <p className="text-center text-xs text-gray-600 mt-1">{uploadStatus}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-[#ffd814] hover:bg-[#f7ca00] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <span className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing...
                  </span>
              ) : 'List Item Now'}
            </button>
          </div>
        </form>

        {/* Status Logs for Debugging */}
        <div className="mt-8 bg-black text-green-400 p-4 rounded-md text-xs font-mono h-40 overflow-y-auto hidden">
            <div className="flex items-center mb-2 text-gray-400 border-b border-gray-700 pb-1">
                <Terminal className="h-3 w-3 mr-2" /> System Status Log
            </div>
            {logs.length === 0 ? (
                <span className="opacity-50">Waiting for action...</span>
            ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
            )}
        </div>
      </div>
    </div>
  );
};

export default SellItem;
