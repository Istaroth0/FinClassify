import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SelectDropdown from "react-native-select-dropdown";

// Import the Header and BottomNavigationBar components from the components folder
import HeaderTopNav from "../components/headertopnav";
import BotNavigationBar from "../components/botnavigationbar";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("Mar");
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [isFilterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [expenses, setExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const [total, setTotal] = useState(0);

  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };

  const menuItems = [
    { id: "1", title: "Profile" },
    { id: "2", title: "Settings" },
    { id: "3", title: "Help & Support" },
    { id: "4", title: "Logout" },
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
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

  const renderMenuItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        setMenuVisible(false);
        // Handle menu item press here, e.g., navigate to a specific screen
        console.log(`Navigating to ${item.title}`);
      }}
    >
      <Text style={styles.menuItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderFilterItem = (item: string) => (
    <TouchableOpacity
      style={styles.filterItem}
      onPress={() => {
        console.log("Selected filter:", item);
        setFilterDropdownVisible(false);
        // Add logic to handle the selected filter, e.g., update data fetching
      }}
    >
      <Text style={styles.filterItemText}>{item}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  useEffect(() => {
    // Calculate totals.  In a real app, you'd fetch this data.
    // For this example, I'm using dummy data.
    const newExpenses = 100; // Replace with actual expense calculation
    const newIncome = 200; // Replace with actual income calculation
    const newTotal = newIncome - newExpenses;

    setExpenses(newExpenses);
    setIncome(newIncome);
    setTotal(newTotal);
  }, [selectedYear, selectedMonth]); // Recalculate when year or month changes

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <HeaderTopNav />

        {/* Empty State Message */}
        <View style={styles.content}>
          <Image
            source={require("../assets/images/!.png")}
            style={styles.image}
          />
          <Text style={styles.noRecordText}>
            No record in this month. Tap + to add new expense or income.
          </Text>
        </View>

        {/* Bottom Navigation */}

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
            >
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
        {/* Filter Dropdown */}
        {isFilterDropdownVisible && (
          <View style={styles.filterDropdown}>
            {renderFilterItem("Weekly")}
            {renderFilterItem("Monthly")}
            {renderFilterItem("Annually")}
          </View>
        )}
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={navigateToTransaction}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <BotNavigationBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerContainer: {
    backgroundColor: "#0F730C",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuIcon: { padding: 5 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  searchIcon: { padding: 5 },
  dateAndStatsContainer: {
    backgroundColor: "#0F730C",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  date: { color: "white", fontSize: 16, fontWeight: "bold" },
  month: { color: "white", fontSize: 16 },
  statsContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
  statsItem: {
    alignItems: "center",
    flex: 1, // Distribute space evenly
    justifyContent: "center", // Center content vertically
  },
  statText: { color: "white", fontSize: 14, textAlign: "center" },
  statValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: { width: 80, height: 80, marginBottom: 10 },
  noRecordText: { fontSize: 14, color: "#555", textAlign: "center" },
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  navItem: { alignItems: "center" },
  navText: { color: "#0F730C", fontSize: 12, marginTop: 5 },
  navTextInactive: { color: "#888", fontSize: 12, marginTop: 5 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    backgroundColor: "white",
    width: width * 0.7,
    padding: 20,
    marginTop: 60,
  },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderColor: "#eee" },
  menuItemText: { fontSize: 16 },
  filterDropdown: {
    position: "absolute",
    top: 120, // Adjust position as needed
    right: 15, // Adjust position as needed
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterItem: {
    paddingVertical: 10,
  },
  filterItemText: {
    fontSize: 16,
  },
  dropdownButtonStyle: {
    height: 50,
    width: 100,
    backgroundColor: "#0F730C",
    borderRadius: 0,
    borderWidth: 0,
  },
  dropdownButtonTextStyle: {
    color: "white",
    textAlign: "left",
  },
});

export default HomeScreen;
