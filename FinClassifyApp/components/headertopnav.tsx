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
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust path if needed

const { width, height } = Dimensions.get("window");
const db = getFirestore(app);
const HARDCODED_USER_ID = "User"; // Use the same hardcoded user ID

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `₱ ${amount.toFixed(2)}`;
};

// Helper function to get month number (0-indexed)
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
  ); // Combined state

  const [isMenuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // State for totals and loading
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [errorTotals, setErrorTotals] = useState<string | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // Adjust range as needed

  // --- Fetch Totals from Firestore ---
  useEffect(() => {
    setIsLoadingTotals(true);
    setErrorTotals(null);
    setTotalIncome(0); // Reset totals on change
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

    // Calculate start and end timestamps for the selected month
    const startDate = new Date(selectedYear, monthNumber, 1, 0, 0, 0);
    const endDate = new Date(selectedYear, monthNumber + 1, 1, 0, 0, 0); // Start of the next month

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
      where("timestamp", "<", endTimestamp) // Use '<' for end date to exclude start of next month
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let currentIncome = 0;
        let currentExpenses = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.amount === "number") {
            if (data.type === "Income") {
              currentIncome += data.amount;
            } else if (data.type === "Expenses") {
              // Assuming expenses are stored as positive numbers
              currentExpenses += data.amount;
            }
          }
        });

        setTotalIncome(currentIncome);
        setTotalExpenses(currentExpenses);
        setNetTotal(currentIncome - currentExpenses);
        setIsLoadingTotals(false);
      },
      (err) => {
        console.error("Error fetching totals: ", err);
        setErrorTotals("Failed to load totals.");
        if (err.code === "permission-denied") {
          setErrorTotals("Permission denied fetching totals.");
        }
        setIsLoadingTotals(false);
      }
    );

    // Cleanup listener on component unmount or when dependencies change
    return () => unsubscribe();
  }, [selectedYear, selectedMonth]); // Re-run effect when year or month changes

  // --- Date Picker Logic ---
  const showDatePicker = () => {
    setShowYearPicker(true);
  };

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
    setSelectedDate(`${selectedYear} ${month}`); // Update combined state
    setShowMonthPicker(false);
    // hideDatePicker(); // Close both pickers
  };

  // --- Menu Animation ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  // --- Menu Items ---
  const menuItems = [
    { id: "1", title: "Profile" },
    { id: "2", title: "Settings" },
    { id: "3", title: "Logout" },
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

  // --- Render Totals ---
  const renderTotals = () => {
    if (isLoadingTotals) {
      return (
        <ActivityIndicator
          size="small"
          color="white"
          style={styles.totalsLoader}
        />
      );
    }
    if (errorTotals) {
      return <Text style={styles.errorText}>{errorTotals}</Text>;
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
          <View style={styles.categoryItem}>
            {/* Render totals or loading/error state */}
            {renderTotals()}
          </View>
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
            onStartShouldSetResponder={() => true}
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
                        styles.pickerItemSelected, // Highlight selected year
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
                      selectedMonth === item && styles.pickerItemSelected, // Highlight selected month
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
    minHeight: 50, // Ensure container has height for loader/error
    justifyContent: "center", // Center loader/error vertically
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
    alignItems: "center", // Align items vertically
  },
  categoryAmount: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  totalsLoader: {
    // Style loader if needed, e.g., margin
    marginVertical: 5,
  },
  errorText: {
    color: "#ffdddd", // Light red for visibility on dark background
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 10,
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
  // --- Modal Styles ---
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
  // --- Picker Modal Styles ---
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
    // Style for selected item background
    backgroundColor: "#e0f2e0", // Light green background
  },
  pickerText: {
    fontSize: 16,
    color: "#006400",
  },
  pickerTextSelected: {
    // Style for selected item text
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
