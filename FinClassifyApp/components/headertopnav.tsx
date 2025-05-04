// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\components\headertopnav.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated, // Import Animated
  Dimensions,
  FlatList,
  Platform,
  ActivityIndicator,
  Image, // Added for ProfilePage
  TouchableWithoutFeedback, // <-- Add TouchableWithoutFeedback
  Alert, // Added for ProfilePage
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
import {
  getAuth,
  onAuthStateChanged,
  User,
  signOut, // Added for ProfilePage logout
} from "firebase/auth";
import { app } from "../app/firebase"; // Adjust path if needed
import { useDateContext } from "../app/context/DateContext"; // Import the context hook
import { useRouter } from "expo-router"; // <-- Import useRouter

const { width, height } = Dimensions.get("window");
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth

// --- Interfaces ---
interface AccountForIncome {
  id: string;
  incomeAmount?: number | null;
  incomeFrequency?: "Daily" | "Weekly" | "Monthly" | null;
}

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) {
    return "₱ 0.00";
  }
  const prefix = amount < 0 ? "-₱" : "₱";
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

type TimeFilter = "Daily" | "Weekly" | "Monthly";

// --- Embedded Profile Page Component Logic ---
interface ProfileModalContentProps {
  onClose: () => void;
}

const ProfileModalContent = ({ onClose }: ProfileModalContentProps) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const router = useRouter(); // <-- Get router instance
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProfileAuth = onAuthStateChanged(auth, (user) => {
      setProfileUser(user);
      setIsProfileLoading(false);
    });
    return () => unsubscribeProfileAuth();
  }, []);

  const handleLogout = async () => {
    if (!profileUser) return;
    try {
      await signOut(auth);
      onClose();
      // Alert.alert("Logged Out", "You have been successfully logged out."); // Optional: Remove alert if redirecting immediately
      router.replace("/"); // <-- Add navigation to login page
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", "Could not log out. Please try again.");
    }
  };

  return (
    <View style={styles.profileContainer}>
      {/* Top Bar */}
      <View style={styles.profileTopBar}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.profileTitle}>Profile</Text>
        <View /> {/* Spacer */}
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {isProfileLoading ? (
          <ActivityIndicator size="large" color="#006400" />
        ) : profileUser ? (
          <>
            <View style={styles.profilePhotoPlaceholder}>
              {profileUser.photoURL ? (
                <Image
                  source={{ uri: profileUser.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={80} color="#888" />
              )}
            </View>
            <Text style={styles.profileName}>
              {profileUser.displayName || "User Name"}
            </Text>
            <View style={styles.profileInfoContainer}>
              <View style={styles.profileInfoItem}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#555"
                  style={styles.profileInfoIcon}
                />
                <Text style={styles.profileInfoText}>{profileUser.email}</Text>
              </View>
              {profileUser.phoneNumber && (
                <View style={styles.profileInfoItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#555"
                    style={styles.profileInfoIcon}
                  />
                  <Text style={styles.profileInfoText}>
                    {profileUser.phoneNumber}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.profileInfoText}>Not Logged In</Text>
        )}
      </View>

      {/* Additional Sections */}
      <View style={styles.profileContent}>
        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.profileListItem}>
            <Text>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileListItem}>
            <Text>Notifications</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.profileListItem}>
            <Text>Currency</Text>
            <Text>PHP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileListItem}>
            <Text>Language</Text>
            <Text>English</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.profileLogoutButton,
            !profileUser && styles.profileDisabledButton,
          ]}
          onPress={handleLogout}
          disabled={!profileUser || isProfileLoading}
        >
          <Text style={styles.profileLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
// --- End Embedded Profile Page ---

const Header = () => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    selectedFilter,
    setSelectedFilter,
    selectedDateString,
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

  // Local state for UI control (modals)
  // Removed side menu state: const [isMenuVisible, setMenuVisible] = useState(false);
  // Removed animation ref: const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false); // State for Profile Modal
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  // --- Animation State for Profile Modal ---
  const slideAnimX = useRef(new Animated.Value(-width)).current; // Initialize off-screen left

  // --- Listen for Auth State Changes ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        console.log("Header: No user logged in.");
        setErrorTotals("Please log in to view totals.");
        setIsLoadingTotals(false);
        setIsLoadingAccounts(false);
        setAccountIncomeData([]);
        setTotalIncome(0);
        setTotalExpenses(0);
        setNetTotal(0);
        if (isProfileModalVisible) {
          setProfileModalVisible(false);
        }
      }
    });
    return () => unsubscribeAuth();
  }, [isProfileModalVisible]);

  // --- Fetch Accounts ---
  useEffect(() => {
    if (!currentUser) {
      setIsLoadingAccounts(false);
      setAccountIncomeData([]);
      return;
    }
    setIsLoadingAccounts(true);
    const accountsCollectionRef = collection(
      db,
      "Accounts",
      currentUser.uid,
      "accounts"
    );
    const q = query(accountsCollectionRef);
    const unsubscribeAccounts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAccounts: AccountForIncome[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data &&
            typeof data.incomeAmount === "number" &&
            data.incomeAmount > 0 &&
            data.incomeFrequency
          ) {
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
        setErrorTotals("Failed to load account income data.");
        setIsLoadingAccounts(false);
      }
    );
    return () => unsubscribeAccounts();
  }, [currentUser]);

  // --- Fetch Totals & Calculate ---
  useEffect(() => {
    if (isLoadingAccounts || !currentUser) {
      setIsLoadingTotals(true);
      return;
    }
    setIsLoadingTotals(true);
    setErrorTotals(null);
    setTotalIncome(0);
    setTotalExpenses(0);
    setNetTotal(0);

    if (!currentUser.uid) {
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

    let startDate: Date;
    let endDate: Date;
    const now = new Date();
    if (selectedFilter === "Daily") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
    } else if (selectedFilter === "Weekly") {
      const dayOfWeek = now.getDay();
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dayOfWeek,
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (7 - dayOfWeek),
        0,
        0,
        0
      );
    } else {
      // Monthly
      startDate = new Date(selectedYear, monthNumber, 1, 0, 0, 0);
      endDate = new Date(selectedYear, monthNumber + 1, 1, 0, 0, 0);
    }
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    let estimatedRecurringIncome = 0;
    const daysInFilterPeriod =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const approxDaysInMonth = 365.25 / 12;
    const approxDaysInWeek = 7;
    accountIncomeData.forEach((account) => {
      const income = account.incomeAmount;
      const freq = account.incomeFrequency;
      if (typeof income === "number" && income > 0 && freq) {
        switch (freq) {
          case "Daily":
            estimatedRecurringIncome += income * daysInFilterPeriod;
            break;
          case "Weekly":
            estimatedRecurringIncome +=
              income * (daysInFilterPeriod / approxDaysInWeek);
            break;
          case "Monthly":
            estimatedRecurringIncome +=
              income * (daysInFilterPeriod / approxDaysInMonth);
            break;
        }
      }
    });

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
          if (data && typeof data.amount === "number" && data.type) {
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
        setErrorTotals("Failed to load transaction totals.");
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
    selectedFilter,
  ]);

  // --- Date Picker Logic ---
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
    setShowMonthPicker(false);
  };

  // --- Filter Modal Logic ---
  const handleFilterSelect = (filter: TimeFilter) => {
    setSelectedFilter(filter);
    setIsFilterModalVisible(false);
  };

  // --- Profile Modal Animation Effect ---
  useEffect(() => {
    if (isProfileModalVisible) {
      // Slide in
      Animated.timing(slideAnimX, {
        toValue: 0, // Slide to position 0 (on-screen)
        duration: 300,
        useNativeDriver: true, // Use native driver for performance
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnimX, {
        toValue: -width, // Slide back off-screen left
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isProfileModalVisible, slideAnimX]);

  // --- Removed Menu Animation Effect ---
  // useEffect(() => { ... }, [isMenuVisible]);

  // --- Removed Menu Items and Rendering Logic ---
  // const menuItems = [...];
  // const renderMenuItem = (...) => { ... };

  // --- Render Totals ---
  const renderTotals = () => {
    if (isLoadingTotals || isLoadingAccounts || !currentUser) {
      return (
        <ActivityIndicator
          size="small"
          color="white"
          style={styles.totalsLoader}
        />
      );
    }
    if (errorTotals && !isLoadingTotals) {
      const errorLines = errorTotals.split("\n").map((line, index) => (
        <Text key={index} style={styles.errorText} numberOfLines={1}>
          {line}
        </Text>
      ));
      return <View style={styles.errorContainer}>{errorLines}</View>;
    }
    return (
      <View style={styles.categoryItemContent}>
        {" "}
        {/* Wrap in a View */}
        <Text
          style={styles.categoryAmount}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatCurrency(totalExpenses)}
        </Text>
        <Text
          style={styles.categoryAmount}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatCurrency(totalIncome)}
        </Text>
        <Text
          style={styles.categoryAmount}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatCurrency(netTotal)}
        </Text>
      </View>
    );
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerWrapper}>
        {/* Top Row */}
        <View style={styles.headerTop}>
          {/* Updated Menu Icon Press Handler */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setProfileModalVisible(true)}
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
        {/* Middle Row */}
        <View style={styles.headerBottom}>
          <View style={styles.dateAndFilterContainer}>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={showDatePicker}
                disabled={selectedFilter !== "Monthly"}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedFilter !== "Monthly" && styles.dateTextDisabled,
                  ]}
                >
                  {selectedFilter === "Monthly"
                    ? selectedDateString
                    : selectedFilter}
                </Text>
                {selectedFilter === "Monthly" && (
                  <Ionicons
                    name="chevron-down-outline"
                    size={16}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.volumeSliderIcon}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom Row */}
        <View style={styles.dataContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderText}>Expenses</Text>
            <Text style={styles.categoryHeaderText}>Income</Text>
            <Text style={styles.categoryHeaderText}>Total</Text>
          </View>
          <View style={styles.categoryItem}>{renderTotals()}</View>
        </View>
      </View>

      {/* Removed Side Menu Modal */}

      {/* Profile Page Modal */}
      <Modal
        visible={isProfileModalVisible}
        transparent={true} // Make transparent to see animation
        animationType="fade" // Use fade or none for background dimming
        onRequestClose={() => setProfileModalVisible(false)}
      >
        {/* Animated container for the sliding effect */}
        <Animated.View
          style={[
            styles.animatedProfileContainer,
            { transform: [{ translateX: slideAnimX }] },
          ]}
        >
          <ProfileModalContent onClose={() => setProfileModalVisible(false)} />
        </Animated.View>
      </Modal>

      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal transparent animationType="fade" onRequestClose={hideDatePicker}>
          <TouchableWithoutFeedback // <-- Change to TouchableWithoutFeedback
            style={styles.pickerModalContainer}
            // activeOpacity={1} // Not applicable
            onPress={hideDatePicker} // Use onPress for TouchableWithoutFeedback
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
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <Modal transparent animationType="fade" onRequestClose={hideDatePicker}>
          <TouchableWithoutFeedback // <-- Change to TouchableWithoutFeedback
            style={styles.pickerModalContainer}
            // activeOpacity={1} // Not applicable
            onPress={hideDatePicker} // Use onPress for TouchableWithoutFeedback
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
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Filter Selection Modal */}
      {isFilterModalVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <TouchableWithoutFeedback // <-- Change to TouchableWithoutFeedback
            style={styles.pickerModalContainer}
            // activeOpacity={1} // Not applicable
            onPress={() => setIsFilterModalVisible(false)} // Use onPress for TouchableWithoutFeedback
          >
            <View
              style={styles.pickerContent}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.pickerTitle}>Select Time Filter</Text>
              {(["Daily", "Weekly", "Monthly"] as TimeFilter[]).map(
                (filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.pickerItem,
                      selectedFilter === filter && styles.pickerItemSelected,
                    ]}
                    onPress={() => handleFilterSelect(filter)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedFilter === filter && styles.pickerTextSelected,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.pickerButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

// --- Styles (Includes merged ProfilePage styles prefixed with 'profile') ---
const styles = StyleSheet.create({
  // --- Header Styles ---
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
  headerBottom: { flexDirection: "row", alignItems: "center", width: "100%" },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  iconContainer: { padding: 4, zIndex: 2 },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateContainer: { alignItems: "flex-start" },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dateText: { color: "white", marginRight: 4, fontSize: 14, fontWeight: "500" },
  dateTextDisabled: { color: "#cccccc" },
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
    paddingHorizontal: 2,
  },
  totalsLoader: { marginVertical: 5 },
  categoryItemContent: {
    // Style for the new wrapper inside categoryItem
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  errorText: { color: "#ffdddd", fontSize: 11, textAlign: "center" },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  searchIcon: { padding: 4 },
  volumeSliderIcon: { padding: 4 },

  // --- Removed Side Menu Styles ---
  // modalOverlay: { ... },
  // menuContainer: { ... },
  // menuItem: { ... },
  // menuItemText: { ... },

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
  pickerItemSelected: { backgroundColor: "#e0f2e0" },
  pickerText: { fontSize: 16, color: "#006400" },
  pickerTextSelected: { fontWeight: "bold" },
  pickerButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    alignSelf: "center",
  },
  pickerButtonText: { fontSize: 16, color: "#555", fontWeight: "500" },

  // --- Profile Page Styles (Prefixed) ---
  animatedProfileContainer: {
    // Style for the animated wrapper
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%", // Adjust width if needed (e.g., 80% for a drawer effect)
    height: "100%",
  },
  profileContainer: { flex: 1, backgroundColor: "#f4f4f4" },
  profileTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#006400",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 15,
  },
  profileTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  profileHeader: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 20,
  },
  profilePhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 40 },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  profileInfoContainer: { width: "80%", alignItems: "center" },
  profileInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileInfoIcon: { marginRight: 10, color: "#777" },
  profileInfoText: { fontSize: 16, color: "#555" },
  profileContent: { paddingHorizontal: 15 },
  profileSection: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  profileListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileLogoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  profileLogoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
  profileDisabledButton: { backgroundColor: "#aaa", opacity: 0.7 },
});

export default Header;
