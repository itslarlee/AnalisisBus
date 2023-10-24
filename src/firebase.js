// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDStuH5R3XiOOxJgdYt-IHq25iBL8bkzTQ",
  authDomain: "analisisbus.firebaseapp.com",
  projectId: "analisisbus",
  storageBucket: "analisisbus.appspot.com",
  messagingSenderId: "953567217455",
  appId: "1:953567217455:web:e3814c56e961e4542ac3da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();


export { db, auth, provider, app, analytics };

