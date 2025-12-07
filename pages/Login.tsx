
import React from 'react';
import { auth, googleProvider } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, BookOpen, ShieldCheck, Users } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await auth.signInWithPopup(googleProvider);
      // Auth state listener in App.tsx handles redirect
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#131921] relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>
         <div className="relative z-10 text-white p-12 max-w-lg">
             <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome to <br/><span className="text-[#febd69]">NSEC Cart</span></h2>
             <p className="text-gray-300 text-lg mb-8 leading-relaxed">The exclusive marketplace for Netaji Subhash Engineering College. Buy, sell, and exchange academic resources within your trusted community.</p>
             
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-[#febd69]" />
                    </div>
                    <div>
                        <h3 className="font-bold">Resource Sharing</h3>
                        <p className="text-sm text-gray-400">Find books and tools at a fraction of the cost.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-[#febd69]" />
                    </div>
                    <div>
                        <h3 className="font-bold">Verified Students</h3>
                        <p className="text-sm text-gray-400">Safe transactions with verified NSEC IDs.</p>
                    </div>
                </div>
             </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="inline-flex justify-center items-center gap-2 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">NSEC</span>
              <span className="text-xl font-extrabold text-[#febd69]">Cart</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">Use your Google Account to continue</p>
          </div>
          
          <div className="mt-8 space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#febd69] transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              <span className="font-medium">Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">First time here?</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 text-center">
                <p>New accounts will be redirected to the <strong>Profile Setup</strong> page to verify Student ID.</p>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-6">
              By continuing, you agree to NSEC Cart's <a href="#/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
