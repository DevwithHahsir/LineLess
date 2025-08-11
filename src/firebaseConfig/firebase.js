// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpCmwknJFL30-OcesJzmkhBAI6L2QULk8",
  authDomain: "lineless-f84fc.firebaseapp.com",
  projectId: "lineless-f84fc",
  storageBucket: "lineless-f84fc.firebasestorage.app",
  messagingSenderId: "670893416174",
  appId: "1:670893416174:web:1187d861b8c50fd52addff",
  measurementId: "G-VHH5TS09ZC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const _analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
