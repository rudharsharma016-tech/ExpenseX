
import React, { useState, useCallback, useEffect, useRef } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import {
  Text,
  Button,
  Card,
  Divider,
  TextInput,
  ProgressBar
} from "react-native-paper";

import { useFocusEffect } from "@react-navigation/native";

import { logoutUser } from "../authService";
import { getTransactions } from "../transactionHistoryService";
import { saveBudget, getBudget } from "../budgetService";

export default function DashboardScreen({
  onLogout,
  onAddTransaction,
  onHistory,
  onStatistics,
  onProfile,
  onCurrency,
  onSavingsGoals,
  onBillReminders
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");

  const alertLevel = useRef({
    key: "",
    level: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [data, savedBudget] = await Promise.all([
        getTransactions(),
        getBudget()
      ]);

      setTransactions(data);
      setBudget(savedBudget);
      setBudgetInput(savedBudget > 0 ? String(savedBudget) : "");
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

  const now = new Date();

  const currentMonth =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlyExpenses = transactions
    .filter(item => {
      const date = item.createdAt?.toDate?.();

      if (!date) return false;

      const transactionMonth =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      return item.type === "Expense" &&
        transactionMonth === currentMonth;
    })
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const remainingBudget = budget - monthlyExpenses;

  const budgetPercentage = budget > 0
    ? (monthlyExpenses / budget) * 100
    : 0;

  const progress = budget > 0
    ? Math.min(monthlyExpenses / budget, 1)
    : 0;

  const progressColor = budgetPercentage >= 100
    ? "#FF647C"
    : budgetPercentage >= 75
      ? "#FFB45E"
      : "#B99AFF";

  // Budget alerts
  useEffect(() => {
    if (loading || budget <= 0) return;

    const key = `${currentMonth}-${budget}`;

    if (alertLevel.current.key !== key) {
      alertLevel.current = {
        key,
        level: 0
      };
    }

    if (
      budgetPercentage >= 100 &&
      alertLevel.current.level < 2
    ) {
      alertLevel.current.level = 2;

      Alert.alert(
        "🚨 Budget Limit Reached!",
        "You have reached your monthly budget."
      );

    } else if (
      budgetPercentage >= 75 &&
      alertLevel.current.level < 1
    ) {
      alertLevel.current.level = 1;

      Alert.alert(
        "⚠️ Budget Warning",
        "You have used 75% of your monthly budget!"
      );
    }
  }, [
    loading,
    budget,
    monthlyExpenses,
    budgetPercentage,
    currentMonth
  ]);

  const handleSaveBudget = async () => {
    const amount = Number(budgetInput);

    if (
      !budgetInput.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      Alert.alert(
        "Invalid Budget",
        "Please enter a valid budget amount."
      );
      return;
    }

    try {
      await saveBudget(amount);
      setBudget(amount);

      Alert.alert(
        "Success",
        "Monthly budget saved successfully!"
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onLogout();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.welcome}>WELCOME BACK!</Text>

          <Text variant="headlineMedium" style={styles.heading}>
            ExpenseX
          </Text>

          <Text style={styles.subtitle}>
            Manage your money smartly.
          </Text>
        </View>

        <Text style={styles.logo}>₹</Text>
      </View>

      {/* Balance */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balanceLabel}>
            TOTAL BALANCE
          </Text>

          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.balance}>
              ₹ {balance.toFixed(2)}
            </Text>
          )}

          <Text style={styles.balanceSubtitle}>
            Your financial overview
          </Text>
        </Card.Content>
      </Card>

      {/* Income and Expenses */}
      <View style={styles.row}>
        <Card style={[styles.smallCard, styles.incomeCard]}>
          <Card.Content style={styles.smallCardContent}>
            <Text style={styles.cardLabel}>
              ↑ Total Income
            </Text>

            <Text style={styles.cardAmount}>
              ₹ {income.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.smallCard, styles.expenseCard]}>
          <Card.Content style={styles.smallCardContent}>
            <Text style={styles.cardLabel}>
              ↓ Total Expenses
            </Text>

            <Text style={styles.cardAmount}>
              ₹ {expenses.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Monthly Budget */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Monthly Budget
      </Text>

      <Card style={styles.budgetCard}>
        <Card.Content style={styles.budgetContent}>

          <Text style={styles.budgetLabel}>
            Set your monthly spending limit
          </Text>

          {budget > 0 && (
            <View style={styles.budgetHighlight}>
              <Text style={styles.budgetSmallLabel}>
                YOUR MONTHLY BUDGET
              </Text>

              <Text style={styles.budgetTotal}>
                ₹ {budget.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
            </View>
          )}

          <TextInput
            label="Monthly Budget (₹)"
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="numeric"
            mode="outlined"
            style={styles.budgetInput}
            textColor="#F7F2FF"
            outlineColor="#66558A"
            activeOutlineColor="#B99AFF"
            theme={{
              colors: {
                onSurfaceVariant: "#BDB0D5"
              }
            }}
          />

          <Button
            mode="contained"
            onPress={handleSaveBudget}
            style={styles.budgetButton}
            contentStyle={styles.buttonContent}
            buttonColor="#9869E8"
            textColor="#FFFFFF"
          >
            Save Budget
          </Button>

          {budget > 0 && (
            <>
              <Divider style={styles.budgetDivider} />

              <Text style={styles.budgetLabel}>
                Monthly Expenses
              </Text>

              <Text style={styles.expenseAmount}>
                ₹ {monthlyExpenses.toFixed(2)}
              </Text>

              <ProgressBar
                progress={progress}
                color={progressColor}
                style={styles.progress}
              />

              <View style={styles.remainingBox}>
                <Text style={styles.remainingLabel}>
                  Remaining Budget
                </Text>

                <Text
                  style={[
                    styles.budgetAmount,
                    remainingBudget < 0 && styles.exceededAmount
                  ]}
                >
                  ₹ {remainingBudget.toFixed(2)}
                </Text>
              </View>

              <Text
                style={[
                  styles.budgetMessage,
                  {
                    color: progressColor,
                    fontWeight: "bold"
                  }
                ]}
              >
                {budgetPercentage >= 100
                  ? "🚨 Budget Limit Reached!"
                  : budgetPercentage >= 75
                    ? "⚠️ Warning! You have used 75% of your budget."
                    : "You are within your monthly budget."}
              </Text>

              <Text style={styles.budgetMessage}>
                {budgetPercentage.toFixed(1)}% of monthly budget used
              </Text>

              {remainingBudget < 0 && (
                <Text style={styles.extraSpent}>
                  Extra spent: ₹ {Math.abs(remainingBudget).toFixed(2)}
                </Text>
              )}
            </>
          )}

        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Transactions
        </Text>

        <Button
          mode="contained-tonal"
          compact
          onPress={onHistory}
          style={styles.viewAllButton}
          buttonColor="#33264B"
          textColor="#CDB8FF"
        >
          View All
        </Button>
      </View>

      <Card style={styles.listCard}>
        <Card.Content>

          {loading ? (
            <ActivityIndicator color="#B99AFF" />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>
              No transactions yet. Add your first transaction!
            </Text>
          ) : (
            transactions.slice(0, 4).map(item => (
              <View key={item.id}>
                <View style={styles.transaction}>

                  <View style={styles.transactionInfo}>
                    <Text
                      variant="titleMedium"
                      style={styles.transactionTitle}
                    >
                      {item.title}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={styles.transactionType}
                    >
                      {item.type}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: item.type === "Income"
                          ? "#65D99A"
                          : "#FF8294"
                      }
                    ]}
                  >
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

      {/* Quick Actions */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <Button
        mode="contained"
        style={styles.action}
        contentStyle={styles.actionContent}
        buttonColor="#9869E8"
        textColor="#FFFFFF"
        onPress={onAddTransaction}
      >
        + Add Transaction
      </Button>

      <Button
        mode="outlined"
        style={styles.action}
        contentStyle={styles.actionContent}
        textColor="#CDB8FF"
        onPress={onStatistics}
      >
        Statistics
      </Button>

      <Button
        mode="outlined"
        style={styles.action}
        contentStyle={styles.actionContent}
        textColor="#CDB8FF"
        onPress={onCurrency}
      >
        Currency Converter
      </Button>

      {/* Savings Goals */}
      <Button
        mode="outlined"
        icon="piggy-bank-outline"
        style={styles.action}
        contentStyle={styles.actionContent}
        textColor="#CDB8FF"
        onPress={onSavingsGoals}
      >
        Savings Goals
      </Button>

      {/* NEW: BILL & PAYMENT REMINDERS */}
      <Button
        mode="outlined"
        icon="calendar-clock"
        style={styles.action}
        contentStyle={styles.actionContent}
        textColor="#CDB8FF"
        onPress={onBillReminders}
      >
        Bill & Payment Reminders
      </Button>

      <Button
        mode="outlined"
        style={styles.action}
        contentStyle={styles.actionContent}
        textColor="#CDB8FF"
        onPress={onProfile}
      >
        My Profile
      </Button>

      <Button
        mode="text"
        textColor="#FF8294"
        style={styles.action}
        onPress={handleLogout}
      >
        Logout
      </Button>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#100B1F"
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 12
  },

  headerText: {
    flex: 1
  },

  welcome: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 5
  },

  heading: {
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5
  },

  subtitle: {
    color: "#A99ABF",
    fontSize: 13,
    marginTop: 5
  },

  logo: {
    backgroundColor: "#9869E8",
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "bold",
    padding: 13,
    borderRadius: 16,
    overflow: "hidden"
  },

  balanceCard: {
    backgroundColor: "#291A46",
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#513675",
    elevation: 5
  },

  balanceLabel: {
    color: "#CDB8FF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5
  },

  balance: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "bold",
    marginVertical: 14,
    flexShrink: 1
  },

  balanceSubtitle: {
    color: "#B5A5CE",
    fontSize: 13
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18
  },

  smallCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 17,
    elevation: 3
  },

  smallCardContent: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },

  incomeCard: {
    backgroundColor: "#164536",
    borderWidth: 1,
    borderColor: "#267457"
  },

  expenseCard: {
    backgroundColor: "#512638",
    borderWidth: 1,
    borderColor: "#85405A"
  },

  cardLabel: {
    color: "#F5EFFF",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1
  },

  cardAmount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    flexShrink: 1
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8
  },

  sectionTitle: {
    color: "#E8DCFF",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 12,
    marginTop: 16,
    flexShrink: 1
  },

  viewAllButton: {
    marginBottom: 8,
    borderRadius: 10
  },

  budgetCard: {
    borderRadius: 19,
    backgroundColor: "#1D1530",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#493263",
    elevation: 4
  },

  budgetContent: {
    paddingVertical: 12
  },

  budgetLabel: {
    color: "#E4D8F5",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 12
  },

  budgetHighlight: {
    backgroundColor: "#302044",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#594174"
  },

  budgetSmallLabel: {
    color: "#BDA9D8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
    letterSpacing: 0.5
  },

  budgetTotal: {
    color: "#D3B9FF",
    fontSize: 27,
    fontWeight: "bold",
    flexShrink: 1
  },

  budgetInput: {
    marginBottom: 12,
    backgroundColor: "#251B37"
  },

  budgetButton: {
    borderRadius: 12
  },

  buttonContent: {
    minHeight: 46
  },

  budgetDivider: {
    marginVertical: 18,
    backgroundColor: "#49375F"
  },

  expenseAmount: {
    color: "#FF8294",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 10
  },

  progress: {
    height: 12,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 12,
    backgroundColor: "#3B2B50"
  },

  remainingBox: {
    backgroundColor: "#302044",
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#594174"
  },

  remainingLabel: {
    color: "#BDA9D8",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6
  },

  budgetAmount: {
    color: "#D3B9FF",
    fontWeight: "bold",
    fontSize: 24,
    flexShrink: 1
  },

  exceededAmount: {
    color: "#FF8294"
  },

  extraSpent: {
    color: "#FF8294",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10
  },

  budgetMessage: {
    color: "#BDA9D8",
    marginTop: 12,
    lineHeight: 20
  },

  listCard: {
    borderRadius: 18,
    backgroundColor: "#1D1530",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#493263",
    elevation: 4
  },

  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 13,
    backgroundColor: "#302044",
    borderRadius: 13,
    marginVertical: 6,
    gap: 8
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0
  },

  transactionTitle: {
    color: "#F4ECFF",
    fontWeight: "bold",
    flexShrink: 1
  },

  transactionType: {
    color: "#BDA9D8",
    marginTop: 4
  },

  transactionAmount: {
    fontWeight: "bold",
    fontSize: 14,
    flexShrink: 1,
    maxWidth: "48%",
    textAlign: "right"
  },

  emptyText: {
    padding: 15,
    color: "#BDA9D8",
    textAlign: "center"
  },

  divider: {
    marginVertical: 5,
    backgroundColor: "#49375F"
  },

  action: {
    marginVertical: 7,
    borderRadius: 12,
    borderColor: "#76559C"
  },

  actionContent: {
    minHeight: 43
  }

});
