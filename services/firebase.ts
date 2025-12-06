import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyghD6QS5s8n9G6IDl5Vx_RC8g2F9OCPI",
  authDomain: "nsecart25.firebaseapp.com",
  projectId: "nsecart25",
  storageBucket: "nsecart25.firebasestorage.app",
  messagingSenderId: "5182190842",
  appId: "1:5182190842:web:233f4c2464951db89f4543",
  measurementId: "G-2L2VV1JQLF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;