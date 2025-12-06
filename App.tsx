import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from './services/firebase';
import { UserProfile, COLLECTIONS } from './types';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import SellItem from './pages/SellItem';
import ProductDetail from './pages/ProductDetail';
import Legal from './pages/Legal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile from Firestore to check if they completed setup
        try {
          const docRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
        <Navbar 
          user={user} 
          profile={userProfile} 
          onSearch={setSearchQuery} 
          searchValue={searchQuery}
        />
        
        <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={<Home searchQuery={searchQuery} />}
            />
             <Route
              path="/product/:id"
              element={<ProductDetail user={user} />}
            />
            <Route path="/terms" element={<Legal type="terms" />} />
            <Route path="/privacy" element={<Legal type="privacy" />} />
            <Route path="/contact" element={<Legal type="contact" />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            
            {/* Protected Routes */}
            <Route
              path="/setup-profile"
              element={
                user && !userProfile ? (
                  <ProfileSetup user={user} onComplete={setUserProfile} />
                ) : user && userProfile ? (
                  <Navigate to="/" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/sell"
              element={
                <ProtectedRoute user={user} userProfile={userProfile}>
                  <SellItem user={user} profile={userProfile!} />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

const ProtectedRoute = ({
  user,
  userProfile,
  children,
}: {
  user: User | null;
  userProfile: UserProfile | null;
  children: React.ReactNode;
}) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!userProfile) {
    return <Navigate to="/setup-profile" replace />;
  }
  return <>{children}</>;
};

export default App;