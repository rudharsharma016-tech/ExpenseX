
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

// Create a savings goal
export const addSavingsGoal = async (title, targetAmount) => {
  const user = auth.currentUser;

  if (!user) throw new Error("Please login first.");

  if (!title.trim() || Number(targetAmount) <= 0) {
    throw new Error("Enter a valid goal and target amount.");
  }

  return await addDoc(collection(db, "savingsGoals"), {
    userId: user.uid,
    title: title.trim(),
    targetAmount: Number(targetAmount),
    savedAmount: 0,
    createdAt: serverTimestamp()
  });
};

// Get all savings goals of current user
export const getSavingsGoals = async () => {
  const user = auth.currentUser;

  if (!user) throw new Error("Please login first.");

  const q = query(
    collection(db, "savingsGoals"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
};

// Add money to a savings goal
export const updateSavingsGoal = async (id, savedAmount) => {
  if (Number(savedAmount) < 0) {
    throw new Error("Saved amount cannot be negative.");
  }

  await updateDoc(doc(db, "savingsGoals", id), {
    savedAmount: Number(savedAmount)
  });
};

// Delete a savings goal
export const deleteSavingsGoal = async (id) => {
  await deleteDoc(doc(db, "savingsGoals", id));
};
