// Paste your Firebase web app settings here (see README, step 5).
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKJRv7yneS-t4GlbugX_ejNm99EYogZCQ",
  authDomain: "lost-music-b64f3.firebaseapp.com",
  projectId: "lost-music-b64f3",
  storageBucket: "lost-music-b64f3.firebasestorage.app",
  messagingSenderId: "786216998041",
  appId: "1:786216998041:web:a4835e1c663ec0fccd1408",
  measurementId: "G-MN0WGLDG6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
