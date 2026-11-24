
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { Button } from "react-native-paper";
import { convertCurrency } from "../currencyService";

export default function CurrencyScreen({ onBack }) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      setResult("");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult("");

      const data = await convertCurrency(amount, from, to);
      setResult(data.result);
      setMessage(`Exchange rate date: ${data.date}`);
    } catch (error) {
      setMessage(error.message || "Conversion failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeCurrency = () => {
    setFrom(to);
    setTo(from);
    setResult("");
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Currency Converter</Text>
      <Text style={styles.subtitle}>
        Convert your money easily
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Enter Amount</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.currencyBox}>
          <View style={styles.currencyItem}>
            <Text style={styles.smallLabel}>From</Text>
            <Text style={styles.currency}>{from}</Text>
          </View>

          <Button
            mode="contained"
            buttonColor="#6541B8"
            textColor="white"
            style={styles.swapButton}
            onPress={changeCurrency}
          >
            ⇅ Swap
          </Button>

          <View style={styles.currencyItem}>
            <Text style={styles.smallLabel}>To</Text>
            <Text style={styles.currency}>{to}</Text>
          </View>
        </View>

        <Button
          mode="contained"
          buttonColor="#6541B8"
          style={styles.convertButton}
          contentStyle={{ height: 50 }}
          onPress={handleConvert}
          disabled={loading}
        >
          {loading ? "Converting..." : `Convert ${from} to ${to}`}
        </Button>

        {loading && (
          <ActivityIndicator
            color="#6541B8"
            style={{ marginTop: 15 }}
          />
        )}

        {result !== "" && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Converted Amount</Text>
            <Text style={styles.result}>
              {to === "USD" ? "$" : "₹"} {result}
            </Text>
          </View>
        )}

        {message !== "" && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>

      <Button
        mode="outlined"
        textColor="#6541B8"
        style={styles.backButton}
        onPress={onBack}
      >
        Back to Dashboard
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
    fontSize: 27,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },
  subtitle: {
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28
  },
  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 20,
    elevation: 4
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 9
  },
  input: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: "#E4DCF4",
    padding: 15,
    borderRadius: 11,
    marginBottom: 22,
    fontSize: 18,
    color: "#222"
  },
  currencyBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F6FC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 22
  },
  currencyItem: {
    alignItems: "center"
  },
  smallLabel: {
    color: "#888",
    fontSize: 12
  },
  currency: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#38216D",
    marginTop: 5
  },
  swapButton: {
    borderRadius: 9
  },
  convertButton: {
    borderRadius: 12
  },
  resultBox: {
    backgroundColor: "#EEE8FA",
    padding: 18,
    borderRadius: 12,
    marginTop: 22,
    alignItems: "center"
  },
  resultLabel: {
    color: "#777",
    fontSize: 13
  },
  result: {
    color: "#38216D",
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 7
  },
  message: {
    color: "#777",
    textAlign: "center",
    marginTop: 15,
    fontSize: 12
  },
  backButton: {
    borderColor: "#6541B8",
    borderRadius: 12,
    marginTop: 20
  }
});
