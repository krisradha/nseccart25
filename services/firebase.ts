import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyghD6QS5s8n9G6IDl5Vx_RC8g2F9OCPI",
  authDomain: "nsecart25.firebaseapp.com",
  projectId: "nsecart25",
  storageBucket: "nsecart25.firebasestorage.app",
  messagingSenderId: "5182190842",
  appId: "1:5182190842:web:233f4c2464951db89f4543",
  measurementId: "G-2L2VV1JQLF"
};

const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = app.firestore();
export const storage = app.storage();

export default app;