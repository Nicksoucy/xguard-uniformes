// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Ton firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyBT8bjhN5y2uJvn2IhvH5fVUGy-GGonsl4",
  authDomain: "xguard-uniformes.firebaseapp.com",
  projectId: "xguard-uniformes",
  storageBucket: "xguard-uniformes.appspot.com",
  messagingSenderId: "691025581173",
  appId: "1:691025581173:web:2b352d88770693628e543c",
  measurementId: "G-01CSX8L38E"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
