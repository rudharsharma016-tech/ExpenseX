
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { Button } from "react-native-paper";
import { registerUser } from "../authService";

export default function RegistrationScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(email.trim(), password);
      console.log("Registered user:", result.user.uid);
      Alert.alert("Success", "Account created successfully!");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log("Registration error:", error.code, error.message);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "Please choose a stronger password.");
      } else {
        Alert.alert("Registration Failed", "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logo}>₹</Text>
      </View>

      <Text style={styles.title}>ExpenseX</Text>
      <Text style={styles.subtitle}>Create Account</Text>
      <Text style={styles.description}>
        Start managing your money today.
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Register Now</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 6 characters"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
          contentStyle={{ height: 50 }}
          buttonColor="#6541B8"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {loading && (
          <ActivityIndicator
            color="#6541B8"
            style={{ marginTop: 12 }}
          />
        )}
      </View>

      <Text style={styles.footer}>
        Secure and simple expense management
      </Text>
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
  logoCircle: {
    width: 85,
    height: 85,
    borderRadius: 25,
    backgroundColor: "#6541B8",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  logo: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold"
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#29213D",
    textAlign: "center",
    marginTop: 20
  },
  description: {
    color: "#777",
    textAlign: "center",
    marginTop: 7,
    marginBottom: 25
  },
  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 20,
    elevation: 4
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38216D",
    marginBottom: 22
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 7
  },
  input: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: "#E4DCF4",
    padding: 14,
    borderRadius: 11,
    marginBottom: 18,
    color: "#222"
  },
  button: {
    borderRadius: 12,
    marginTop: 8
  },
  footer: {
    textAlign: "center",
    color: "#888",
    marginTop: 25,
    fontSize: 12
  }
});
