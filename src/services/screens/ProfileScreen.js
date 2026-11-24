
import React from "react";
import {
  View,
  Text,
  StyleSheet
} from "react-native";

import { Button } from "react-native-paper";
import { auth } from "../firebaseConfig";

export default function ProfileScreen({ onBack, onLogout }) {
  const email = auth.currentUser?.email || "Not available";

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>
      <Text style={styles.subtitle}>
        Manage your account details
      </Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>₹</Text>
        </View>

        <Text style={styles.name}>ExpenseX User</Text>

        <Text style={styles.label}>Email Address</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.status}>Account Active</Text>
        </View>
      </View>

      <Button
        mode="contained"
        buttonColor="#6541B8"
        style={styles.backButton}
        contentStyle={{ height: 48 }}
        onPress={onBack}
      >
        Back to Dashboard
      </Button>

      <Button
        mode="outlined"
        textColor="#D32F2F"
        style={styles.logoutButton}
        contentStyle={{ height: 48 }}
        onPress={onLogout}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5F1FF",
    padding: 22
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginTop: 8,
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    marginBottom: 25
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: "#6541B8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  avatarText: {
    color: "white",
    fontSize: 45,
    fontWeight: "bold"
  },
  name: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 25
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8
  },
  email: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20
  },
  statusBox: {
    backgroundColor: "#E5F5E9",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20
  },
  status: {
    color: "#16803C",
    fontWeight: "bold"
  },
  backButton: {
    borderRadius: 12
  },
  logoutButton: {
    borderColor: "#D32F2F",
    borderRadius: 12,
    marginTop: 12
  }
});
