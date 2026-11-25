
import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";

import {
  Button,
  TextInput,
  Card,
  Menu,
  Divider
} from "react-native-paper";

import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  addBillReminder,
  getBillReminders,
  markReminderPaid,
  deleteBillReminder
} from "../billReminderService";

const categories = [
  "Electricity",
  "Mobile Recharge",
  "Internet",
  "Rent",
  "Water Bill",
  "Other"
];

export default function BillRemindersScreen({ onBack }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Electricity");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Platform-compatible message
  const showMessage = (heading, message) => {
    if (Platform.OS === "web") {
      window.alert(`${heading}\n\n${message}`);
    } else {
      Alert.alert(heading, message);
    }
  };

  // Load reminders
  const loadReminders = async () => {
    try {
      const data = await getBillReminders();

      data.sort((a, b) => {
        const first = `${a.dueDate} ${a.dueTime || "00:00"}`;
        const second = `${b.dueDate} ${b.dueTime || "00:00"}`;

        return first.localeCompare(second);
      });

      setReminders(data);
    } catch (error) {
      showMessage("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  // Format date
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Format time
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  // Display date
  const displayDate = (dateString) => {
    if (!dateString) return "Not selected";

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Display time
  const displayTime = (timeString) => {
    if (!timeString) return "Not selected";

    const [hours, minutes] = timeString.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // Check future date and time
  const isFutureDateTime = (date, time) => {
    if (!date || !time) return false;

    const selectedDateTime = new Date(`${date}T${time}:00`);

    return (
      !Number.isNaN(selectedDateTime.getTime()) &&
      selectedDateTime.getTime() > Date.now()
    );
  };

  // Date picker
  const handleDateChange = (event, date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed" || !date) return;

    setSelectedDate(date);
    setDueDate(formatDate(date));
  };

  // Time picker
  const handleTimeChange = (event, time) => {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }

    if (event?.type === "dismissed" || !time) return;

    setSelectedTime(time);
    setDueTime(formatTime(time));
  };

  // Add reminder
  const handleAddReminder = async () => {
    if (saving) return;

    if (
      !title.trim() ||
      !amount.trim() ||
      !dueDate ||
      !dueTime
    ) {
      showMessage(
        "Missing Details",
        "Please enter the bill name, amount, date and time."
      );
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      showMessage(
        "Invalid Amount",
        "Please enter a valid amount."
      );
      return;
    }

    if (!isFutureDateTime(dueDate, dueTime)) {
      showMessage(
        "Invalid Date or Time",
        "Please select a future date and time."
      );
      return;
    }

    try {
      setSaving(true);

      await addBillReminder(
        title.trim(),
        amount,
        category,
        dueDate,
        dueTime
      );

      setTitle("");
      setAmount("");
      setCategory("Electricity");
      setDueDate("");
      setDueTime("");
      setSelectedDate(new Date());
      setSelectedTime(new Date());

      await loadReminders();

      showMessage(
        "Success",
        "Bill reminder added successfully!"
      );
    } catch (error) {
      showMessage(
        "Error",
        error.message || "Unable to add reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark reminder as paid
  const handleMarkPaid = async (id) => {
    try {
      await markReminderPaid(id);
      await loadReminders();

      showMessage(
        "Success",
        "Reminder marked as paid."
      );
    } catch (error) {
      showMessage("Error", error.message);
    }
  };

  // Delete reminder
  const handleDelete = async (id) => {
    const confirmDelete = async () => {
      try {
        await deleteBillReminder(id);
        await loadReminders();

        showMessage(
          "Success",
          "Reminder deleted successfully."
        );
      } catch (error) {
        showMessage("Error", error.message);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this reminder?")) {
        await confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Reminder",
        "Are you sure you want to delete this reminder?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: confirmDelete
          }
        ]
      );
    }
  };

  // Reminder status
  const getStatus = (reminder) => {
    if (reminder.isPaid) return "Paid";

    const today = formatDate(new Date());
    const now = new Date();

    if (reminder.dueDate < today) return "Overdue";

    if (reminder.dueDate === today) {
      const reminderTime = reminder.dueTime || "23:59";
      const currentTime = formatTime(now);

      if (reminderTime < currentTime) return "Overdue";

      return "Due Today";
    }

    return "Upcoming";
  };

  const pendingCount = reminders.filter(
    item => !item.isPaid
  ).length;

  const paidCount = reminders.filter(
    item => item.isPaid
  ).length;

  const today = formatDate(new Date());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Bill & Payment Reminders
        </Text>

        <Text style={styles.subtitle}>
          Manage your bills and payment deadlines
        </Text>
      </View>

      {/* Add Reminder Form */}
      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Text style={styles.sectionTitle}>
            Add New Reminder
          </Text>

          <TextInput
            label="Bill Name"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            outlineColor="#514477"
            activeOutlineColor="#A78BFA"
            textColor="#FFFFFF"
            theme={{
              colors: {
                onSurfaceVariant: "#C4B5FD"
              }
            }}
          />

          <TextInput
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor="#514477"
            activeOutlineColor="#A78BFA"
            textColor="#FFFFFF"
            theme={{
              colors: {
                onSurfaceVariant: "#C4B5FD"
              }
            }}
          />

          <Text style={styles.fieldLabel}>
            Bill Category
          </Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                contentStyle={styles.categoryContent}
                style={styles.categoryButton}
                textColor="#FFFFFF"
                onPress={() => setMenuVisible(true)}
              >
                {category}
              </Button>
            }
          >
            {categories.map(item => (
              <Menu.Item
                key={item}
                title={item}
                onPress={() => {
                  setCategory(item);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>

          {/* Due Date */}
          <Text style={styles.fieldLabel}>
            Payment Due Date
          </Text>

          {Platform.OS === "web" ? (
            <View style={styles.webDateBox}>
              {React.createElement("input", {
                type: "date",
                value: dueDate,
                min: today,
                onChange: (event) => {
                  const value = event.target.value;
                  setDueDate(value);

                  if (value) {
                    const [year, month, day] = value
                      .split("-")
                      .map(Number);

                    setSelectedDate(
                      new Date(year, month - 1, day)
                    );
                  }
                },
                style: {
                  width: "100%",
                  height: 48,
                  padding: "0 12px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "1px solid #8064B5",
                  backgroundColor: "#29213E",
                  color: "#FFFFFF",
                  boxSizing: "border-box",
                  colorScheme: "dark"
                }
              })}
            </View>
          ) : (
            <>
              <Button
                mode="outlined"
                icon="calendar-month"
                style={styles.categoryButton}
                contentStyle={styles.categoryContent}
                textColor="#FFFFFF"
                onPress={() => setShowDatePicker(true)}
              >
                {dueDate
                  ? displayDate(dueDate)
                  : "Select Due Date"}
              </Button>

              {showDatePicker && (
                <View style={styles.datePickerBox}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    minimumDate={new Date()}
                    display={
                      Platform.OS === "ios" ? "spinner" : "default"
                    }
                    onChange={handleDateChange}
                  />

                  {Platform.OS === "ios" && (
                    <Button
                      mode="contained"
                      onPress={() => setShowDatePicker(false)}
                    >
                      Confirm Date
                    </Button>
                  )}
                </View>
              )}
            </>
          )}

          <Text style={styles.selectedDate}>
            Selected Date: {displayDate(dueDate)}
          </Text>

          {/* Reminder Time */}
          <Text style={styles.fieldLabel}>
            Reminder Time
          </Text>

          {Platform.OS === "web" ? (
            <View style={styles.webDateBox}>
              {React.createElement("input", {
                type: "time",
                value: dueTime,
                onChange: (event) => {
                  setDueTime(event.target.value);
                },
                style: {
                  width: "100%",
                  height: 48,
                  padding: "0 12px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "1px solid #8064B5",
                  backgroundColor: "#29213E",
                  color: "#FFFFFF",
                  boxSizing: "border-box",
                  colorScheme: "dark"
                }
              })}
            </View>
          ) : (
            <>
              <Button
                mode="outlined"
                icon="clock-outline"
                style={styles.categoryButton}
                contentStyle={styles.categoryContent}
                textColor="#FFFFFF"
                onPress={() => setShowTimePicker(true)}
              >
                {dueTime
                  ? displayTime(dueTime)
                  : "Select Reminder Time"}
              </Button>

              {showTimePicker && (
                <View style={styles.datePickerBox}>
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display={
                      Platform.OS === "ios" ? "spinner" : "default"
                    }
                    onChange={handleTimeChange}
                  />

                  {Platform.OS === "ios" && (
                    <Button
                      mode="contained"
                      onPress={() => setShowTimePicker(false)}
                    >
                      Confirm Time
                    </Button>
                  )}
                </View>
              )}
            </>
          )}

          <Text style={styles.selectedDate}>
            Selected Time: {displayTime(dueTime)}
          </Text>

          {/* Add Reminder Button */}
          <Button
            mode="contained"
            icon="plus-circle"
            loading={saving}
            disabled={saving}
            onPress={handleAddReminder}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            buttonColor="#7C3AED"
            textColor="#FFFFFF"
          >
            {saving ? "Adding Reminder..." : "Add Reminder"}
          </Button>
        </Card.Content>
      </Card>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, styles.pendingCard]}>
          <Card.Content>
            <Text style={styles.summaryNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending Bills
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.paidCard]}>
          <Card.Content>
            <Text style={styles.summaryNumber}>
              {paidCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Paid Bills
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Reminder List */}
      <Text style={styles.listHeading}>
        Your Reminders
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#A78BFA"
          style={styles.loader}
        />
      ) : reminders.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              No reminders added yet.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        reminders.map(item => {
          const status = getStatus(item);

          return (
            <Card key={item.id} style={styles.reminderCard}>
              <Card.Content>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderIcon}>
                    <Text style={styles.iconText}>₹</Text>
                  </View>

                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.categoryText}>
                      {item.category}
                    </Text>
                  </View>

                  <Text style={styles.amountText}>
                    ₹{Number(item.amount).toFixed(2)}
                  </Text>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.detailText}>
                  Due Date: {displayDate(item.dueDate)}
                </Text>

                <Text style={styles.detailText}>
                  Reminder Time: {displayTime(item.dueTime)}
                </Text>

                <Text
                  style={[
                    styles.status,
                    status === "Paid"
                      ? styles.paidStatus
                      : status === "Overdue"
                      ? styles.overdueStatus
                      : styles.pendingStatus
                  ]}
                >
                  {status}
                </Text>

                {!item.isPaid && (
                  <Button
                    mode="contained"
                    icon="check-circle"
                    onPress={() => handleMarkPaid(item.id)}
                    style={styles.paidButton}
                    buttonColor="#15803D"
                  >
                    Mark as Paid
                  </Button>
                )}

                <Button
                  mode="outlined"
                  icon="delete"
                  textColor="#F87171"
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  Delete Reminder
                </Button>
              </Card.Content>
            </Card>
          );
        })
      )}

      {/* Back Button */}
      <Button
        mode="outlined"
        icon="arrow-left"
        onPress={onBack}
        textColor="#C4B5FD"
        style={styles.backButton}
      >
        Back to Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12101B"
  },

  content: {
    padding: 18,
    paddingBottom: 45,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center"
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center"
  },

  subtitle: {
    color: "#B8AFCB",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center"
  },

  formCard: {
    backgroundColor: "#211B32",
    borderRadius: 16,
    marginBottom: 22,
    elevation: 4
  },

  formContent: {
    padding: 18
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 22
  },

  input: {
    width: "100%",
    marginBottom: 18,
    backgroundColor: "#302743"
  },

  fieldLabel: {
    color: "#DDD2F7",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10
  },

  categoryButton: {
    width: "100%",
    borderColor: "#8064B5",
    borderRadius: 9,
    marginBottom: 22
  },

  categoryContent: {
    height: 48,
    flexDirection: "row-reverse",
    justifyContent: "space-between"
  },

  webDateBox: {
    width: "100%",
    marginBottom: 12
  },

  datePickerBox: {
    alignItems: "center",
    marginBottom: 15
  },

  selectedDate: {
    color: "#C4B5FD",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 3
  },

  addButton: {
    borderRadius: 9,
    marginTop: 5
  },

  addButtonContent: {
    height: 50
  },

  summaryRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28
  },

  summaryCard: {
    flex: 1,
    borderRadius: 13
  },

  pendingCard: {
    backgroundColor: "#342A1C"
  },

  paidCard: {
    backgroundColor: "#17352A"
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center"
  },

  summaryLabel: {
    color: "#E5E1EB",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5
  },

  listHeading: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 16
  },

  reminderCard: {
    backgroundColor: "#211B32",
    borderRadius: 14,
    marginBottom: 15
  },

  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },

  reminderIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#4C3479",
    alignItems: "center",
    justifyContent: "center"
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold"
  },

  reminderInfo: {
    flex: 1
  },

  reminderTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold"
  },

  categoryText: {
    color: "#B9A7DE",
    fontSize: 13,
    marginTop: 4
  },

  amountText: {
    color: "#C4B5FD",
    fontSize: 16,
    fontWeight: "bold"
  },

  divider: {
    backgroundColor: "#514466",
    marginVertical: 16
  },

  detailText: {
    color: "#E4DDEE",
    fontSize: 14,
    marginBottom: 10
  },

  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 14
  },

  paidStatus: {
    color: "#4ADE80"
  },

  overdueStatus: {
    color: "#F87171"
  },

  pendingStatus: {
    color: "#FBBF24"
  },

  paidButton: {
    marginBottom: 10,
    borderRadius: 8
  },

  deleteButton: {
    borderColor: "#F87171",
    borderRadius: 8
  },

  emptyCard: {
    backgroundColor: "#211B32",
    borderRadius: 12
  },

  emptyText: {
    color: "#C4B5FD",
    textAlign: "center",
    fontSize: 15,
    padding: 12
  },

  loader: {
    marginVertical: 25
  },

  backButton: {
    marginTop: 24,
    borderColor: "#8064B5",
    borderRadius: 9
  }
});
