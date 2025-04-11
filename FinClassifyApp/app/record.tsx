import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import HeaderTopNav from "../components/headertopnav";
import BotNavigationBar from "../components/botnavigationbar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Import }
// Dummy data for transactions
const transactions: {
  id: string;
  date: string;
  category: string;
  amount: string;
  icon:
    | "receipt-outline"
    | "car-outline"
    | "shirt-outline"
    | "book-outline"
    | "cart-outline"
    | "cash-outline"
    | "restaurant-outline"
    | "gift-outline";
}[] = [
  {
    id: "1",
    date: "Jan 24, Tuesday",
    category: "Bills",
    amount: "-₱1500.00",
    icon: "receipt-outline",
  },
  {
    id: "2",
    date: "Jan 24, Tuesday",
    category: "Car",
    amount: "-₱400.00",
    icon: "car-outline",
  },
  {
    id: "3",
    date: "Jan 24, Tuesday",
    category: "Clothing",
    amount: "-₱550.00",
    icon: "shirt-outline",
  },
  {
    id: "4",
    date: "Jan 24, Tuesday",
    category: "Education",
    amount: "-₱2000.00",
    icon: "book-outline",
  },
  {
    id: "5",
    date: "Jan 25, Tuesday",
    category: "Bills",
    amount: "₱1500.00",
    icon: "receipt-outline",
  },
  {
    id: "6",
    date: "Jan 25, Tuesday",
    category: "Car",
    amount: "-₱400.00",
    icon: "car-outline",
  },
  {
    id: "7",
    date: "Jan 25, Tuesday",
    category: "Clothing",
    amount: "₱550.00",
    icon: "shirt-outline",
  },
  {
    id: "8",
    date: "Jan 25, Tuesday",
    category: "Education",
    amount: "-₱2000.00",
    icon: "book-outline",
  },
  {
    id: "9",
    date: "Jan 26, Wednesday",
    category: "Groceries",
    amount: "-₱750.00",
    icon: "cart-outline",
  }, // Added more data for scrolling
  {
    id: "10",
    date: "Jan 26, Wednesday",
    category: "Salary",
    amount: "₱5000.00",
    icon: "cash-outline",
  },
  {
    id: "11",
    date: "Jan 27, Thursday",
    category: "Dining",
    amount: "-₱1200.00",
    icon: "restaurant-outline",
  },
  {
    id: "12",
    date: "Jan 27, Thursday",
    category: "Gifts",
    amount: "₱300.00",
    icon: "gift-outline",
  },
];

const HistoryScreen = () => {
  const navigation = useNavigation();
  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };
  const [headerTitle, setHeaderTitle] = useState("Records");

  return (
    <>
      <View style={styles.container}>
        <HeaderTopNav />
        <ScrollView style={styles.content}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.date}>{transaction.date}</Text>

              <View style={styles.transactionDetails}>
                <Ionicons
                  name={transaction.icon}
                  size={24}
                  color="#006400"
                  style={styles.categoryIcon}
                />
                <Text
                  style={
                    transaction.amount.startsWith("-")
                      ? styles.expense
                      : styles.income
                  }
                >
                  {transaction.category} {transaction.amount}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={navigateToTransaction}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <BotNavigationBar />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "#0F730C",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  transactionItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  date: {
    fontSize: 13, // Reduced font size
    color: "#333", // Darker color for better readability
    marginBottom: 8,
    fontWeight: "600", // Stronger font weight
    textTransform: "uppercase", // Uppercase transformation
    letterSpacing: 0.5, // Added letter spacing
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    marginRight: 15,
  },
  expense: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  income: {
    fontSize: 16,
    color: "green",
    fontWeight: "bold",
  },
});

export default HistoryScreen;
