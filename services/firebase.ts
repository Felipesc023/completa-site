
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Use optional chaining to prevent "Cannot read properties of undefined" errors 
  // if import.meta.env is not defined in the current environment.
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyCvD1V7-kR6CFNgqNFSUf9Y3-5eDc4oq34",
  authDomain: "autenticador-site-completa.firebaseapp.com",
  projectId: "autenticador-site-completa",
  storageBucket: "autenticador-site-completa.appspot.com",
  messagingSenderId: "943390717576",
  appId: "1:943390717576:web:4f7de5f5b8780b63fd113d",
  measurementId: "G-JQPGSL7BS4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
