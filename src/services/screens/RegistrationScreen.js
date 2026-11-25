
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { registerUser } from "../authService";

export default function RegistrationScreen({ onLogin }) {
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>₹</Text>
        </View>

        <Text style={styles.title}>ExpenseX</Text>
        <Text style={styles.subtitle}>Create Your Account</Text>
        <Text style={styles.description}>
          Take control of your finances, one step at a time.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Get Started</Text>
        <Text style={styles.headingDescription}>
          Enter your details to create your account
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
            placeholder="Minimum 6 characters"
            placeholderTextColor="#A49BB5"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.passwordHint}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={16}
            color="#8066B5"
          />
          <Text style={styles.hintText}>
            Password must contain at least 6 characters.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#6541B8"
          icon="account-plus-outline"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {loading && (
          <ActivityIndicator color="#6541B8" style={{ marginTop: 12 }} />
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <Text
            style={styles.loginLink}
            onPress={onLogin}
          >
            Login
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
    paddingHorizontal: 22,
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
    color: "#38216D"
  },
  subtitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#302345",
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
    fontSize: 23,
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
  passwordHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -9,
    marginBottom: 18
  },
  hintText: {
    fontSize: 11,
    color: "#817492",
    marginLeft: 6
  },
  button: {
    borderRadius: 13,
    marginTop: 7
  },
  buttonContent: {
    height: 53
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: "#EEE8F7"
  },
  loginText: {
    color: "#77708A",
    fontSize: 13
  },
  loginLink: {
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
