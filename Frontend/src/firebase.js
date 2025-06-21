// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt5SEU1gYjQMSdUtvyyvfLEff8KMFq_es",
  authDomain: "myapp-52bb1.firebaseapp.com",
  projectId: "myapp-52bb1",
  storageBucket: "myapp-52bb1.firebasestorage.app",
  messagingSenderId: "436514508292",
  appId: "1:436514508292:web:cda678d5a969043b5baf51",
  measurementId: "G-BR4XGL7D5K",
  databaseURL:"https://myapp-52bb1-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
