
import "react-native-gesture-handler";
import React from "react";
import { View, Button as NativeButton } from "react-native";
import { PaperProvider } from "react-native-paper";

import {
  NavigationContainer
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";

import LoginScreen from "./src/services/screens/LoginScreen";
import RegistrationScreen from "./src/services/screens/RegistrationScreen";
import DashboardScreen from "./src/services/screens/DashboardScreen";
import AddTransactionScreen from "./src/services/screens/AddTransactionScreen";
import TransactionHistoryScreen from "./src/services/screens/TransactionHistoryScreen";
import StatisticsScreen from "./src/services/screens/StatisticsScreen";
import ProfileScreen from "./src/services/screens/ProfileScreen";
import CurrencyScreen from "./src/services/screens/CurrencyScreen";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Login and Registration Navigation
function AuthNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login">
        {({ navigation }) => (
          <View style={{ flex: 1 }}>
            <LoginScreen onLogin={onLogin} />
            <NativeButton
              title="Create New Account"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="Register">
        {({ navigation }) => (
          <View style={{ flex: 1 }}>
            <RegistrationScreen />
            <NativeButton
              title="Back to Login"
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

// Bottom Tab Navigation
function MainTabs({ onLogout }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard">
        {({ navigation }) => (
          <DashboardScreen
            onLogout={onLogout}
            onAddTransaction={() => navigation.getParent()?.navigate("AddTransaction")}
            onHistory={() => navigation.getParent()?.navigate("History")}
            onStatistics={() => navigation.navigate("Statistics")}
            onProfile={() => navigation.navigate("Profile")}
            onCurrency={() => navigation.getParent()?.navigate("Currency")}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Statistics">
        {({ navigation }) => (
          <StatisticsScreen
            onBack={() => navigation.navigate("Dashboard")}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen
            onBack={() => navigation.navigate("Dashboard")}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Drawer Navigation
function MainDrawer({ onLogout }) {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" options={{ title: "Dashboard" }}>
        {() => <MainTabs onLogout={onLogout} />}
      </Drawer.Screen>

      <Drawer.Screen name="AddTransaction" options={{ title: "Add Transaction" }}>
        {({ navigation }) => (
          <AddTransactionScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="History" options={{ title: "Transaction History" }}>
        {({ navigation }) => (
          <TransactionHistoryScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Currency" options={{ title: "Currency Converter" }}>
        {({ navigation }) => (
          <CurrencyScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Auth">
            {({ navigation }) => (
              <AuthNavigator
                onLogin={() => navigation.replace("MainDrawer")}
              />
            )}
          </RootStack.Screen>

          <RootStack.Screen name="MainDrawer">
            {({ navigation }) => (
              <MainDrawer
                onLogout={() => navigation.replace("Auth")}
              />
            )}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
