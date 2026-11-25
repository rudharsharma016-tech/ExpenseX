
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { loginUser } from "../authService";

export default function LoginScreen({ onLogin, onRegister }) {
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>₹</Text>
        </View>

        <Text style={styles.title}>ExpenseX</Text>
        <Text style={styles.subtitle}>Welcome Back!</Text>
        <Text style={styles.description}>
          Manage your money. Track your expenses.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Login to your account</Text>
        <Text style={styles.headingDescription}>
          Enter your details to continue
        </Text>

        <Text style={styles.label}>Email Address</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email-outline"
            size={21}
            color="#7654B8"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#A49BB5"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.label}>Password</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={21}
            color="#7654B8"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#A49BB5"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {message !== "" && (
          <Text
            style={[
              styles.message,
              { color: success ? "#16803C" : "#D32F2F" }
            ]}
          >
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
          icon="login"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {loading && (
          <ActivityIndicator color="#6541B8" style={{ marginTop: 12 }} />
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don't have an account?
          </Text>

          <Text
            style={styles.registerLink}
            onPress={onRegister}
          >
            Create Account
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        © ExpenseX | Smart Expense Management
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F4F0FC",
    padding: 22,
    paddingVertical: 35
  },
  header: {
    alignItems: "center",
    marginBottom: 28
  },
  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: "#6541B8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 6
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 46,
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
    color: "#302345",
    textAlign: "center",
    marginTop: 17
  },
  description: {
    fontSize: 13,
    color: "#81788F",
    textAlign: "center",
    marginTop: 8
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 23,
    borderRadius: 23,
    elevation: 5,
    shadowColor: "#4A347A",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#38216D"
  },
  headingDescription: {
    fontSize: 12,
    color: "#958BA5",
    marginTop: 6,
    marginBottom: 25
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#403653",
    marginBottom: 9
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: "#E6DDF4",
    borderRadius: 13,
    paddingHorizontal: 14,
    marginBottom: 20
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 11,
    fontSize: 14,
    color: "#29213D",
    outlineStyle: "none"
  },
  message: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 13
  },
  button: {
    borderRadius: 13,
    marginTop: 8
  },
  buttonContent: {
    height: 53
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: "#EEE8F7"
  },
  registerText: {
    color: "#77708A",
    fontSize: 13
  },
  registerLink: {
    color: "#6541B8",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
    textDecorationLine: "underline"
  },
  footer: {
    textAlign: "center",
    color: "#968CA5",
    marginTop: 26,
    fontSize: 11
  }
});
