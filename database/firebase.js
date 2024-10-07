// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBOrmZbvOA3PIS0hjUgz7oUmVXK-KkSDo",
  authDomain: "noctua-bcf7b.firebaseapp.com",
  projectId: "noctua-bcf7b",
  storageBucket: "noctua-bcf7b.appspot.com",
  messagingSenderId: "811451447755",
  appId: "1:811451447755:web:80bccfbc6ba45924799e4e",
  measurementId: "G-M0D6D5S7P8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);