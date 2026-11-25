
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";

import { Button } from "react-native-paper";
import { addTransaction } from "../transactionService";

export default function AddTransactionScreen({ onBack }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const expenseCategories = [
    "Food", "Travel", "Shopping",
    "Education", "Bills", "Others"
  ];

  const incomeCategories = [
    "Salary", "Scholarship", "Gift", "Other"
  ];

  const categories =
    type === "Expense" ? expenseCategories : incomeCategories;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "Expense" ? "Food" : "Salary");
  };

  const handleSave = async () => {
    setMessage("");
    setSuccess(false);

    if (!title.trim() || !amount.trim()) {
      setMessage("Please enter all details.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      await addTransaction(title, amount, type, category);

      setSuccess(true);
      setMessage("Transaction saved successfully!");

      setTitle("");
      setAmount("");

      console.log("Transaction saved to Firestore!");
    } catch (error) {
      console.log("Transaction error:", error);
      setMessage(error.message || "Unable to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Transaction</Text>
      <Text style={styles.subtitle}>
        Keep track of your money easily
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Transaction Title</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Shopping, Salary"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount (₹)</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#999"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Transaction Type</Text>

        <View style={styles.typeButtons}>
          <Button
            mode={type === "Income" ? "contained" : "outlined"}
            buttonColor={type === "Income" ? "#16803C" : "white"}
            textColor={type === "Income" ? "white" : "#16803C"}
            style={styles.typeButton}
            onPress={() => handleTypeChange("Income")}
          >
            Income
          </Button>

          <Button
            mode={type === "Expense" ? "contained" : "outlined"}
            buttonColor={type === "Expense" ? "#D32F2F" : "white"}
            textColor={type === "Expense" ? "white" : "#D32F2F"}
            style={styles.typeButton}
            onPress={() => handleTypeChange("Expense")}
          >
            Expense
          </Button>
        </View>

        <Text style={styles.label}>Select Category</Text>

        <View style={styles.categoryButtons}>
          {categories.map((item) => (
            <Button
              key={item}
              mode={category === item ? "contained" : "outlined"}
              buttonColor={category === item ? "#6541B8" : "white"}
              textColor={category === item ? "white" : "#6541B8"}
              style={styles.categoryButton}
              compact
              onPress={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </View>

        <Text style={styles.selected}>
          Selected: {type} - {category}
        </Text>

        {message !== "" && (
          <Text style={[
            styles.message,
            { color: success ? "#16803C" : "#D32F2F" }
          ]}>
            {message}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={loading}
          buttonColor="#6541B8"
          style={styles.saveButton}
          contentStyle={{ height: 50 }}
        >
          {loading ? "Saving..." : "Save Transaction"}
        </Button>

        {loading && (
          <ActivityIndicator
            color="#6541B8"
            style={{ marginTop: 12 }}
          />
        )}
      </View>

      <Button
        mode="outlined"
        textColor="#6541B8"
        style={styles.backButton}
        onPress={onBack}
      >
        Back to Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F5F1FF",
    padding: 22
  },
  heading: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginTop: 8,
    marginBottom: 25
  },
  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 20,
    elevation: 4
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: "#E4DCF4",
    padding: 14,
    borderRadius: 11,
    marginBottom: 20,
    color: "#222"
  },
  typeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22
  },
  typeButton: {
    flex: 1,
    borderRadius: 10
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5
  },
  categoryButton: {
    borderRadius: 10
  },
  selected: {
    textAlign: "center",
    color: "#6541B8",
    marginTop: 18,
    marginBottom: 20,
    fontWeight: "600"
  },
  message: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 15
  },
  saveButton: {
    borderRadius: 12
  },
  backButton: {
    borderColor: "#6541B8",
    borderRadius: 12,
    marginTop: 20
  }
});
