
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

// Add a new bill reminder
export const addBillReminder = async (
  title,
  amount,
  category,
  dueDate,
  dueTime
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (
    !title.trim() ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !category ||
    !dueDate ||
    !dueTime
  ) {
    throw new Error("Please enter valid reminder details.");
  }

  const selectedDateTime = new Date(
    `${dueDate}T${dueTime}:00`
  );

  if (
    Number.isNaN(selectedDateTime.getTime()) ||
    selectedDateTime.getTime() <= Date.now()
  ) {
    throw new Error(
      "Please select a future date and time."
    );
  }

  return await addDoc(
    collection(db, "billReminders"),
    {
      userId: user.uid,
      title: title.trim(),
      amount: Number(amount),
      category,
      dueDate,
      dueTime,
      isPaid: false,
      createdAt: serverTimestamp()
    }
  );
};

// Get reminders for the logged-in user
export const getBillReminders = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const q = query(
    collection(db, "billReminders"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
};

// Mark a reminder as paid
export const markReminderPaid = async (id) => {
  await updateDoc(doc(db, "billReminders", id), {
    isPaid: true
  });
};

// Delete a reminder
export const deleteBillReminder = async (id) => {
  await deleteDoc(doc(db, "billReminders", id));
};
