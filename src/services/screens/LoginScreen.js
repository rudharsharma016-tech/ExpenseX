
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
import { loginUser } from "../authService";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");
    setSuccess(false);

    if (!email.trim() || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(email.trim(), password);
      console.log("Login successful:", result.user.uid);

      setSuccess(true);
      setMessage("Welcome to ExpenseX! Login successful.");

      setTimeout(() => {
        onLogin();
      }, 1500);

    } catch (error) {
      console.log("Login error:", error.code, error.message);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setMessage("Incorrect email or password.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Too many attempts. Try again later.");
      } else {
        setMessage("Login failed. Please try again.");
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
      <Text style={styles.subtitle}>Welcome Back!</Text>
      <Text style={styles.description}>
        Manage your money. Track your expenses.
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Login to your account</Text>

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
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

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
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#6541B8"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {loading && (
          <ActivityIndicator color="#6541B8" style={{ marginTop: 12 }} />
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
  buttonContent: {
    height: 50
  },
  message: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold"
  },
  footer: {
    textAlign: "center",
    color: "#888",
    marginTop: 25,
    fontSize: 12
  }
});
