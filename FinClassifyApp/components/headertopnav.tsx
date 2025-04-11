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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Header = () => {
  const [selectedDate, setSelectedDate] = useState("2025 Mar");
  const [isMenuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("Mar");

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
    setSelectedDate(`${selectedYear} ${month}`);
    setShowMonthPicker(false);
    hideDatePicker();
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

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
      }}
    >
      <Text style={styles.menuItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        <View style={styles.dataContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderText}>Expenses</Text>
            <Text style={styles.categoryHeaderText}>Income</Text>
            <Text style={styles.categoryHeaderText}>Total</Text>
          </View>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryAmount}>₱ 0.00</Text>
            <Text style={styles.categoryAmount}>₱ 0.00</Text>
            <Text style={styles.categoryAmount}>₱ 0.00</Text>
          </View>
        </View>
      </View>

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

      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <FlatList
                data={years.map(String)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => handleYearSelect(parseInt(item, 10))}
                  >
                    <Text style={styles.pickerText}>{item}</Text>
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
          </View>
        </Modal>
      )}

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <FlatList
                data={months}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => handleMonthSelect(item)}
                  >
                    <Text style={styles.pickerText}>{item}</Text>
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
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#006400",
    padding: 8,
    flexDirection: "column",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        paddingTop: 40,
      },
      android: {
        paddingTop: 10,
      },
    }),
  },
  headerWrapper: {
    alignItems: "flex-start",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    padding: 4,
    zIndex: 2,
    flexDirection: "column",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  dateContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  dateText: {
    color: "white",
    marginRight: 3,
    fontSize: 12,
  },
  dateAndFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%", // Ensure it takes full width
  },
  dataContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 30,
  },
  categoryHeaderText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 3,
    width: "100%",
    paddingHorizontal: 30,
  },
  categoryLabel: {
    color: "white",
    fontSize: 10,
  },
  categoryAmount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    flex: 1,
    textAlign: "center",
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    padding: 4,
    zIndex: 2,
  },
  volumeSliderIcon: {
    padding: 4,
    zIndex: 2,
    marginHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    backgroundColor: "white",
    width: width * 0.7,
    padding: 15,
    marginTop: 0,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  menuItemText: {
    fontSize: 14,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    width: width * 0.7,
    maxHeight: height * 0.5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  pickerItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    cursor: "pointer",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  pickerButton: {
    marginTop: 15,
    padding: 8,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignSelf: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Header;
