
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from "react-native";

import { Button } from "react-native-paper";
import { getTransactions } from "../transactionHistoryService";

export default function StatisticsScreen({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.log("Statistics error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const income = transactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6541B8" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Expense Statistics</Text>
      <Text style={styles.subtitle}>
        Your financial overview at a glance
      </Text>

      <View style={[styles.card, styles.incomeCard]}>
        <Text style={styles.label}>Total Income</Text>
        <Text style={styles.amount}>
          ₹ {income.toFixed(2)}
        </Text>
        <Text style={styles.note}>Money received</Text>
      </View>

      <View style={[styles.card, styles.expenseCard]}>
        <Text style={styles.label}>Total Expenses</Text>
        <Text style={styles.amount}>
          ₹ {expenses.toFixed(2)}
        </Text>
        <Text style={styles.note}>Money spent</Text>
      </View>

      <View style={[styles.card, styles.balanceCard]}>
        <Text style={styles.label}>Remaining Balance</Text>
        <Text style={styles.amount}>
          ₹ {balance.toFixed(2)}
        </Text>
        <Text style={styles.note}>Your current balance</Text>
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>Total Transactions</Text>
        <Text style={styles.count}>
          {transactions.length}
        </Text>
      </View>

      <Button
        mode="contained"
        buttonColor="#6541B8"
        style={styles.button}
        contentStyle={{ height: 48 }}
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
    backgroundColor: "#F5F1FF",
    padding: 22,
    justifyContent: "center"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F1FF"
  },
  loadingText: {
    color: "#6541B8",
    marginTop: 12
  },
  heading: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },
  subtitle: {
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25
  },
  card: {
    padding: 20,
    borderRadius: 17,
    marginBottom: 15,
    elevation: 3
  },
  incomeCard: {
    backgroundColor: "#16803C"
  },
  expenseCard: {
    backgroundColor: "#D32F2F"
  },
  balanceCard: {
    backgroundColor: "#6541B8"
  },
  label: {
    color: "white",
    fontSize: 15,
    fontWeight: "600"
  },
  amount: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8
  },
  note: {
    color: "#FFFFFFCC",
    fontSize: 12,
    marginTop: 5
  },
  countCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 17,
    marginBottom: 20,
    elevation: 3
  },
  countLabel: {
    color: "#777",
    fontSize: 15
  },
  count: {
    color: "#38216D",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8
  },
  button: {
    borderRadius: 12
  }
});
