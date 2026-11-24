
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export const getTransactions = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })).sort((a, b) => {
    const dateA = a.createdAt?.toMillis?.() || 0;
    const dateB = b.createdAt?.toMillis?.() || 0;
    return dateB - dateA;
  });
};

export const updateTransaction = async (id, title, amount, type) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!title.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Please enter valid transaction details.");
  }

  await updateDoc(doc(db, "transactions", id), {
    title: title.trim(),
    amount: Number(amount),
    type: type
  });
};
