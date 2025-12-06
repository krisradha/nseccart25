import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, COLLECTIONS } from '../types';
import { CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';

interface ProfileSetupProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    collegeYear: '1st Year',
    address: '',
    phoneNumber: '',
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

    setIsSubmitting(true);

    try {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Student',
        email: user.email,
        photoURL: user.photoURL,
        collegeYear: formData.collegeYear,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        roleIntent: formData.roleIntent as any,
        agreedToTerms: true,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), newProfile);
      onComplete(newProfile);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError('Failed to save profile. Please try again.');
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
          Join the NSE Cart community
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label htmlFor="collegeYear" className="block text-sm font-medium text-gray-700">
                College Year
              </label>
              <select
                id="collegeYear"
                name="collegeYear"
                value={formData.collegeYear}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Hostel / Local Address
              </label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Boys Hostel Block A"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="For buyers to contact you"
                />
              </div>
            </div>

            <div>
              <label htmlFor="roleIntent" className="block text-sm font-medium text-gray-700">
                What are you here for?
              </label>
              <select
                id="roleIntent"
                name="roleIntent"
                value={formData.roleIntent}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value="buy">To Buy</option>
                <option value="sell">To Sell</option>
                <option value="both">Both</option>
                <option value="undecided">Just Browsing</option>
              </select>
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
                <p className="text-gray-500">I confirm I am a student/faculty of the college.</p>
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
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;