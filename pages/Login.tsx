import React from 'react';
import { auth, googleProvider } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="flex justify-center items-center gap-1 mb-6">
            <span className="text-3xl font-bold leading-none tracking-tighter">NSEC</span>
            <span className="text-3xl font-bold text-[#febd69] leading-none">Cart</span>
          </div>
          <h2 className="mt-2 text-2xl font-medium text-gray-900">Sign in</h2>
        </div>
        
        <div className="mt-8 space-y-4">
          
          {/* Sign In Button */}
          <div className="relative">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#f0c14b] text-sm font-medium text-gray-900 hover:bg-[#ddb347] focus:outline-none"
            >
              Sign In with Google
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to NSEC Cart?</span>
            </div>
          </div>

          {/* Create Account Button (Visually distinct, same function) */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
          >
            Create your NSEC Cart account
          </button>
          
          <div className="text-xs text-gray-600 mt-4 leading-relaxed">
            By continuing, you agree to NSEC Cart's <a href="#/terms" className="text-blue-600 hover:underline">Conditions of Use</a> and <a href="#/privacy" className="text-blue-600 hover:underline">Privacy Notice</a>.
          </div>

           <div className="mt-6 border-t pt-4">
              <p className="text-xs text-gray-500">
                <strong>Buying for college events?</strong>
                <br/>
                Shop on NSEC Cart Business for bulk orders.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;