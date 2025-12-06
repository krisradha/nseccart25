import React from 'react';
import { ShieldCheck, FileText, Mail, Lock } from 'lucide-react';

interface LegalProps {
  type: 'terms' | 'privacy' | 'contact';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white mt-4 shadow-sm min-h-screen text-gray-800 leading-relaxed">
      {type === 'terms' && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-8 border-b pb-6">
            <FileText className="h-10 w-10 text-[#febd69]" />
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions (T&C)</h1>
                <p className="text-sm text-gray-500">Effective Date: December 7, 2025</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-900 mb-6">
             Welcome to the <strong>Netaji Subhash Engineering College (NSEC)</strong> Study Exchange Platform ("The Platform"). This service is designed exclusively for current students, faculty, and staff of NSEC to facilitate the safe and fair buying and selling of academic materials. By accessing or using The Platform, you agree to be bound by these Terms and Conditions.
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-[#febd69] pl-3">1. User Eligibility, Account, and Platform Status</h2>
            <ul className="space-y-3 list-disc pl-5 text-gray-700">
                <li><strong>1.1 Eligibility:</strong> Use of The Platform is strictly limited to current, verified students, faculty, and staff of Netaji Subhash Engineering College.</li>
                <li><strong>1.2 Verification:</strong> Users must register using their official Google account. Accounts are non-transferable.</li>
                <li><strong>1.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your password and are responsible for all activities that occur under your account.</li>
                <li><strong>1.4 Developer Status:</strong> The Platform is an independent project developed and maintained by an individual student of Netaji Subhash Engineering College (the "Developer"). The Platform is provided as-is and is not officially endorsed, operated, or financially guaranteed by Netaji Subhash Engineering College.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-[#febd69] pl-3">2. Listing and Selling</h2>
            <ul className="space-y-3 list-disc pl-5 text-gray-700">
                <li><strong>2.1 Permitted Items:</strong> Only academic-related materials are permitted for sale, including: textbooks, notebooks, lab manuals, reference books, study guides, and permissible academic equipment (e.g., calculators, drawing instruments).</li>
                <li><strong>2.2 Prohibited Items:</strong> The following are strictly prohibited: materials protected by copyright that the user does not have the right to sell (e.g., photocopied books), illegal items, personal non-academic items, weapons, or services.</li>
                <li><strong>2.3 Accuracy of Listings:</strong> Sellers must accurately describe the condition (e.g., New, Good, Acceptable, Annotated) and price of the item. Listing misleading or fraudulent information may result in immediate account suspension.</li>
                <li><strong>2.4 Pricing:</strong> Sellers are encouraged to list used items at a fair, reduced price to promote affordability within the student community.</li>
                <li><strong>2.5 Content Liability:</strong> The Platform is solely a venue. The seller is entirely responsible for the content of their listing and the condition of the item sold.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-[#febd69] pl-3">3. Transactions and Liability</h2>
            <ul className="space-y-3 list-disc pl-5 text-gray-700">
                <li><strong>3.1 Platform Role:</strong> The Platform acts solely as a bulletin board to connect buyers and sellers. It does not handle payments, shipping, or physical exchange of goods.</li>
                <li><strong>3.2 Payment:</strong> All financial transactions (cash, digital payment) must be arranged and completed directly between the buyer and seller outside of the Platform.</li>
                <li><strong>3.3 Disputes:</strong> The Platform, the Developer, and Netaji Subhash Engineering College are not responsible for resolving disputes, disagreements over item condition, non-payment, or failure to deliver. Users transact at their own risk.</li>
                <li><strong>3.4 Release of Liability and Indemnification:</strong> By using The Platform, you agree to release and hold harmless Netaji Subhash Engineering College, the Developer, and any affiliated personnel from any and all claims, demands, liabilities, and damages (including but not limited to financial loss, injury, or theft) arising out of your use of the Platform or your transactions with other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-[#febd69] pl-3">4. Conduct and Termination</h2>
            <ul className="space-y-3 list-disc pl-5 text-gray-700">
                <li><strong>4.1 Respectful Conduct:</strong> All users must conduct themselves professionally and respectfully. Harassment, fraud, or misuse of user contact information is strictly prohibited.</li>
                <li><strong>4.2 Violation:</strong> The Developer, in consultation with Netaji Subhash Engineering College authorities (if applicable), reserves the right to suspend or terminate any user account, without prior notice, for violating these Terms or for any behavior deemed harmful to the community.</li>
                <li><strong>4.3 Changes to T&C:</strong> The Developer reserves the right to modify these Terms at any time. Continued use of The Platform after such changes constitutes your acceptance of the new Terms.</li>
            </ul>
          </section>
        </div>
      )}

      {type === 'privacy' && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-8 border-b pb-6">
            <Lock className="h-10 w-10 text-[#febd69]" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <div className="text-gray-700 space-y-4">
              <p>We know that you care how information about you is used and shared, and we appreciate your trust. This Privacy Policy describes how NSEC Cart collects and processes your personal information through NSEC Cart websites and services.</p>
              
              <h3 className="font-bold text-lg text-gray-900 mt-6">1. Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account Information:</strong> We collect your Google Profile basic info (Name, Email, Photo) for authentication.</li>
                  <li><strong>Contact Information:</strong> We collect the WhatsApp number you provide explicitly to facilitate buyer-seller communication.</li>
                  <li><strong>Usage Data:</strong> We collect information about your interactions with services (e.g., items listed, orders placed).</li>
              </ul>

              <h3 className="font-bold text-lg text-gray-900 mt-6">2. How We Use Information</h3>
              <p>Your WhatsApp number is shared <strong>only</strong> on your product listing page or within the Order Management system to facilitate contact from potential buyers or sellers. We do not sell your personal data to third parties.</p>

              <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 mt-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">6. Contact Information</h3>
                  <p className="mb-2">If you have any questions about this Privacy Policy or the T&C, please contact the Platform Developer/Administrator at:</p>
                  <div className="space-y-1 text-sm font-mono text-gray-800">
                      <p><strong>Developer:</strong> Pritam Das</p>
                      <p><strong>Email:</strong> talkwithpritamdas@gmail.com</p>
                      <p><strong>Department:</strong> DCSE (Netaji Subhash Engineering College)</p>
                  </div>
              </div>
          </div>
        </div>
      )}

      {type === 'contact' && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-8 border-b pb-6">
            <Mail className="h-10 w-10 text-[#febd69]" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          </div>
          
          <p className="text-gray-700 text-lg">Have an issue, a suggestion, or found a bug on the platform?</p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
             <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                 <h3 className="font-bold text-xl mb-4 text-gray-900">Developer Contact</h3>
                 <div className="space-y-3 text-gray-600">
                    <p><span className="font-semibold text-gray-900">Name:</span> Pritam Das</p>
                    <p><span className="font-semibold text-gray-900">Department:</span> DCSE</p>
                    <p><span className="font-semibold text-gray-900">College:</span> Netaji Subhash Engineering College</p>
                    <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> 
                        <a href="mailto:talkwithpritamdas@gmail.com" className="text-blue-600 hover:underline">talkwithpritamdas@gmail.com</a>
                    </p>
                 </div>
             </div>

             <div className="bg-gray-50 p-6 rounded-lg border">
                 <h3 className="font-bold text-xl mb-4 text-gray-900">General Support</h3>
                 <p className="text-gray-600 mb-4">
                     For general inquiries regarding the platform usage or to report inappropriate listings.
                 </p>
                 <p className="text-sm text-gray-500 italic">
                     Note: For academic disputes or college-related administrative issues, please contact the NSEC administration directly.
                 </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legal;