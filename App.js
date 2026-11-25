
import "react-native-gesture-handler";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { NavigationContainer } from "@react-navigation/native";
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
import SavingsGoalsScreen from "./src/services/screens/SavingsGoalsScreen";
import BillRemindersScreen from "./src/services/screens/BillRemindersScreen";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// AUTHENTICATION NAVIGATION
function AuthNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade"
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onLogin={onLogin}
            onRegister={() => navigation.navigate("Register")}
          />
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="Register">
        {({ navigation }) => (
          <RegistrationScreen
            onLogin={() => navigation.navigate("Login")}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

// BOTTOM TAB NAVIGATION
function MainTabs({ onLogout }) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#B99AFF",
        tabBarInactiveTintColor: "#8D7DA5",

        tabBarStyle: {
          backgroundColor: "#1D1530",
          borderTopColor: "#493263",
          height: 65,
          paddingTop: 6,
          paddingBottom: 6
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600"
        },

        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: "view-dashboard-outline",
            Statistics: "chart-donut",
            History: "history",
            Profile: "account-circle-outline"
          };

          return (
            <MaterialCommunityIcons
              name={icons[route.name]}
              size={size}
              color={color}
            />
          );
        }
      })}
    >
      <Tab.Screen name="Dashboard">
        {({ navigation }) => (
          <DashboardScreen
            onLogout={onLogout}
            onAddTransaction={() =>
              navigation.getParent()?.navigate("AddTransaction")
            }
            onHistory={() =>
              navigation.navigate("History")
            }
            onStatistics={() =>
              navigation.navigate("Statistics")
            }
            onProfile={() =>
              navigation.navigate("Profile")
            }
            onCurrency={() =>
              navigation.getParent()?.navigate("Currency")
            }
            onSavingsGoals={() =>
              navigation.getParent()?.navigate("Savings")
            }
            onBillReminders={() =>
              navigation.getParent()?.navigate("BillReminders")
            }
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

      <Tab.Screen name="History">
        {({ navigation }) => (
          <TransactionHistoryScreen
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

// DRAWER NAVIGATION
function MainDrawer({ onLogout }) {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        options={{ title: "Dashboard" }}
      >
        {() => <MainTabs onLogout={onLogout} />}
      </Drawer.Screen>

      <Drawer.Screen
        name="AddTransaction"
        options={{ title: "Add Transaction" }}
      >
        {({ navigation }) => (
          <AddTransactionScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="Currency"
        options={{ title: "Currency Converter" }}
      >
        {({ navigation }) => (
          <CurrencyScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="Savings"
        options={{ title: "Savings Goals" }}
      >
        {({ navigation }) => (
          <SavingsGoalsScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="BillReminders"
        options={{ title: "Bill & Payment Reminders" }}
      >
        {({ navigation }) => (
          <BillRemindersScreen
            onBack={() => navigation.navigate("Home")}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// MAIN APP
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="Auth">
            {({ navigation }) => (
              <AuthNavigator
                onLogin={() =>
                  navigation.replace("MainDrawer")
                }
              />
            )}
          </RootStack.Screen>

          <RootStack.Screen name="MainDrawer">
            {({ navigation }) => (
              <MainDrawer
                onLogout={() =>
                  navigation.replace("Auth")
                }
              />
            )}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
