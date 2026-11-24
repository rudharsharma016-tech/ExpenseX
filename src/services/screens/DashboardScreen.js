
import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import {
  Text,
  Button,
  Card,
  Divider
} from "react-native-paper";

import { useFocusEffect } from "@react-navigation/native";

import { logoutUser } from "../authService";
import { getTransactions } from "../transactionHistoryService";

export default function DashboardScreen({
  onLogout,
  onAddTransaction,
  onHistory,
  onStatistics,
  onProfile,
  onCurrency
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.log("Dashboard error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const income = transactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;

  const handleLogout = async () => {
    try {
      await logoutUser();
      onLogout();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="bodyMedium">Welcome back!</Text>
          <Text variant="headlineMedium" style={styles.heading}>
            ExpenseX
          </Text>
        </View>
        <Text style={styles.logo}>₹</Text>
      </View>

      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.whiteText}>Total Balance</Text>

          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.balance}>
              ₹ {balance.toFixed(2)}
            </Text>
          )}

          <Text style={styles.whiteText}>
            Your financial overview
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.row}>
        <Card style={[styles.smallCard, styles.incomeCard]}>
          <Card.Content>
            <Text style={styles.whiteText}>Total Income</Text>
            <Text style={styles.cardAmount}>
              ₹ {income.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.smallCard, styles.expenseCard]}>
          <Card.Content>
            <Text style={styles.whiteText}>Total Expenses</Text>
            <Text style={styles.cardAmount}>
              ₹ {expenses.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Transactions
        </Text>
        <Button
          mode="contained-tonal"
          compact
          onPress={onHistory}
        >
          View All
        </Button>
      </View>

      <Card style={styles.listCard}>
        <Card.Content>
          {loading ? (
            <ActivityIndicator />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>
              No transactions yet. Add your first transaction!
            </Text>
          ) : (
            transactions.slice(0, 4).map(item => (
              <View key={item.id}>
                <View style={styles.transaction}>
                  <View style={styles.transactionInfo}>
                    <Text variant="titleMedium" style={styles.transactionTitle}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionType}>
                      {item.type}
                    </Text>
                  </View>

                  <Text style={[
                    styles.transactionAmount,
                    {
                      color: item.type === "Income"
                        ? "#16803C"
                        : "#D32F2F"
                    }
                  ]}>
                    {item.type === "Income" ? "+" : "-"} ₹
                    {Number(item.amount).toFixed(2)}
                  </Text>
                </View>
                <Divider style={styles.divider} />
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <Button mode="contained" style={styles.action}
        onPress={onAddTransaction}>
        + Add Transaction
      </Button>

      <Button mode="outlined" style={styles.action}
        onPress={onStatistics}>
        Statistics
      </Button>

      <Button mode="outlined" style={styles.action}
        onPress={onCurrency}>
        Currency Converter
      </Button>

      <Button mode="outlined" style={styles.action}
        onPress={onProfile}>
        My Profile
      </Button>

      <Button mode="text" textColor="#FF7043"
        style={styles.action} onPress={handleLogout}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F8",
    padding: 18
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15
  },
  heading: {
    fontWeight: "bold",
    color: "#17152F"
  },
  logo: {
    backgroundColor: "#762FE5",
    color: "white",
    fontSize: 25,
    padding: 12,
    borderRadius: 15
  },
  balanceCard: {
    backgroundColor: "#21164A",
    borderRadius: 18,
    marginBottom: 15
  },
  whiteText: {
    color: "white",
    fontWeight: "500"
  },
  balance: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 12
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22
  },
  smallCard: {
    flex: 1,
    borderRadius: 15
  },
  incomeCard: {
    backgroundColor: "#16803C"
  },
  expenseCard: {
    backgroundColor: "#D32F2F"
  },
  cardAmount: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    color: "#17152F",
    fontWeight: "bold",
    fontSize: 21,
    marginBottom: 15,
    marginTop: 15
  },
  listCard: {
    borderRadius: 15,
    backgroundColor: "white",
    marginBottom: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5DDF5"
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F4F0FF",
    borderRadius: 12,
    marginVertical: 5
  },
  transactionInfo: {
    flex: 1
  },
  transactionTitle: {
    color: "#17152F",
    fontWeight: "bold"
  },
  transactionType: {
    color: "#686477",
    marginTop: 4
  },
  transactionAmount: {
    fontWeight: "bold",
    fontSize: 15
  },
  emptyText: {
    padding: 15,
    color: "#686477",
    textAlign: "center"
  },
  divider: {
    marginVertical: 5
  },
  action: {
    marginVertical: 5,
    borderRadius: 10
  }
});
