
import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { generateProductDescription } from '../services/geminiService';
import { UserProfile, COLLECTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Loader2, ChevronLeft, Phone, AlertCircle, Terminal } from 'lucide-react';
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
      if (imagePreview) URL.revokeObjectURL(imagePreview);
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

  const prepareImageForUpload = async (file: File): Promise<Blob | File> => {
    if (skipCompression) {
        addLog("Skipping compression as requested.");
        return file;
    }
    
    // If small enough, don't touch it
    if (file.size < 500 * 1024) { // 500KB
        addLog("File under 500KB, skipping compression.");
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
                const MAX_WIDTH = 600; // Reduced from 800 for faster mobile uploads
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
                }, 'image/jpeg', 0.6); // Quality 0.6
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
    // Remove undefined values to prevent Firestore crash
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
    setLogs([]); // Clear logs
    addLog("Submit started.");
    isTimedOut.current = false;

    if (!selectedFile) { alert("Please upload an image."); return; }
    if (!formData.title) { alert("Please enter a title."); return; }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
        // 1. Prepare Image
        const fileToUpload = await prepareImageForUpload(selectedFile);
        addLog("Image prepared for upload.");

        // 2. Upload to Firebase Storage
        const fileName = `${Date.now()}_img.jpg`;
        const storagePath = `products/${user.uid}/${fileName}`;
        const storageRef = storage.ref().child(storagePath);
        
        setUploadStatus("Uploading...");
        addLog(`Uploading to ${storagePath}`);
        
        const uploadTask = storageRef.put(fileToUpload, {
            contentType: 'image/jpeg',
            customMetadata: { uploader: user.uid }
        });

        // Safety timeout for upload (Increased to 60s)
        const uploadTimeout = setTimeout(() => {
            if (uploadTask.snapshot.state === 'running') {
                isTimedOut.current = true;
                uploadTask.cancel();
                addLog("Upload timed out (60s).");
                setLoading(false);
                setUploadStatus("Timed Out");
                alert("Upload took too long (>60s). \n\nTip: Try enabling 'Skip Image Compression' or check your internet connection.");
            }
        }, 60000);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
                setUploadStatus(`Uploading... ${Math.round(progress)}%`);
            },
            (error) => {
                clearTimeout(uploadTimeout);
                
                // If we forced the cancel due to timeout, ignore this error callback to avoid double alerts
                if (isTimedOut.current || error.code === 'storage/canceled') {
                    addLog("Upload canceled by system or user.");
                    return; 
                }

                console.error("Upload error:", error);
                addLog(`Upload Error: ${error.message}`);
                setLoading(false);
                setUploadStatus("Upload failed.");
                alert(`Upload Failed: ${error.message}`);
            },
            async () => {
                clearTimeout(uploadTimeout);
                addLog("Upload complete. Getting URL...");
                setUploadStatus("Saving details...");
                
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    addLog(`URL: ${downloadURL.substring(0, 20)}...`);

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
                        imageUrl: downloadURL,
                        createdAt: Date.now(),
                    };

                    addLog("Writing to Firestore...");
                    // Using sanitize to be safe
                    await db.collection(COLLECTIONS.PRODUCTS).add(sanitizeData(productData));
                    
                    addLog("Firestore Write Success.");
                    setUploadStatus("Success!");
                    
                    // Delay slightly to show success
                    setTimeout(() => {
                        navigate('/');
                    }, 500);

                } catch (dbError: any) {
                    console.error("Database error:", dbError);
                    addLog(`DB Error: ${dbError.message}`);
                    setLoading(false);
                    alert(`Saved image, but DB failed: ${dbError.message}`);
                }
            }
        );

    } catch (err: any) {
        console.error("Submission error:", err);
        addLog(`General Error: ${err.message}`);
        setLoading(false);
        alert(`Error: ${err.message}`);
    }
  };

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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item Photo</label>
            
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
            
            {/* Direct Upload Toggle */}
            {selectedFile && (
                <div className="mt-2 flex items-center bg-blue-50 p-2 rounded border border-blue-100">
                    <input 
                        type="checkbox"
                        id="skipCompression"
                        name="skipCompression"
                        checked={skipCompression}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="skipCompression" className="ml-2 text-xs text-blue-800">
                        <strong>Having upload issues?</strong> Check this box to skip image optimization (Direct Upload).
                    </label>
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
        <div className="mt-8 bg-black text-green-400 p-4 rounded-md text-xs font-mono h-40 overflow-y-auto">
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
