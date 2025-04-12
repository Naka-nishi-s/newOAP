import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmatV4wAtXF1CM5gXrC1JCjs3lWe7uxL8",
  authDomain: "nagasawa-app.firebaseapp.com",
  projectId: "nagasawa-app",
  storageBucket: "nagasawa-app.firebasestorage.app",
  messagingSenderId: "868586989382",
  appId: "1:868586989382:web:9543b55ea610686f86a747"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)