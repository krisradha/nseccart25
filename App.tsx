import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import * as firestore from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { UserProfile, COLLECTIONS } from './types';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import SellItem from './pages/SellItem';
import ProductDetail from './pages/ProductDetail';
import Navbar from './components/Navbar';
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
          const docRef = firestore.doc(db, COLLECTIONS.USERS, currentUser.uid);
          const docSnap = await firestore.getDoc(docRef);
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
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        {user && userProfile && (
          <Navbar 
            user={user} 
            profile={userProfile} 
            onSearch={setSearchQuery} 
            searchValue={searchQuery}
          />
        )}
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/setup-profile"
            element={
              user && !userProfile ? (
                <ProfileSetup user={user} onComplete={setUserProfile} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <Home searchQuery={searchQuery} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <SellItem user={user} profile={userProfile} />
              </ProtectedRoute>
            }
          />
           <Route
            path="/product/:id"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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