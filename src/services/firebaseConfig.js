import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDNOZHXeW6UYknKZY_SVg4Wnw48Vkuh2tk",
  authDomain: "expensex-e9f74.firebaseapp.com",
  projectId: "expensex-e9f74",
  storageBucket: "expensex-e9f74.firebasestorage.app",
  messagingSenderId: "67144730896",
  appId: "1:67144730896:web:c7ffb9f358777b53c57d95",
  measurementId: "G-67PRCHDCVH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

export { auth };

export const db = getFirestore(app);

console.log("Firebase initialized successfully!");
