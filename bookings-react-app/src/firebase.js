import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlAmCaYzZdY9mEL1Cx5owgFGgqGqsBEVo",
  authDomain: "patel-cab-service.firebaseapp.com",
  projectId: "patel-cab-service",
  storageBucket: "patel-cab-service.appspot.com",
  messagingSenderId: "292222967613",
  appId: "1:292222967613:web:a201b43a47d62d55c8ef54"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
