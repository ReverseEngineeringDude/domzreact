// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCg8MYZh8mmKs2KWKbHfnt2fdiXma7E6CE",
    authDomain: "domz-2a7a3.firebaseapp.com",
    projectId: "domz-2a7a3",
    storageBucket: "domz-2a7a3.firebasestorage.app",
    messagingSenderId: "1080515014095",
    appId: "1:1080515014095:web:6383e9f08e5f737b2db6ba",
    measurementId: "G-BS573N080P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
