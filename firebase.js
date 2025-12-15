// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmirVdQ-T2xK_fnPxchd5USON_5TVa0H4",
  authDomain: "sport-app-a0e45.firebaseapp.com",
  projectId: "sport-app-a0e45",
  storageBucket: "sport-app-a0e45.firebasestorage.app",
  messagingSenderId: "864793958712",
  appId: "1:864793958712:web:036911db8e00a3081b09cd",
  measurementId: "G-6KCW90260P"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Safe auth init for React Native (avoid "already initialized" crashes)
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);

