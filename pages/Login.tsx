import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Navigation is handled by auth state listener in App.tsx
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">NSE Cart</h2>
          <p className="mt-2 text-sm text-gray-600">
            The exclusive marketplace for NSE college students.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-all"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 24 24" fill="white">
                <path d="M21.35 11.1h-9.17v2.98h5.69c-.59 2.72-2.37 4.64-5.69 4.64-3.46 0-6.27-2.81-6.27-6.27s2.81-6.27 6.27-6.27c1.63 0 3.1.57 4.23 1.63l2.45-2.45C17.16 3.63 15.2 2.76 12.18 2.76 7.04 2.76 2.87 6.93 2.87 12.07s4.17 9.31 9.31 9.31c4.69 0 8.61-3.29 9.31-7.76.12-.77.19-1.57.19-2.39 0-.44-.04-.87-.11-1.29z" />
              </svg>
            </span>
            Sign in with Google
          </button>
          
          <div className="text-center text-xs text-gray-500">
            By signing in, you agree to join the coolest campus marketplace.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;