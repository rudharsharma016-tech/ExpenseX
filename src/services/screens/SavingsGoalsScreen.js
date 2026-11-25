
import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";

import {
  Button,
  TextInput,
  Card,
  ProgressBar
} from "react-native-paper";

import { useFocusEffect } from "@react-navigation/native";

import {
  addSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal
} from "../savingsGoalService";

export default function SavingsGoalsScreen({ onBack }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMoney, setSavingMoney] = useState(false);

  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load goals from Firebase
  const loadGoals = async () => {
    try {
      const data = await getSavingsGoals();
      setGoals(data);
      return true;
    } catch (error) {
      console.log("LOAD GOALS ERROR:", error);
      setErrorMessage(error.message || "Unable to load goals.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  // Create savings goal
  const handleAddGoal = async () => {
    console.log("CREATE GOAL BUTTON CLICKED");

    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a goal name.");
      return;
    }

    if (!targetAmount.trim()) {
      setErrorMessage("Please enter a target amount.");
      return;
    }

    const amount = Number(targetAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid target amount.");
      return;
    }

    try {
      setSaving(true);

      console.log("SAVING GOAL TO FIREBASE...");

      await addSavingsGoal(title, amount);

      console.log("GOAL CREATED SUCCESSFULLY");

      setTitle("");
      setTargetAmount("");

      const refreshed = await loadGoals();

      if (refreshed) {
        setSuccessMessage("Savings goal created successfully!");
      }
    } catch (error) {
      console.log("CREATE GOAL FIREBASE ERROR:", error);
      setErrorMessage(error.message || "Unable to create savings goal.");
    } finally {
      setSaving(false);
    }
  };

  // Open Add Money form
  const handleAddMoney = (goal) => {
    setSelectedGoalId(goal.id);
    setAddAmount("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Add money to a goal
  const saveAddedMoney = async (goal) => {
    setErrorMessage("");
    setSuccessMessage("");

    const amount = Number(addAmount);

    if (!addAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Enter a valid amount.");
      return;
    }

    const target = Number(goal.targetAmount);
    const saved = Number(goal.savedAmount);
    const remaining = target - saved;

    if (amount > remaining) {
      setErrorMessage(
        `You can add a maximum of ₹ ${remaining.toFixed(2)}.`
      );
      return;
    }

    try {
      setSavingMoney(true);

      await updateSavingsGoal(goal.id, saved + amount);

      setSelectedGoalId(null);
      setAddAmount("");

      await loadGoals();

      setSuccessMessage("Savings updated successfully!");
    } catch (error) {
      console.log("UPDATE SAVINGS ERROR:", error);
      setErrorMessage(error.message || "Unable to update savings.");
    } finally {
      setSavingMoney(false);
    }
  };

  // Delete a goal
  const handleDeleteGoal = (id) => {
    const performDelete = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        await deleteSavingsGoal(id);

        setSelectedGoalId(null);

        await loadGoals();

        setSuccessMessage("Savings goal deleted successfully!");
      } catch (error) {
        console.log("DELETE GOAL ERROR:", error);
        setErrorMessage(error.message || "Unable to delete goal.");
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this goal?"
      );

      if (confirmed) performDelete();
    } else {
      Alert.alert(
        "Delete Goal",
        "Are you sure you want to delete this savings goal?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: performDelete
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6541B8" />
        <Text style={styles.loadingText}>
          Loading savings goals...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Savings Goals</Text>

      <Text style={styles.subtitle}>
        Save money and achieve your dreams
      </Text>

      {/* CREATE GOAL FORM */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.sectionHeading}>
            Create New Savings Goal
          </Text>

          <Text style={styles.fieldLabel}>
            GOAL NAME
          </Text>

          <TextInput
            placeholder="Example: New Laptop"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            textColor="#241044"
            placeholderTextColor="#777777"
            style={styles.visibleInput}
            outlineColor="#8054D6"
            activeOutlineColor="#6541B8"
          />

          <Text style={styles.fieldLabel}>
            TARGET AMOUNT (₹)
          </Text>

          <TextInput
            placeholder="Example: 50000"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            textColor="#241044"
            placeholderTextColor="#777777"
            style={styles.visibleInput}
            outlineColor="#8054D6"
            activeOutlineColor="#6541B8"
          />

          <Button
            mode="contained"
            buttonColor="#6541B8"
            onPress={handleAddGoal}
            loading={saving}
            disabled={saving}
            style={styles.addButton}
            contentStyle={{ height: 52 }}
            labelStyle={styles.buttonLabel}
          >
            Create Savings Goal
          </Button>
        </Card.Content>
      </Card>

      {/* STATUS MESSAGES */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            {successMessage}
          </Text>
        </View>
      ) : null}

      {/* GOAL LIST */}
      <Text style={styles.sectionHeading}>
        My Savings Goals ({goals.length})
      </Text>

      {goals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No Savings Goals Yet
          </Text>

          <Text style={styles.emptyText}>
            Create your first goal and start saving!
          </Text>
        </View>
      ) : (
        goals.map((goal) => {
          const target = Number(goal.targetAmount) || 0;
          const saved = Number(goal.savedAmount) || 0;

          const progress =
            target > 0 ? Math.min(saved / target, 1) : 0;

          const remaining = Math.max(target - saved, 0);
          const completed = saved >= target;

          return (
            <Card key={goal.id} style={styles.goalCard}>
              <Card.Content>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>
                    {goal.title}
                  </Text>

                  {completed && (
                    <Text style={styles.completedBadge}>
                      COMPLETED
                    </Text>
                  )}
                </View>

                <View style={styles.amountBox}>
                  <View style={styles.amountColumn}>
                    <Text style={styles.amountLabel}>
                      TARGET AMOUNT
                    </Text>

                    <Text style={styles.targetAmount}>
                      ₹ {target.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.amountColumn}>
                    <Text style={styles.amountLabel}>
                      AMOUNT SAVED
                    </Text>

                    <Text style={styles.savedAmount}>
                      ₹ {saved.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  progress={progress}
                  color={completed ? "#16803C" : "#8054D6"}
                  style={styles.progressBar}
                />

                <Text style={styles.progressText}>
                  {(progress * 100).toFixed(1)}% completed
                </Text>

                <Text style={styles.remainingText}>
                  {completed
                    ? "Congratulations! Goal achieved."
                    : `Remaining: ₹ ${remaining.toLocaleString("en-IN")}`}
                </Text>

                {/* ADD MONEY FORM */}
                {selectedGoalId === goal.id && (
                  <View style={styles.addMoneyContainer}>
                    <Text style={styles.fieldLabel}>
                      AMOUNT TO ADD (₹)
                    </Text>

                    <TextInput
                      placeholder="Enter amount"
                      value={addAmount}
                      onChangeText={setAddAmount}
                      keyboardType="decimal-pad"
                      mode="outlined"
                      textColor="#241044"
                      style={styles.visibleInput}
                      outlineColor="#8054D6"
                      activeOutlineColor="#6541B8"
                    />

                    <Button
                      mode="contained"
                      buttonColor="#16803C"
                      onPress={() => saveAddedMoney(goal)}
                      loading={savingMoney}
                      disabled={savingMoney}
                      style={styles.saveMoneyButton}
                    >
                      Save Amount
                    </Button>

                    <Button
                      mode="text"
                      textColor="#777"
                      disabled={savingMoney}
                      onPress={() => {
                        setSelectedGoalId(null);
                        setAddAmount("");
                      }}
                    >
                      Cancel
                    </Button>
                  </View>
                )}

                {/* ACTION BUTTONS */}
                <View style={styles.actions}>
                  {!completed && (
                    <Button
                      mode="contained"
                      buttonColor="#6541B8"
                      onPress={() => handleAddMoney(goal)}
                      style={styles.actionButton}
                    >
                      Add Money
                    </Button>
                  )}

                  <Button
                    mode="outlined"
                    textColor="#D32F2F"
                    onPress={() => handleDeleteGoal(goal.id)}
                    style={styles.actionButton}
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}

      <Button
        mode="contained"
        buttonColor="#6541B8"
        onPress={onBack}
        style={styles.backButton}
        contentStyle={{ height: 50 }}
      >
        Back to Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F1FF"
  },

  container: {
    padding: 22,
    paddingBottom: 35
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
    fontSize: 29,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25
  },

  sectionHeading: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 16
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 9,
    marginTop: 9,
    letterSpacing: 0.4
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    marginBottom: 24,
    elevation: 3
  },

  visibleInput: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    fontSize: 17,
    minHeight: 58
  },

  addButton: {
    borderRadius: 11,
    marginTop: 8
  },

  buttonLabel: {
    fontSize: 15,
    fontWeight: "bold"
  },

  errorBox: {
    backgroundColor: "#FDECEC",
    padding: 13,
    borderRadius: 10,
    marginBottom: 16
  },

  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "600"
  },

  successBox: {
    backgroundColor: "#E8F5E9",
    padding: 13,
    borderRadius: 10,
    marginBottom: 16
  },

  successText: {
    color: "#16803C",
    fontSize: 14,
    fontWeight: "600"
  },

  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    marginBottom: 18,
    elevation: 3
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 17
  },

  goalTitle: {
    color: "#38216D",
    fontSize: 23,
    fontWeight: "bold",
    flexShrink: 1
  },

  completedBadge: {
    color: "#16803C",
    fontSize: 12,
    fontWeight: "bold"
  },

  amountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F1FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 12
  },

  amountColumn: {
    flex: 1,
    minWidth: 110
  },

  amountLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 7
  },

  targetAmount: {
    color: "#38216D",
    fontSize: 20,
    fontWeight: "bold"
  },

  savedAmount: {
    color: "#6541B8",
    fontSize: 20,
    fontWeight: "bold"
  },

  progressBar: {
    height: 12,
    borderRadius: 10,
    backgroundColor: "#E8E0F7"
  },

  progressText: {
    color: "#6541B8",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 10
  },

  remainingText: {
    color: "#666",
    fontSize: 14,
    marginTop: 7
  },

  addMoneyContainer: {
    marginTop: 18,
    padding: 14,
    backgroundColor: "#F5F1FF",
    borderRadius: 12
  },

  saveMoneyButton: {
    borderRadius: 9,
    marginTop: 5
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    gap: 10
  },

  actionButton: {
    borderRadius: 9
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 17,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2
  },

  emptyTitle: {
    color: "#38216D",
    fontSize: 18,
    fontWeight: "bold"
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14
  },

  backButton: {
    borderRadius: 12,
    marginTop: 15
  }
});
