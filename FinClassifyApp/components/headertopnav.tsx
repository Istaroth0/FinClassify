// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\components\headertopnav.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth"; // Import Firebase Auth
import { app } from "../app/firebase"; // Adjust path if needed
import { useDateContext } from "../app/context/DateContext"; // Import the context hook

const { width, height } = Dimensions.get("window");
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth
const HARDCODED_USER_ID = "User";

// --- Interfaces ---
interface AccountForIncome {
  id: string;
  incomeAmount?: number | null;
  incomeFrequency?: "Daily" | "Weekly" | "Monthly" | null;
}

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  // Handle potential NaN or non-finite numbers gracefully
  if (isNaN(amount) || !isFinite(amount)) {
    return "₱ 0.00";
  }
  const prefix = amount < 0 ? "-₱" : "₱"; // Handle negative sign
  return `${prefix}${Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const getMonthNumber = (monthName: string): number => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.indexOf(monthName);
};
// --- End Helper Functions ---

const Header = () => {
  // Use the context for date state and setters
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    selectedDateString, // Use the string from context
  } = useDateContext();

  const currentYear = new Date().getFullYear();
  const monthsArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Local state for UI control (modals, menu)
  const [isMenuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for the current user
  // State for totals and loading (remains the same)
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [errorTotals, setErrorTotals] = useState<string | null>(null);
  const [accountIncomeData, setAccountIncomeData] = useState<
    AccountForIncome[]
  >([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // --- Listen for Auth State Changes ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // Reset data or show login prompt if needed when user logs out
        setErrorTotals("Please log in to view totals.");
        setIsLoadingTotals(false);
        setIsLoadingAccounts(false);
      }
    });
    return () => unsubscribeAuth(); // Cleanup listener
  }, []);

  // --- Fetch Accounts (remains the same) ---
  useEffect(() => {
    if (!currentUser) {
      // Don't fetch if no user
      setIsLoadingAccounts(false);
      setAccountIncomeData([]); // Clear data if no user
      return;
    }

    setIsLoadingAccounts(true);
    const accountsCollectionRef = collection(
      db,
      "Accounts",
      currentUser.uid, // Use currentUser.uid
      "accounts"
    );
    const q = query(accountsCollectionRef);

    const unsubscribeAccounts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAccounts: AccountForIncome[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.incomeAmount && data.incomeFrequency) {
            fetchedAccounts.push({
              id: doc.id,
              incomeAmount: data.incomeAmount,
              incomeFrequency: data.incomeFrequency,
            });
          }
        });
        setAccountIncomeData(fetchedAccounts);
        setIsLoadingAccounts(false);
      },
      (err) => {
        console.error("Error fetching accounts for income calculation: ", err);
        setErrorTotals((prev) =>
          prev ? `${prev}\nAcc income fail.` : "Acc income fail."
        );
        setIsLoadingAccounts(false);
      }
    );
    return () => unsubscribeAccounts();
  }, [currentUser]); // Re-run if user changes

  // --- Fetch Totals & Calculate (uses selectedYear, selectedMonth from context) ---
  useEffect(() => {
    if (isLoadingAccounts || !currentUser) {
      // Check for user
      setIsLoadingTotals(true);
      return;
    }

    setIsLoadingTotals(true);
    setErrorTotals(null);
    // Reset totals before fetching/calculating
    setTotalIncome(0);
    setTotalExpenses(0);
    setNetTotal(0);

    if (!currentUser.uid) {
      // Check for user UID specifically
      setErrorTotals("User missing.");
      setIsLoadingTotals(false);
      return;
    }

    const monthNumber = getMonthNumber(selectedMonth); // Use context month
    if (monthNumber < 0) {
      setErrorTotals("Invalid month.");
      setIsLoadingTotals(false);
      return;
    }

    // Calculate Recurring Income (uses context year/month)
    let estimatedRecurringIncome = 0;
    const daysInMonth = new Date(selectedYear, monthNumber + 1, 0).getDate(); // Use context year

    accountIncomeData.forEach((account) => {
      const income = account.incomeAmount;
      const freq = account.incomeFrequency;
      if (income && income > 0 && freq) {
        switch (freq) {
          case "Daily":
            estimatedRecurringIncome += income * daysInMonth;
            break;
          case "Weekly":
            estimatedRecurringIncome += income * (daysInMonth / 7);
            break;
          case "Monthly":
            estimatedRecurringIncome += income;
            break;
        }
      }
    });

    // Fetch Transactions (uses context year/month)
    const startDate = new Date(selectedYear, monthNumber, 1, 0, 0, 0); // Use context year
    const endDate = new Date(selectedYear, monthNumber + 1, 1, 0, 0, 0); // Use context year
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const transactionsCollectionRef = collection(
      db,

      "Accounts",
      currentUser.uid,
      "transactions"
    );
    const q = query(
      transactionsCollectionRef,
      where("timestamp", ">=", startTimestamp),
      where("timestamp", "<", endTimestamp)
    );

    const unsubscribeTransactions = onSnapshot(
      q,
      (querySnapshot) => {
        let incomeFromTransactions = 0;
        let expensesFromTransactions = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.amount === "number") {
            if (data.type === "Income") incomeFromTransactions += data.amount;
            else if (data.type === "Expenses")
              expensesFromTransactions += data.amount;
          }
        });

        const combinedTotalIncome =
          estimatedRecurringIncome + incomeFromTransactions;
        setTotalIncome(combinedTotalIncome);
        setTotalExpenses(expensesFromTransactions);
        setNetTotal(combinedTotalIncome - expensesFromTransactions);
        setIsLoadingTotals(false);
      },
      (err) => {
        console.error("Error fetching transaction totals: ", err);
        setErrorTotals((prev) =>
          prev ? `${prev}\nTx totals fail.` : "Tx totals fail."
        );
        // Show recurring income even if transactions fail
        setTotalIncome(estimatedRecurringIncome);
        setTotalExpenses(0);
        setNetTotal(estimatedRecurringIncome);
        setIsLoadingTotals(false);
      }
    );

    return () => unsubscribeTransactions();
  }, [
    currentUser,
    selectedYear,
    selectedMonth,
    accountIncomeData,
    isLoadingAccounts,
  ]); // Depend on context date and user

  // --- Date Picker Logic (updates context) ---
  const showDatePicker = () => setShowYearPicker(true);
  const hideDatePicker = () => {
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };
  const handleYearSelect = (year: number) => {
    setSelectedYear(year); // Update context
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month); // Update context
    // No need to update local selectedDate state anymore
    setShowMonthPicker(false);
    // hideDatePicker(); // Optionally close both pickers
  };

  // --- Menu Animation (remains the same) ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  // --- Menu Items (remains the same) ---
  const menuItems = [
    { id: "1", title: "Profile" },
    { id: "2", title: "Settings" },
    { id: "3", title: "Summary" },
  ];
  const renderMenuItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        setMenuVisible(false);
        console.log(`Menu item ${item.title} pressed`);
        // Add navigation logic here if needed
      }}
    >
      <Text style={styles.menuItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // --- Render Totals (remains the same) ---
  const renderTotals = () => {
    if (!currentUser || isLoadingTotals || isLoadingAccounts) {
      // Check for user
      return (
        <ActivityIndicator
          size="small"
          color="white"
          style={styles.totalsLoader}
        />
      );
    }
    if (errorTotals) {
      const errorLines = errorTotals.split("\n").map((line, index) => (
        <Text key={index} style={styles.errorText}>
          {line}
        </Text>
      ));
      return <View style={styles.errorContainer}>{errorLines}</View>;
    }
    return (
      <>
        <Text style={styles.categoryAmount}>
          {formatCurrency(totalExpenses)}
        </Text>
        <Text style={styles.categoryAmount}>{formatCurrency(totalIncome)}</Text>
        <Text style={styles.categoryAmount}>{formatCurrency(netTotal)}</Text>
      </>
    );
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerWrapper}>
        {/* Top Row: Menu, Title, Search */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu-outline" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>FinClassify</Text>
          </View>
          <View style={styles.rightIconsContainer}>
            <TouchableOpacity style={styles.searchIcon}>
              <Ionicons name="search-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle Row: Date Picker, Filter */}
        <View style={styles.headerBottom}>
          <View style={styles.dateAndFilterContainer}>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={showDatePicker}
              >
                {/* Use selectedDateString from context */}
                <Text style={styles.dateText}>{selectedDateString}</Text>
                <Ionicons name="chevron-down-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.volumeSliderIcon}>
              <Ionicons name="options-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Row: Totals */}
        <View style={styles.dataContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderText}>Expenses</Text>
            <Text style={styles.categoryHeaderText}>Income</Text>
            <Text style={styles.categoryHeaderText}>Total</Text>
          </View>
          <View style={styles.categoryItem}>{renderTotals()}</View>
        </View>
      </View>
      {/* End Header Content */}

      {/* Side Menu Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
            onStartShouldSetResponder={() => true} // Prevent touches passing through
          >
            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal transparent animationType="fade" onRequestClose={hideDatePicker}>
          <TouchableOpacity
            style={styles.pickerModalContainer}
            activeOpacity={1}
            onPressOut={hideDatePicker}
          >
            <View
              style={styles.pickerContent}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.pickerTitle}>Select Year</Text>
              <FlatList
                data={years.map(String)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      selectedYear === parseInt(item, 10) &&
                        styles.pickerItemSelected, // Compare with context year
                    ]}
                    onPress={() => handleYearSelect(parseInt(item, 10))}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedYear === parseInt(item, 10) &&
                          styles.pickerTextSelected, // Compare with context year
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={hideDatePicker}
              >
                <Text style={styles.pickerButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <Modal transparent animationType="fade" onRequestClose={hideDatePicker}>
          <TouchableOpacity
            style={styles.pickerModalContainer}
            activeOpacity={1}
            onPressOut={hideDatePicker}
          >
            <View
              style={styles.pickerContent}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.pickerTitle}>Select Month</Text>
              <FlatList
                data={monthsArray}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      selectedMonth === item && styles.pickerItemSelected, // Compare with context month
                    ]}
                    onPress={() => handleMonthSelect(item)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedMonth === item && styles.pickerTextSelected, // Compare with context month
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={hideDatePicker}
              >
                <Text style={styles.pickerButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

// --- Styles (Mostly unchanged, check errorText styling) ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#006400",
    paddingHorizontal: 8,
    paddingBottom: 8,
    ...Platform.select({
      ios: { paddingTop: 40 },
      android: { paddingTop: 10 },
    }),
  },
  headerWrapper: {},
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  titleContainer: {
    position: "absolute", // Center title absolutely
    left: 0,
    right: 0,
    alignItems: "center",
  },
  iconContainer: {
    // Left icon (menu)
    padding: 4,
    zIndex: 2, // Ensure it's clickable over the title
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateContainer: {
    // Container for the date selector itself
    alignItems: "flex-start", // Align selector to the left within its space
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dateText: {
    color: "white",
    marginRight: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  dateAndFilterContainer: {
    // Row containing date selector and filter icon
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Space out date and filter icon
    width: "100%",
  },
  dataContainer: {
    // Container for the totals section
    marginTop: 10,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 6,
    paddingVertical: 8,
    minHeight: 50, // Ensure minimum height for loader/error
    justifyContent: "center", // Center content vertically if loading/error
  },
  categoryHeader: {
    // Row for "Expenses", "Income", "Total" labels
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  categoryHeaderText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    flex: 1, // Distribute space equally
  },
  categoryItem: {
    // Row for the actual amounts
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center", // Align amounts vertically
  },
  categoryAmount: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1, // Distribute space equally
  },
  totalsLoader: {
    marginVertical: 5, // Add some space for the loader
  },
  errorContainer: {
    // Container for error messages within the totals area
    flex: 1, // Take available space if needed
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  errorText: {
    // Styling for the error message text
    color: "#ffdddd", // Lighter red for visibility on dark background
    fontSize: 11, // Make error text slightly smaller
    textAlign: "center",
    // Add margin if multiple lines look cramped
    // marginVertical: 1,
  },
  rightIconsContainer: {
    // Container for icons on the right (search)
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2, // Ensure clickable over title
  },
  searchIcon: {
    padding: 4,
  },
  volumeSliderIcon: {
    // Filter icon
    padding: 4,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    // Side menu
    backgroundColor: "white",
    width: width * 0.75,
    height: "100%",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20, // Adjust for status bar
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  // --- Picker Modal Styles ---
  pickerModalContainer: {
    // Backdrop for picker modals
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  pickerContent: {
    // White box containing the picker list
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: width * 0.8, // 80% of screen width
    maxHeight: height * 0.6, // Max 60% of screen height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  pickerItem: {
    // Touchable row in the picker list
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  pickerItemSelected: {
    // Style for the selected item row
    backgroundColor: "#e0f2e0", // Light green background
  },
  pickerText: {
    // Text inside the picker row
    fontSize: 16,
    color: "#006400", // Theme green
  },
  pickerTextSelected: {
    // Style for the selected item text
    fontWeight: "bold",
  },
  pickerButton: {
    // Cancel button at the bottom of the picker
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0", // Light grey background
    borderRadius: 8,
    alignSelf: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
});

export default Header;
