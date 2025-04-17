import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator, // Added for loading state
  Alert, // Added for error display
} from "react-native";
import HeaderTopNav from "../components/headertopnav";
import BotNavigationBar from "../components/botnavigationbar";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"; // Use MaterialCommunityIcons for saved icons
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp, // Import Timestamp type
} from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust path if needed

// Initialize Firestore
const db = getFirestore(app);

// Hardcoded User ID (as used in transactions.tsx)
const HARDCODED_USER_ID = "User";

// Interface for Firestore transaction data
interface Transaction {
  id: string; // Firestore document ID
  type: "Income" | "Expenses";
  categoryName: string;
  categoryIcon: keyof typeof MaterialCommunityIcons.glyphMap; // Match the icon type saved
  amount: number;
  timestamp: Timestamp; // Firestore Timestamp object
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
    // Example format: Jan 24, Tuesday (Adjust options as needed)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      weekday: "long",
      // year: 'numeric', // Add if you want the year
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
  // const [headerTitle, setHeaderTitle] = useState("Records"); // Keep if needed elsewhere

  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never); // Navigate to the screen where transactions are added
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const userId = HARDCODED_USER_ID;

    if (!userId) {
      setError("User not identified.");
      setLoading(false);
      // Optionally navigate to login or show an alert
      return;
    }

    const transactionsCollectionRef = collection(
      db,
      "Accounts",
      userId,
      "transactions"
    );
    // Query to order transactions by timestamp, newest first
    const q = query(transactionsCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedTransactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Basic validation to ensure data structure matches expectations
          if (
            data &&
            typeof data.type === "string" &&
            typeof data.categoryName === "string" &&
            typeof data.categoryIcon === "string" &&
            typeof data.amount === "number" &&
            data.timestamp instanceof Timestamp // Check if it's a Firestore Timestamp
          ) {
            fetchedTransactions.push({
              id: doc.id,
              type: data.type as "Income" | "Expenses",
              categoryName: data.categoryName,
              categoryIcon:
                data.categoryIcon as keyof typeof MaterialCommunityIcons.glyphMap,
              amount: data.amount,
              timestamp: data.timestamp,
            });
          } else {
            console.warn(
              `Invalid transaction data found for doc ID: ${doc.id}`
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

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount

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
                  {/* Removed the date text from here as it's now a header */}
                  <View style={styles.transactionDetails}>
                    <MaterialCommunityIcons // Use MaterialCommunityIcons
                      name={transaction.categoryIcon}
                      size={24}
                      color="#006400"
                      style={styles.categoryIcon}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.categoryName}>
                        {transaction.categoryName}
                      </Text>
                    </View>
                    <Text
                      style={
                        transaction.type === "Income"
                          ? styles.income
                          : styles.expense
                      }
                    >
                      {/* Show + for income, - for expense */}
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
    bottom: 70, // Adjusted slightly higher if needed due to nav bar
    right: 20,
    backgroundColor: "#0F730C", // Consistent FAB color
    width: 56, // Standard FAB size
    height: 56, // Standard FAB size
    borderRadius: 28, // Half of width/height
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Lighter background
  },
  content: {
    flex: 1,
    // Removed paddingHorizontal here, apply to dateGroup instead if needed
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
    color: "#6c757d", // Softer text color
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  dateGroup: {
    marginBottom: 15, // Space between date groups
    paddingHorizontal: 15, // Add horizontal padding here
  },
  dateHeader: {
    fontSize: 14,
    color: "#495057", // Darker gray for date header
    marginBottom: 10,
    marginTop: 5, // Add some top margin
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transactionItem: {
    marginBottom: 10, // Space between items within a date group
    // Removed borderBottom here, separation is clearer with background cards
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
    flex: 1, // Allow category name to take available space
    marginRight: 10, // Add space between category name and amount
  },
  categoryName: {
    fontSize: 16,
    color: "#343a40", // Darker text for category
  },
  expense: {
    fontSize: 16,
    color: "#dc3545", // Standard red for expense
    fontWeight: "bold",
    textAlign: "right", // Align amount to the right
  },
  income: {
    fontSize: 16,
    color: "#28a745", // Standard green for income
    fontWeight: "bold",
    textAlign: "right", // Align amount to the right
  },
});

export default HistoryScreen;
