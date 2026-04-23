import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGesb7MHMZ7V-Tv97W-0JkdpZlv8dTRTg",
  authDomain: "goldbazarrate.firebaseapp.com",
  projectId: "goldbazarrate",
  storageBucket: "goldbazarrate.firebasestorage.app",
  messagingSenderId: "341415998047",
  appId: "1:341415998047:web:4d279086403d1da11421ea",
  measurementId: "G-T94DD1WHJ5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
