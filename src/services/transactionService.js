
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export const addTransaction = async (title, amount, type, category) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  return await addDoc(collection(db, "transactions"), {
    userId: user.uid,
    title: title.trim(),
    amount: Number(amount),
    type: type,
    category: category,
    createdAt: serverTimestamp()
  });
};
