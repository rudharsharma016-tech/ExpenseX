
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

  // Search and filter states
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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

  // Apply search and filter
  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesFilter =
      filter === "All" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  const startEditing = (item) => {
    setEditing(item);
    setTitle(item.title);
    setAmount(String(item.amount));
    setType(item.type);
  };

  const handleUpdate = async () => {
    if (
      !title.trim() ||
      !amount.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      Alert.alert(
        "Invalid Details",
        "Enter a valid title and amount."
      );
      return;
    }

    try {
      setSaving(true);

      await updateTransaction(
        editing.id,
        title,
        amount,
        type
      );

      setEditing(null);
      await loadTransactions();

      Alert.alert(
        "Success",
        "Transaction updated successfully!"
      );
    } catch (err) {
      console.log("Update error:", err);
      Alert.alert(
        "Error",
        "Unable to update transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.transactionRow}>
        <View style={styles.details}>
          <Text style={styles.name}>{item.title}</Text>

          <Text style={styles.date}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleDateString()
              : "Date unavailable"}
          </Text>
        </View>

        <Text
          style={[
            styles.amount,
            {
              color: item.type === "Income"
                ? "#16803C"
                : "#D32F2F"
            }
          ]}
        >
          {item.type === "Income" ? "+" : "-"} ₹
          {Number(item.amount).toFixed(2)}
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
      <Text style={styles.heading}>
        Transaction History
      </Text>

      <Text style={styles.subtitle}>
        View and manage your transactions
      </Text>

      {editing ? (
        <View style={styles.form}>
          <Text style={styles.formHeading}>
            Edit Transaction
          </Text>

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

          <Text style={styles.label}>
            Transaction Type
          </Text>

          <View style={styles.filterRow}>
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
      ) : (
        <>
          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
          />

          {/* Filters */}
          <Text style={styles.label}>
            Filter Transactions
          </Text>

          <View style={styles.filterRow}>
            {["All", "Income", "Expense"].map(option => (
              <Button
                key={option}
                mode={filter === option ? "contained" : "outlined"}
                buttonColor={
                  filter === option ? "#6541B8" : undefined
                }
                textColor={
                  filter === option ? "white" : "#6541B8"
                }
                compact
                onPress={() => setFilter(option)}
                style={styles.filterButton}
              >
                {option}
              </Button>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6541B8"
              style={styles.loader}
            />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : filteredTransactions.length === 0 ? (
            <Text style={styles.empty}>
              {transactions.length === 0
                ? "No transactions found yet."
                : "No matching transactions found."}
            </Text>
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}

          <Button
            mode="contained"
            buttonColor="#6541B8"
            style={styles.actionButton}
            onPress={loadTransactions}
            disabled={loading}
          >
            Refresh Transactions
          </Button>
        </>
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
    marginBottom: 18
  },

  searchInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD2F5",
    borderRadius: 10,
    padding: 13,
    marginBottom: 15
  },

  label: {
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 10
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15
  },

  filterButton: {
    borderRadius: 8
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },

  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },

  details: {
    flex: 1,
    minWidth: 0
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

  amount: {
    fontWeight: "bold",
    fontSize: 14,
    flexShrink: 1,
    maxWidth: "48%",
    textAlign: "right"
  },

  type: {
    color: "#6541B8",
    marginVertical: 8
  },

  form: {
    backgroundColor: "white",
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

  actionButton: {
    marginTop: 12
  },

  listContent: {
    paddingBottom: 15
  },

  loader: {
    marginTop: 35
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 25
  },

  empty: {
    textAlign: "center",
    marginTop: 35,
    marginBottom: 20,
    color: "#777"
  }
});
