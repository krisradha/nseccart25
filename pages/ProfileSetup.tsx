import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { UserProfile, COLLECTIONS } from '../types';
import { CheckCircle, AlertCircle, User as UserIcon, Upload, Loader2, CreditCard } from 'lucide-react';
import "firebase/compat/storage"; 

interface ProfileSetupProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    collegeYear: '1st Year',
    address: '',
    phoneNumber: '',
    studentId: '',
    roleIntent: 'both',
    agreedToTerms: false,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setError('Please enter a valid WhatsApp number.');
      return;
    }
    if (!formData.studentId) {
        setError('Student ID Number is required for verification.');
        return;
    }
    if (!selectedFile) {
        setError('Please upload a photo of your Student ID Card.');
        return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading ID Card...');

    try {
      // 1. Upload ID Card Image
      let idCardUrl = '';
      if (selectedFile) {
          const fileName = `${user.uid}_idcard.jpg`;
          const storageRef = storage.ref().child(`verification/${fileName}`);
          
          // Simple upload without compression for ID cards (need clarity)
          // relying on blob upload for stability
          const snapshot = await storageRef.put(selectedFile, {
            contentType: selectedFile.type || 'image/jpeg',
            customMetadata: { uid: user.uid, type: 'id_card' }
          });
          
          idCardUrl = await snapshot.ref.getDownloadURL();
      }

      // 2. Save Profile
      setUploadStatus('Saving Profile...');
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Student',
        email: user.email,
        photoURL: user.photoURL,
        collegeYear: formData.collegeYear,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        studentId: formData.studentId,
        idCardUrl: idCardUrl,
        roleIntent: formData.roleIntent as any,
        agreedToTerms: true,
        createdAt: Date.now(),
      };

      await db.collection(COLLECTIONS.USERS).doc(user.uid).set(newProfile);
      onComplete(newProfile);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError('Failed to save profile. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Verification is required to ensure a safe marketplace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Year & Address */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">College Year</label>
                    <select
                        name="collegeYear"
                        value={formData.collegeYear}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Alumni</option>
                        <option>Faculty</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        name="roleIntent"
                        value={formData.roleIntent}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="buy">To Buy</option>
                        <option value="sell">To Sell</option>
                        <option value="both">Both</option>
                    </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hostel / Local Address</label>
              <input
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                placeholder="e.g. Boys Hostel Block A, Room 202"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                placeholder="For buyers to contact you"
              />
            </div>

            {/* ID Verification Section */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" /> Identity Verification
                </h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-medium text-blue-800 mb-1">Student ID Number</label>
                    <input
                        name="studentId"
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className="block w-full border border-blue-200 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. NSEC/2024/..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-blue-800 mb-2">Upload ID Card Photo</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-md bg-white hover:bg-blue-50 cursor-pointer"
                    >
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="ID Preview" className="h-32 object-contain" />
                                <p className="text-xs text-center mt-2 text-blue-600">Click to change</p>
                            </div>
                        ) : (
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-8 w-8 text-blue-400" />
                                <div className="text-xs text-blue-600">
                                    <span>Upload a photo</span>
                                </div>
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
                </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreedToTerms"
                  name="agreedToTerms"
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={handleCheckboxChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreedToTerms" className="font-medium text-gray-700">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                    <span className="flex items-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" /> {uploadStatus}
                    </span>
                ) : 'Complete Verification & Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;