// 1. ADD THIS IMPORT LINE AT THE VERY TOP
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <--- THIS WAS MISSING

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPor_RFss3f7EanRmovmZq9GsJleOV3GM",
  authDomain: "facultyportal-2026.firebaseapp.com",
  projectId: "facultyportal-2026",
  storageBucket: "facultyportal-2026.firebasestorage.app",
  messagingSenderId: "599100569745",
  appId: "1:599100569745:web:79301cd7f197ed216ae730",
  measurementId: "G-8VXNYS244T"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 3. Initialize and EXPORT Firestore
export const db = getFirestore(app);