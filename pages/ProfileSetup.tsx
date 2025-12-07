
import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../services/firebase';
import { UserProfile, COLLECTIONS } from '../types';
import { AlertCircle, Loader2, CreditCard, Building2, Phone, MapPin, CheckCircle2 } from 'lucide-react';

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }));
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

    setIsSubmitting(true);

    try {
      // Save Profile
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Student',
        email: user.email,
        photoURL: user.photoURL,
        collegeYear: formData.collegeYear,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        studentId: formData.studentId,
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Info */}
      <div className="hidden lg:flex w-1/3 bg-blue-900 text-white p-12 flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
         <div>
            <div className="inline-block p-3 bg-white/10 rounded-lg mb-6">
                <Building2 className="h-8 w-8 text-[#febd69]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Complete Your Profile</h2>
            <p className="text-blue-200 leading-relaxed">To ensure a safe and trustworthy marketplace for the NSEC community, we need a few details to verify your student status.</p>
         </div>
         <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-90">
                <CheckCircle2 className="h-5 w-5 text-[#febd69]" />
                <span>Verified Students Only</span>
            </div>
            <div className="flex items-center gap-3 opacity-90">
                <CheckCircle2 className="h-5 w-5 text-[#febd69]" />
                <span>Direct WhatsApp Contact</span>
            </div>
            <div className="flex items-center gap-3 opacity-90">
                <CheckCircle2 className="h-5 w-5 text-[#febd69]" />
                <span>Campus-based Delivery</span>
            </div>
         </div>
      </div>

      {/* Main Form */}
      <div className="w-full lg:w-2/3 p-4 sm:p-12 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="lg:hidden mb-8 text-center">
             <h2 className="text-2xl font-bold text-gray-900">Setup Profile</h2>
             <p className="text-gray-500 text-sm">Join the NSEC Marketplace</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Personal Info */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <Building2 className="h-5 w-5 text-gray-400" /> Academic Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                        <select
                            name="collegeYear"
                            value={formData.collegeYear}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intent</label>
                        <select
                            name="roleIntent"
                            value={formData.roleIntent}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="buy">I want to Buy</option>
                            <option value="sell">I want to Sell</option>
                            <option value="both">I want to do Both</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Verification */}
            <section>
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <CreditCard className="h-5 w-5 text-gray-400" /> Verification
                </h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID Number</label>
                    <input
                        name="studentId"
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 109001190..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Found on your official ID card. Required for trust score.</p>
                </div>
            </section>

            {/* Contact */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <Phone className="h-5 w-5 text-gray-400" /> Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <input
                            name="phoneNumber"
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+91..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hostel / Location</label>
                        <input
                            name="address"
                            type="text"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Boys Hostel, Block A"
                        />
                    </div>
                </div>
            </section>

            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                <input
                  id="agreedToTerms"
                  name="agreedToTerms"
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={handleCheckboxChange}
                  className="mt-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
                  I confirm that I am a student of Netaji Subhash Engineering College and I agree to the <a href="#/terms" className="text-blue-600 underline">Terms & Conditions</a>.
                </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 flex gap-3">
                 <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                 <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#febd69] hover:bg-[#f3a847] text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                    <span className="flex items-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving Details...
                    </span>
                ) : 'Complete Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
