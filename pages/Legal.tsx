import React from 'react';
import { ShieldCheck, FileText, Mail } from 'lucide-react';

interface LegalProps {
  type: 'terms' | 'privacy' | 'contact';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-white mt-4 shadow-sm min-h-screen">
      {type === 'terms' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <FileText className="h-8 w-8 text-[#febd69]" />
            <h1 className="text-3xl font-bold text-gray-900">Conditions of Use</h1>
          </div>
          <p className="text-gray-700">Welcome to NSEC Cart. NSEC Cart and its affiliates provide their services to you subject to the following conditions.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-4">1. Student Verification</h2>
          <p className="text-gray-600">This marketplace is intended solely for the students and faculty of Netaji Subhash Engineering College. Users must verify their identity.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-4">2. Buying and Selling</h2>
          <p className="text-gray-600">All transactions are peer-to-peer. NSEC Cart does not handle payments directly. Buyers and sellers must coordinate via WhatsApp or in-person meetings on campus.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-4">3. Prohibited Items</h2>
          <p className="text-gray-600">Selling of illegal items, exams papers, or hazardous materials is strictly prohibited.</p>
        </div>
      )}

      {type === 'privacy' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <ShieldCheck className="h-8 w-8 text-[#febd69]" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Notice</h1>
          </div>
          <p className="text-gray-700">We know that you care how information about you is used and shared, and we appreciate your trust.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Information We Collect</h2>
          <p className="text-gray-600">We collect your Google Profile basic info (Name, Email) and the WhatsApp number you provide for transaction purposes.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-4">How We Use Information</h2>
          <p className="text-gray-600">Your WhatsApp number is shared only on your product listing page to facilitate contact from potential buyers.</p>
        </div>
      )}

      {type === 'contact' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Mail className="h-8 w-8 text-[#febd69]" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          </div>
          <p className="text-gray-700">Have an issue or a suggestion for the platform?</p>
          <div className="bg-gray-50 p-6 rounded-lg border">
             <h3 className="font-bold">Student Developer Team</h3>
             <p className="text-gray-600 mt-2">Email: support@nseccart.in (Demo)</p>
             <p className="text-gray-600">Location: NSEC Campus, Techno City, Garia.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legal;