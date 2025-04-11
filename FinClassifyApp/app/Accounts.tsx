import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ImageSourcePropType,
  Alert,
} from "react-native";
import Header from "@/components/headertopnav";
import BottomNavigationBar from "@/components/botnavigationbar";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
// --- Image Assets ---
const CardsSource = require("../assets/CAImages/Cards.png");
const MoneySource = require("../assets/CAImages/Money.png");
const PiggybankSource = require("../assets/CAImages/Piggybank.png");
const StoreSource = require("../assets/CAImages/Store.png");
const WalletSource = require("../assets/CAImages/Wallet.png");

// --- Interfaces ---
interface AccountImageOption {
  id: string;
  source: ImageSourcePropType;
  name: string;
}

interface AccountRecord {
  id: string;
  title: string;
  balance: number;
  iconSource: ImageSourcePropType;
}

// --- Data ---
const accountIconOptions: AccountImageOption[] = [
  { id: "1", source: CardsSource, name: "Cards" },
  { id: "2", source: MoneySource, name: "Money" },
  { id: "3", source: PiggybankSource, name: "Piggybank" },
  { id: "4", source: StoreSource, name: "Store" },
  { id: "5", source: WalletSource, name: "Wallet" },
];

// --- Component ---
function Accounts() {
  const navigation = useNavigation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([
    { id: "1", title: "Cash", balance: 12301239, iconSource: WalletSource },
  ]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountAmount, setNewAccountAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<AccountImageOption | null>(
    null
  );

  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };
  // State for editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // --- Helper Functions ---
  const findIconOptionBySource = (
    source: ImageSourcePropType
  ): AccountImageOption | null => {
    // This is a basic comparison; might need refinement if sources are complex objects
    return (
      accountIconOptions.find(
        (option) => JSON.stringify(option.source) === JSON.stringify(source)
      ) || null
    );
  };

  // --- Modal Handling ---
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingAccountId(null);
    setNewAccountName("");
    setNewAccountAmount("");
    setSelectedIcon(null);
    setIsModalVisible(true);
  };

  const openEditModal = (account: AccountRecord) => {
    setIsEditMode(true);
    setEditingAccountId(account.id);
    setNewAccountName(account.title);
    setNewAccountAmount(String(account.balance)); // Convert balance to string for TextInput
    setSelectedIcon(findIconOptionBySource(account.iconSource)); // Find the corresponding icon option
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    // Reset edit state as well
    setIsEditMode(false);
    setEditingAccountId(null);
    // Keep input fields reset logic if desired, or remove if you want them to persist briefly
    setNewAccountName("");
    setNewAccountAmount("");
    setSelectedIcon(null);
  };

  // --- CRUD Operations ---
  const handleSaveAccount = () => {
    // Validation
    if (!newAccountName.trim()) {
      Alert.alert("Validation Error", "Please enter an account name.");
      return;
    }
    if (!newAccountAmount) {
      Alert.alert("Validation Error", "Please enter an initial amount.");
      return;
    }
    const amount = parseFloat(newAccountAmount);
    if (isNaN(amount)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid number for the amount."
      );
      return;
    }
    if (!selectedIcon) {
      Alert.alert("Validation Error", "Please select an icon for the account.");
      return;
    }

    // Create or Update
    if (isEditMode && editingAccountId) {
      // --- Update Existing Account ---
      setAccountRecords((prevRecords) =>
        prevRecords.map((acc) =>
          acc.id === editingAccountId
            ? {
                ...acc,
                title: newAccountName.trim(),
                balance: amount,
                iconSource: selectedIcon.source,
              }
            : acc
        )
      );
    } else {
      // --- Add New Account ---
      const newAccount: AccountRecord = {
        id: String(Date.now()),
        title: newAccountName.trim(),
        balance: amount,
        iconSource: selectedIcon.source,
      };
      setAccountRecords((prevRecords) => [...prevRecords, newAccount]);
    }

    closeModal();
  };

  const handleDeleteAccount = (accountToDelete: AccountRecord) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete the account "${accountToDelete.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setAccountRecords((prevRecords) =>
              prevRecords.filter((acc) => acc.id !== accountToDelete.id)
            );
          },
          style: "destructive",
        },
      ],
      { cancelable: true } // Allow dismissing by tapping outside on Android
    );
  };

  // --- Rendering ---
  return (
    <>
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.scrollView}>
          {accountRecords.map((acrecord) => (
            <View key={acrecord.id} style={styles.accountItem}>
              <Image
                source={acrecord.iconSource}
                style={styles.accountIconImage}
                resizeMode="contain"
              />
              <View style={styles.accountDetails}>
                <Text style={styles.accountTitle}>{acrecord.title}</Text>
                <Text style={styles.accountBalance}>
                  Balance: {acrecord.balance.toLocaleString()} ₱
                </Text>
              </View>
              {/* --- Action Buttons --- */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => openEditModal(acrecord)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil-outline" size={22} color="#006400" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAccount(acrecord)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={22} color="#D32F2F" />{" "}
                  {/* Red color for delete */}
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal} // Use the specific function to open in add mode
          >
            <Ionicons name="add-circle-outline" size={24} color="#006400" />
            <Text style={styles.addButtonText}>Add New Account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* --- Add/Edit Account Modal --- */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalParent}>
            <View style={styles.modalContainer}>
              {/* Dynamic Modal Title */}
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Account" : "Add an Account"}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  placeholder="0.00"
                  style={styles.input}
                  keyboardType="numeric"
                  value={newAccountAmount}
                  onChangeText={setNewAccountAmount}
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  placeholder="e.g., Savings, Wallet"
                  style={styles.input}
                  value={newAccountName}
                  onChangeText={setNewAccountName}
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Icon</Text>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.iconScrollView}
                >
                  {accountIconOptions.map((iconOption) => (
                    <TouchableOpacity
                      key={iconOption.id}
                      style={[
                        styles.iconTouchable,
                        selectedIcon?.id === iconOption.id &&
                          styles.iconSelected,
                      ]}
                      onPress={() => setSelectedIcon(iconOption)}
                    >
                      <Image
                        source={iconOption.source}
                        style={styles.iconImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAccount} // This function now handles both add and edit
                  style={[styles.modalButton, styles.saveButton]}
                >
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={navigateToTransaction}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <BottomNavigationBar />
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingLeft: 15, // Adjust padding
    paddingRight: 5, // Adjust padding
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  accountIconImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  accountDetails: {
    flex: 1, // Allow details to take up available space
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  accountBalance: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  // Container for edit/delete buttons
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10, // Add some space between details and buttons
  },
  actionButton: {
    padding: 8, // Add padding for easier tapping
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#006400",
  },
  // --- Modal Styles ---
  modalParent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#CC9A02",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    height: 45,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  iconScrollView: {
    paddingVertical: 10,
  },
  iconTouchable: {
    marginRight: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
  },
  iconSelected: {
    borderColor: "#006400",
  },
  iconImage: {
    width: 60,
    height: 60,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#006400",
    borderColor: "#006400",
  },
  saveButtonText: {
    color: "#fff",
  },
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
});

export default Accounts;
