
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from "react-native";

import Svg, { Circle } from "react-native-svg";

import { Button } from "react-native-paper";
import { getTransactions } from "../transactionHistoryService";

const chartColors = [
  "#8054D6",
  "#E67E22",
  "#2196A6",
  "#E05280",
  "#4CAF50",
  "#607D8B",
  "#B39DDB"
];

const getTransactionDate = (item) => {
  if (item.createdAt?.toDate) {
    return item.createdAt.toDate();
  }

  if (item.createdAt instanceof Date) {
    return item.createdAt;
  }

  return null;
};

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

export default function StatisticsScreen({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.log("Statistics error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Overall statistics
  const income = transactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;

  // Current month
  const now = new Date();

  const currentMonth = getMonthKey(now);

  const monthName = now.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const monthlyTransactions = transactions.filter(item => {
    const date = getTransactionDate(item);

    if (!date) return false;

    return getMonthKey(date) === currentMonth;
  });

  const monthlyIncome = monthlyTransactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Category-wise expense analysis
  const categoryExpenses = monthlyTransactions
    .filter(item => item.type === "Expense")
    .reduce((result, item) => {
      const category = item.category || "Others";

      result[category] =
        (result[category] || 0) + Number(item.amount);

      return result;
    }, {});

  const categoryList = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1]);

  // Last six months income and expenses
  const monthlyChartData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const monthKey = getMonthKey(date);

    const monthTransactions = transactions.filter(item => {
      const transactionDate = getTransactionDate(item);

      if (!transactionDate) return false;

      return getMonthKey(transactionDate) === monthKey;
    });

    const monthIncome = monthTransactions
      .filter(item => item.type === "Income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const monthExpenses = monthTransactions
      .filter(item => item.type === "Expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    monthlyChartData.push({
      label: date.toLocaleString("default", {
        month: "short"
      }),
      income: monthIncome,
      expenses: monthExpenses
    });
  }

  const maximumMonthlyAmount = Math.max(
    ...monthlyChartData.map(item =>
      Math.max(item.income, item.expenses)
    ),
    1
  );

  // Donut chart calculations
  const totalCategoryExpenses = categoryList.reduce(
    (sum, item) => sum + item[1],
    0
  );

  const chartSize = 220;
  const center = chartSize / 2;
  const radius = 72;
  const strokeWidth = 27;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6541B8" />
        <Text style={styles.loadingText}>
          Loading statistics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.heading}>
        Expense Statistics
      </Text>

      <Text style={styles.subtitle}>
        Your financial overview at a glance
      </Text>

      {/* Monthly Report */}
      <Text style={styles.sectionHeading}>
        Monthly Report
      </Text>

      <Text style={styles.monthName}>
        {monthName}
      </Text>

      <View style={[styles.card, styles.incomeCard]}>
        <Text style={styles.label}>Monthly Income</Text>
        <Text style={styles.amount}>
          ₹ {monthlyIncome.toFixed(2)}
        </Text>
      </View>

      <View style={[styles.card, styles.expenseCard]}>
        <Text style={styles.label}>Monthly Expenses</Text>
        <Text style={styles.amount}>
          ₹ {monthlyExpenses.toFixed(2)}
        </Text>
      </View>

      <View style={[styles.card, styles.balanceCard]}>
        <Text style={styles.label}>Monthly Savings</Text>
        <Text style={styles.amount}>
          ₹ {monthlySavings.toFixed(2)}
        </Text>
        <Text style={styles.note}>
          Income minus expenses
        </Text>
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>
          Monthly Transactions
        </Text>
        <Text style={styles.count}>
          {monthlyTransactions.length}
        </Text>
      </View>

      {/* Donut Chart */}
      <Text style={styles.sectionHeading}>
        Spending Analytics
      </Text>

      <Text style={styles.monthName}>
        Category-wise spending for {monthName}
      </Text>

      <View style={styles.chartCard}>

        {categoryList.length === 0 ? (
          <Text style={styles.emptyText}>
            No expense transactions this month to display in the chart.
          </Text>
        ) : (
          <>
            <View style={styles.donutContainer}>
              <Svg
                width={chartSize}
                height={chartSize}
                viewBox={`0 0 ${chartSize} ${chartSize}`}
              >
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#E8E0F7"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {categoryList.map(([category, amount], index) => {
                  const percentage =
                    (amount / totalCategoryExpenses) * 100;

                  const segmentLength =
                    (percentage / 100) * circumference;

                  const offset =
                    (accumulatedPercentage / 100) * circumference;

                  accumulatedPercentage += percentage;

                  return (
                    <Circle
                      key={category}
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth={strokeWidth}
                      strokeDasharray={[
                        segmentLength,
                        circumference - segmentLength
                      ]}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                      fill="none"
                      transform={`rotate(-90 ${center} ${center})`}
                    />
                  );
                })}
              </Svg>

              <View style={styles.donutCenter}>
                <Text style={styles.donutLabel}>
                  Total Spent
                </Text>
                <Text style={styles.donutAmount}>
                  ₹ {totalCategoryExpenses.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Donut Chart Legend */}
            <View style={styles.legendContainer}>
              {categoryList.map(([category, amount], index) => {
                const percentage =
                  totalCategoryExpenses > 0
                    ? (amount / totalCategoryExpenses) * 100
                    : 0;

                return (
                  <View
                    key={category}
                    style={styles.legendItem}
                  >
                    <View style={styles.legendLeft}>
                      <View
                        style={[
                          styles.legendDot,
                          {
                            backgroundColor:
                              chartColors[index % chartColors.length]
                          }
                        ]}
                      />

                      <Text style={styles.legendName}>
                        {category}
                      </Text>
                    </View>

                    <View style={styles.legendRight}>
                      <Text style={styles.legendAmount}>
                        ₹ {amount.toFixed(0)}
                      </Text>

                      <Text style={styles.legendPercentage}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Six Month Bar Chart */}
      <Text style={styles.sectionHeading}>
        Monthly Comparison
      </Text>

      <Text style={styles.monthName}>
        Income vs Expenses - Last 6 Months
      </Text>

      <View style={styles.chartCard}>

        <View style={styles.barLegend}>
          <View style={styles.barLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#16803C" }]} />
            <Text style={styles.barLegendText}>Income</Text>
          </View>

          <View style={styles.barLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#D32F2F" }]} />
            <Text style={styles.barLegendText}>Expenses</Text>
          </View>
        </View>

        <View style={styles.barChart}>
          {monthlyChartData.map((item, index) => {
            const incomeHeight =
              (item.income / maximumMonthlyAmount) * 130;

            const expenseHeight =
              (item.expenses / maximumMonthlyAmount) * 130;

            return (
              <View
                key={`${item.label}-${index}`}
                style={styles.barGroup}
              >
                <View style={styles.barPair}>
                  <View
                    style={[
                      styles.bar,
                      styles.incomeBar,
                      { height: Math.max(incomeHeight, 3) }
                    ]}
                  />

                  <View
                    style={[
                      styles.bar,
                      styles.expenseBar,
                      { height: Math.max(expenseHeight, 3) }
                    ]}
                  />
                </View>

                <Text style={styles.barMonth}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.chartNote}>
          Compare how much you earned and spent each month.
        </Text>
      </View>

      {/* Category-wise Expense Analysis */}
      <Text style={styles.sectionHeading}>
        Category-wise Expenses
      </Text>

      <Text style={styles.monthName}>
        Spending breakdown for {monthName}
      </Text>

      <View style={styles.categoryCard}>
        {categoryList.length === 0 ? (
          <Text style={styles.emptyText}>
            No expense transactions this month.
          </Text>
        ) : (
          categoryList.map(([category, amount], index) => {
            const percentage =
              monthlyExpenses > 0
                ? (amount / monthlyExpenses) * 100
                : 0;

            return (
              <View key={category} style={styles.categoryItem}>

                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>
                    {category}
                  </Text>

                  <Text style={styles.categoryAmount}>
                    ₹ {amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor:
                          chartColors[index % chartColors.length]
                      }
                    ]}
                  />
                </View>

                <Text style={styles.percentage}>
                  {percentage.toFixed(1)}% of monthly expenses
                </Text>

              </View>
            );
          })
        )}
      </View>

      {/* Overall Statistics */}
      <Text style={styles.sectionHeading}>
        Overall Statistics
      </Text>

      <View style={[styles.card, styles.incomeCard]}>
        <Text style={styles.label}>Total Income</Text>
        <Text style={styles.amount}>
          ₹ {income.toFixed(2)}
        </Text>
        <Text style={styles.note}>Money received</Text>
      </View>

      <View style={[styles.card, styles.expenseCard]}>
        <Text style={styles.label}>Total Expenses</Text>
        <Text style={styles.amount}>
          ₹ {expenses.toFixed(2)}
        </Text>
        <Text style={styles.note}>Money spent</Text>
      </View>

      <View style={[styles.card, styles.balanceCard]}>
        <Text style={styles.label}>Remaining Balance</Text>
        <Text style={styles.amount}>
          ₹ {balance.toFixed(2)}
        </Text>
        <Text style={styles.note}>
          Total income minus total expenses
        </Text>
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>
          Total Transactions
        </Text>
        <Text style={styles.count}>
          {transactions.length}
        </Text>
      </View>

      <Button
        mode="contained"
        buttonColor="#6541B8"
        style={styles.button}
        contentStyle={{ height: 48 }}
        onPress={onBack}
      >
        Back to Dashboard
      </Button>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F1FF",
    padding: 22
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
    fontSize: 27,
    fontWeight: "bold",
    color: "#38216D",
    textAlign: "center"
  },

  subtitle: {
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25
  },

  sectionHeading: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#38216D",
    marginTop: 10,
    marginBottom: 8
  },

  monthName: {
    color: "#6541B8",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 15
  },

  card: {
    padding: 20,
    borderRadius: 17,
    marginBottom: 15,
    elevation: 3
  },

  incomeCard: {
    backgroundColor: "#16803C"
  },

  expenseCard: {
    backgroundColor: "#D32F2F"
  },

  balanceCard: {
    backgroundColor: "#6541B8"
  },

  label: {
    color: "white",
    fontSize: 15,
    fontWeight: "600"
  },

  amount: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8
  },

  note: {
    color: "#FFFFFFCC",
    fontSize: 12,
    marginTop: 5
  },

  countCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 17,
    marginBottom: 20,
    elevation: 3
  },

  countLabel: {
    color: "#777",
    fontSize: 15
  },

  count: {
    color: "#38216D",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8
  },

  chartCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 17,
    marginBottom: 22,
    elevation: 3
  },

  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 230
  },

  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },

  donutLabel: {
    color: "#888",
    fontSize: 13
  },

  donutAmount: {
    color: "#38216D",
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 5
  },

  legendContainer: {
    marginTop: 15
  },

  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECF7"
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },

  legendRight: {
    alignItems: "flex-end"
  },

  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 9
  },

  legendName: {
    color: "#38216D",
    fontSize: 14,
    fontWeight: "600"
  },

  legendAmount: {
    color: "#38216D",
    fontSize: 13,
    fontWeight: "bold"
  },

  legendPercentage: {
    color: "#888",
    fontSize: 11,
    marginTop: 3
  },

  barLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 25
  },

  barLegendItem: {
    flexDirection: "row",
    alignItems: "center"
  },

  barLegendText: {
    color: "#666",
    fontSize: 13
  },

  barChart: {
    height: 180,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingBottom: 8
  },

  barGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%"
  },

  barPair: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 135,
    gap: 4
  },

  bar: {
    width: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },

  incomeBar: {
    backgroundColor: "#16803C"
  },

  expenseBar: {
    backgroundColor: "#D32F2F"
  },

  barMonth: {
    color: "#666",
    fontSize: 11,
    marginTop: 8
  },

  chartNote: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 15
  },

  categoryCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 17,
    marginBottom: 20,
    elevation: 3
  },

  categoryItem: {
    marginBottom: 20
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9
  },

  categoryName: {
    color: "#38216D",
    fontSize: 15,
    fontWeight: "600"
  },

  categoryAmount: {
    color: "#6541B8",
    fontSize: 15,
    fontWeight: "bold"
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E8E0F7",
    borderRadius: 10,
    overflow: "hidden"
  },

  progressFill: {
    height: 10,
    borderRadius: 10
  },

  percentage: {
    color: "#888",
    fontSize: 11,
    marginTop: 6
  },

  emptyText: {
    color: "#888",
    textAlign: "center",
    padding: 15
  },

  button: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20
  }
});
