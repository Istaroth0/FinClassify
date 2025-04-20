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
  orderBy, // Import orderBy if fetching accounts ordered
} from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust path if needed

const { width, height } = Dimensions.get("window");
const db = getFirestore(app);
const HARDCODED_USER_ID = "User";

// --- Interfaces ---
// Interface for Account data needed for recurring income calculation
interface AccountForIncome {
  id: string;
  incomeAmount?: number | null;
  incomeFrequency?: "Daily" | "Weekly" | "Monthly" | null;
}

// --- Helper Functions (Keep formatCurrency and getMonthNumber) ---
const formatCurrency = (amount: number): string => {
  return `₱ ${amount.toFixed(2)}`;
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
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
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
  const currentMonthName = monthsArray[currentMonthIndex];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedDate, setSelectedDate] = useState(
    `${selectedYear} ${selectedMonth}`
  );

  const [isMenuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // State for totals and loading
  const [totalIncome, setTotalIncome] = useState(0); // Will include recurring + transaction income
  const [totalExpenses, setTotalExpenses] = useState(0); // From transactions only
  const [netTotal, setNetTotal] = useState(0);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [errorTotals, setErrorTotals] = useState<string | null>(null);

  // State for fetched accounts data
  const [accountIncomeData, setAccountIncomeData] = useState<
    AccountForIncome[]
  >([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true); // Separate loading for accounts

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // --- Fetch Accounts for Recurring Income ---
  useEffect(() => {
    setIsLoadingAccounts(true);
    const userId = HARDCODED_USER_ID;
    const accountsCollectionRef = collection(
      db,
      "Accounts",
      userId,
      "accounts"
    );
    const q = query(accountsCollectionRef); // No specific order needed here

    const unsubscribeAccounts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAccounts: AccountForIncome[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only need accounts with recurring income defined
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
        // Don't block totals calculation if accounts fail, just proceed without recurring income
        setErrorTotals((prev) =>
          prev
            ? `${prev}\nFailed to load account income.`
            : "Failed to load account income."
        );
        setIsLoadingAccounts(false);
      }
    );

    return () => unsubscribeAccounts();
  }, []); // Fetch accounts once on mount

  // --- Fetch Totals & Calculate Combined Income ---
  useEffect(() => {
    // Don't proceed if accounts are still loading (or handle default state)
    if (isLoadingAccounts) {
      setIsLoadingTotals(true); // Keep totals loading until accounts are loaded
      return;
    }

    setIsLoadingTotals(true);
    setErrorTotals(null);
    setTotalIncome(0);
    setTotalExpenses(0);
    setNetTotal(0);

    const userId = HARDCODED_USER_ID;
    if (!userId) {
      setErrorTotals("User not identified.");
      setIsLoadingTotals(false);
      return;
    }

    const monthNumber = getMonthNumber(selectedMonth);
    if (monthNumber < 0) {
      setErrorTotals("Invalid month selected.");
      setIsLoadingTotals(false);
      return;
    }

    // --- Calculate Estimated Recurring Income for the selected month ---
    let estimatedRecurringIncome = 0;
    const daysInMonth = new Date(selectedYear, monthNumber + 1, 0).getDate(); // Get days in the selected month

    accountIncomeData.forEach((account) => {
      const income = account.incomeAmount;
      const freq = account.incomeFrequency;

      if (income && income > 0 && freq) {
        switch (freq) {
          case "Daily":
            estimatedRecurringIncome += income * daysInMonth; // Multiply daily by days in current month
            break;
          case "Weekly":
            // Estimate weekly occurrences in the month (more accurate than fixed 4.33)
            // This is still an approximation. A more precise way involves checking specific dates.
            estimatedRecurringIncome += income * (daysInMonth / 7);
            break;
          case "Monthly":
            estimatedRecurringIncome += income; // Add monthly directly
            break;
        }
      }
    });
    // --- End Recurring Income Calculation ---

    // --- Fetch Transactions for the selected month ---
    const startDate = new Date(selectedYear, monthNumber, 1, 0, 0, 0);
    const endDate = new Date(selectedYear, monthNumber + 1, 1, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const transactionsCollectionRef = collection(
      db,
      "Accounts",
      userId,
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
            if (data.type === "Income") {
              incomeFromTransactions += data.amount;
            } else if (data.type === "Expenses") {
              expensesFromTransactions += data.amount;
            }
          }
        });

        // Combine recurring income with transaction income
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
          prev
            ? `${prev}\nFailed to load transaction totals.`
            : "Failed to load transaction totals."
        );
        if (err.code === "permission-denied") {
          setErrorTotals((prev) =>
            prev
              ? `${prev}\nPermission denied fetching transactions.`
              : "Permission denied fetching transactions."
          );
        }
        // Still set totals based on recurring income if transactions fail? Or show error?
        // Let's show the error and potentially zero out transaction-based values
        setTotalIncome(estimatedRecurringIncome); // Show at least recurring if transactions fail
        setTotalExpenses(0);
        setNetTotal(estimatedRecurringIncome);
        setIsLoadingTotals(false);
      }
    );

    // Cleanup listener
    return () => unsubscribeTransactions();
  }, [selectedYear, selectedMonth, accountIncomeData, isLoadingAccounts]); // Re-run when date changes OR account data is loaded/updated

  // --- Date Picker Logic (Keep as is) ---
  const showDatePicker = () => setShowYearPicker(true);
  const hideDatePicker = () => {
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setSelectedDate(`${selectedYear} ${month}`);
    setShowMonthPicker(false);
    // hideDatePicker(); // Optionally close both pickers
  };

  // --- Menu Animation (Keep as is) ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  // --- Menu Items (Keep as is) ---
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
      }}
    >
      <Text style={styles.menuItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // --- Render Totals (Keep as is - uses state updated by useEffect) ---
  const renderTotals = () => {
    if (isLoadingTotals || isLoadingAccounts) {
      // Check both loading states
      return (
        <ActivityIndicator
          size="small"
          color="white"
          style={styles.totalsLoader}
        />
      );
    }
    // Display combined errors if any
    if (errorTotals) {
      // Split error message into lines for better readability if multiple errors occurred
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

  // --- JSX (Main structure remains the same) ---
  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerWrapper}>
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

        <View style={styles.headerBottom}>
          <View style={styles.dateAndFilterContainer}>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={showDatePicker}
              >
                <Text style={styles.dateText}>{selectedDate}</Text>
                <Ionicons name="chevron-down-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.volumeSliderIcon}>
              <Ionicons name="options-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {/* --- Data Container (Totals) --- */}
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
                        styles.pickerItemSelected,
                    ]}
                    onPress={() => handleYearSelect(parseInt(item, 10))}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedYear === parseInt(item, 10) &&
                          styles.pickerTextSelected,
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
                      selectedMonth === item && styles.pickerItemSelected,
                    ]}
                    onPress={() => handleMonthSelect(item)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedMonth === item && styles.pickerTextSelected,
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

// --- Styles ---
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
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  iconContainer: {
    padding: 4,
    zIndex: 2,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateContainer: {
    alignItems: "flex-start",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dataContainer: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 6,
    paddingVertical: 8,
    minHeight: 50,
    justifyContent: "center",
  },
  categoryHeader: {
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
    flex: 1,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  categoryAmount: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  totalsLoader: {
    marginVertical: 5,
  },
  errorContainer: {
    // Container for error messages
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  errorText: {
    color: "#ffdddd",
    fontSize: 11, // Make error text slightly smaller
    textAlign: "center",
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  searchIcon: {
    padding: 4,
  },
  volumeSliderIcon: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    backgroundColor: "white",
    width: width * 0.75,
    height: "100%",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
  pickerModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  pickerContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
    maxHeight: height * 0.6,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: "#e0f2e0",
  },
  pickerText: {
    fontSize: 16,
    color: "#006400",
  },
  pickerTextSelected: {
    fontWeight: "bold",
  },
  pickerButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
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
