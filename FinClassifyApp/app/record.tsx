// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\record.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import HeaderTopNav from "../components/headertopnav";
import BotNavigationBar from "../components/botnavigationbar";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { app } from "../app/firebase";

// Initialize Firestore
const db = getFirestore(app);

// Hardcoded User ID
const HARDCODED_USER_ID = "User";

// Interface for Firestore transaction data (Added accountId and accountName)
interface Transaction {
  id: string;
  type: "Income" | "Expenses";
  categoryName: string;
  categoryIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  amount: number;
  timestamp: Timestamp;
  accountId: string; // Added
  accountName?: string; // Added (optional, but good to have)
}

// Helper function to format Firestore Timestamp
const formatFirestoreTimestamp = (
  timestamp: Timestamp | null | undefined
): string => {
  if (!timestamp) {
    return "No date";
  }
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      weekday: "long",
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return "Invalid date";
  }
};

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const userId = HARDCODED_USER_ID;

    if (!userId) {
      setError("User not identified.");
      setLoading(false);
      return;
    }

    const transactionsCollectionRef = collection(
      db,
      "Accounts",
      userId,
      "transactions"
    );
    const q = query(transactionsCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedTransactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Updated validation to include accountId
          if (
            data &&
            typeof data.type === "string" &&
            typeof data.categoryName === "string" &&
            typeof data.categoryIcon === "string" &&
            typeof data.amount === "number" &&
            data.timestamp instanceof Timestamp &&
            typeof data.accountId === "string" // Check for accountId
            // accountName is optional, so no strict check needed unless required
          ) {
            fetchedTransactions.push({
              id: doc.id,
              type: data.type as "Income" | "Expenses",
              categoryName: data.categoryName,
              categoryIcon:
                data.categoryIcon as keyof typeof MaterialCommunityIcons.glyphMap,
              amount: data.amount,
              timestamp: data.timestamp,
              accountId: data.accountId, // Fetch accountId
              accountName: data.accountName || "Unknown Account", // Fetch accountName or use default
            });
          } else {
            console.warn(
              `Invalid or incomplete transaction data found for doc ID: ${doc.id}`
            );
          }
        });
        setTransactions(fetchedTransactions);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching transactions: ", err);
        setError("Failed to load transaction history. Please try again.");
        if (err.code === "permission-denied") {
          setError(
            "Permission denied. Please check your Firestore security rules."
          );
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#006400" />
          <Text style={styles.infoText}>Loading Records...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={40} color="red" />
          <Text style={[styles.infoText, styles.errorText]}>{error}</Text>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="hourglass-empty" size={40} color="#888" />
          <Text style={styles.infoText}>No transactions recorded yet.</Text>
          <Text style={styles.infoText}>Tap '+' to add one!</Text>
        </View>
      );
    }

    // Group transactions by date
    const groupedTransactions: { [date: string]: Transaction[] } = {};
    transactions.forEach((transaction) => {
      const dateStr = formatFirestoreTimestamp(transaction.timestamp);
      if (!groupedTransactions[dateStr]) {
        groupedTransactions[dateStr] = [];
      }
      groupedTransactions[dateStr].push(transaction);
    });

    return (
      <ScrollView style={styles.content}>
        {Object.entries(groupedTransactions).map(
          ([date, dailyTransactions]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dailyTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionDetails}>
                    <MaterialCommunityIcons
                      name={transaction.categoryIcon}
                      size={24}
                      color="#006400"
                      style={styles.categoryIcon}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.categoryName}>
                        {transaction.categoryName}
                      </Text>
                      {/* Display Account Name */}
                      <Text style={styles.accountNameText}>
                        {transaction.accountName}
                      </Text>
                    </View>
                    <Text
                      style={
                        // Only expenses are currently added, but keep logic for income
                        transaction.type === "Income"
                          ? styles.income
                          : styles.expense
                      }
                    >
                      {transaction.type === "Income" ? "+" : "-"}₱
                      {Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <HeaderTopNav />
        {renderContent()}
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  infoText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  dateGroup: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  dateHeader: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 10,
    marginTop: 5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transactionItem: {
    marginBottom: 10,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: "#343a40",
  },
  accountNameText: {
    // Style for the account name
    fontSize: 13,
    color: "#6c757d", // Softer color for account name
    marginTop: 2,
  },
  expense: {
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "bold",
    textAlign: "right",
  },
  income: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "bold",
    textAlign: "right",
  },
});

export default HistoryScreen;
