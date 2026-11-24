
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";

import { Button } from "react-native-paper";
import {
  getTransactions,
  updateTransaction
} from "../transactionHistoryService";

export default function TransactionHistoryScreen({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [saving, setSaving] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.log("History error:", err);
      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const startEditing = (item) => {
    setEditing(item);
    setTitle(item.title);
    setAmount(String(item.amount));
    setType(item.type);
  };

  const handleUpdate = async () => {
    if (!title.trim() || !amount.trim() ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Invalid Details", "Enter a valid title and amount.");
      return;
    }

    try {
      setSaving(true);
      await updateTransaction(editing.id, title, amount, type);
      setEditing(null);
      await loadTransactions();
      Alert.alert("Success", "Transaction updated successfully!");
    } catch (err) {
      console.log("Update error:", err);
      Alert.alert("Error", "Unable to update transaction.");
    } finally {
      setSaving(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.details}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.date}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleDateString()
              : "Date unavailable"}
          </Text>
        </View>

        <Text style={{
          color: item.type === "Income" ? "#16803C" : "#D32F2F",
          fontWeight: "bold"
        }}>
          {item.type === "Income" ? "+" : "-"} ₹{item.amount}
        </Text>
      </View>

      <Text style={styles.type}>{item.type}</Text>

      <Button
        mode="outlined"
        textColor="#6541B8"
        onPress={() => startEditing(item)}
      >
        Edit
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Transaction History</Text>
      <Text style={styles.subtitle}>
        View and manage your transactions
      </Text>

      {editing ? (
        <View style={styles.form}>
          <Text style={styles.formHeading}>Edit Transaction</Text>

          <TextInput
            style={styles.input}
            placeholder="Transaction title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Transaction Type</Text>

          <View style={styles.row}>
            <Button
              mode={type === "Income" ? "contained" : "outlined"}
              buttonColor="#16803C"
              onPress={() => setType("Income")}
            >
              Income
            </Button>

            <Button
              mode={type === "Expense" ? "contained" : "outlined"}
              buttonColor="#D32F2F"
              onPress={() => setType("Expense")}
            >
              Expense
            </Button>
          </View>

          <Button
            mode="contained"
            buttonColor="#6541B8"
            style={styles.actionButton}
            onPress={handleUpdate}
            loading={saving}
            disabled={saving}
          >
            Save Changes
          </Button>

          <Button
            mode="outlined"
            textColor="#6541B8"
            onPress={() => setEditing(null)}
            disabled={saving}
          >
            Cancel
          </Button>
        </View>
      ) : loading ? (
        <ActivityIndicator
          size="large"
          color="#6541B8"
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : transactions.length === 0 ? (
        <Text style={styles.empty}>No transactions found yet.</Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 15 }}
        />
      )}

      {!editing && (
        <Button
          mode="contained"
          buttonColor="#6541B8"
          style={styles.actionButton}
          onPress={loadTransactions}
          disabled={loading}
        >
          Refresh Transactions
        </Button>
      )}

      <Button
        mode="outlined"
        textColor="#6541B8"
        style={styles.actionButton}
        onPress={onBack}
      >
        Back to Dashboard
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1FF",
    padding: 20
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38216D"
  },
  subtitle: {
    color: "#777",
    marginBottom: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  details: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38216D"
  },
  date: {
    color: "#888",
    marginTop: 5
  },
  type: {
    color: "#6541B8",
    marginVertical: 8
  },
  form: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12
  },
  formHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 15
  },
  input: {
    backgroundColor: "#F5F1FF",
    borderWidth: 1,
    borderColor: "#DDD2F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  label: {
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 10
  },
  actionButton: {
    marginTop: 12
  },
  error: {
    color: "red",
    textAlign: "center"
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777"
  }
});
