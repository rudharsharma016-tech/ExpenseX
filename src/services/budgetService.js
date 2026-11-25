
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export const saveBudget = async (amount) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

 const now = new Date();
 const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budgetId = `${user.uid}_${month}`;

  await setDoc(doc(db, "budgets", budgetId), {
    userId: user.uid,
    month,
    amount: Number(amount)
  });
};

export const getBudget = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const month = new Date().toISOString().slice(0, 7);
  const budgetId = `${user.uid}_${month}`;

  const snapshot = await getDoc(doc(db, "budgets", budgetId));

  return snapshot.exists() ? snapshot.data().amount : 0;
};
