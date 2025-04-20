// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\Accounts.tsx
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import Header from "@/components/headertopnav";
import BottomNavigationBar from "@/components/botnavigationbar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc, // Keep for potential non-transactional adds elsewhere
  updateDoc, // Keep for potential non-transactional updates elsewhere
  deleteDoc,
  doc,
  query,
  orderBy,
  runTransaction, // Import runTransaction
  serverTimestamp, // Import serverTimestamp
  writeBatch, // Import writeBatch for potential future use (though transaction is better here)
} from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust path if needed

// --- Firestore Initialization ---
const db = getFirestore(app);
const HARDCODED_USER_ID = "User";

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

type IncomeFrequency = "Daily" | "Weekly" | "Monthly" | null;

interface AccountRecord {
  id: string;
  title: string;
  balance: number;
  iconName: string;
  incomeAmount?: number | null;
  incomeFrequency?: IncomeFrequency;
}

// --- Data ---
const accountIconOptions: AccountImageOption[] = [
  { id: "1", source: CardsSource, name: "Cards" },
  { id: "2", source: MoneySource, name: "Money" },
  { id: "3", source: PiggybankSource, name: "Piggybank" },
  { id: "4", source: StoreSource, name: "Store" },
  { id: "5", source: WalletSource, name: "Wallet" },
];

const incomeFrequencies: IncomeFrequency[] = ["Daily", "Weekly", "Monthly"];

// --- Helper functions ---
const formatCurrency = (amount: number): string => {
  return `₱ ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const getIconSourceFromName = (
  iconName: string | undefined
): ImageSourcePropType => {
  const foundOption = accountIconOptions.find(
    (option) => option.name === iconName
  );
  return foundOption ? foundOption.source : WalletSource;
};

// --- Component ---
function Accounts() {
  const navigation = useNavigation();

  // Account State
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [errorAccounts, setErrorAccounts] = useState<string | null>(null);

  // Account Modal State
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountAmount, setNewAccountAmount] = useState("");
  const [selectedIconOption, setSelectedIconOption] =
    useState<AccountImageOption | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newAccountIncomeAmount, setNewAccountIncomeAmount] = useState("");
  const [selectedIncomeFrequency, setSelectedIncomeFrequency] =
    useState<IncomeFrequency>(null);

  // Calculated Total Income State
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState<number>(0);
  const [totalWeeklyIncome, setTotalWeeklyIncome] = useState<number>(0);
  const [totalDailyIncome, setTotalDailyIncome] = useState<number>(0);

  // --- Navigation ---
  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };

  // --- Fetch Accounts from Firestore ---
  useEffect(() => {
    setIsLoadingAccounts(true);
    setErrorAccounts(null);
    const userId = HARDCODED_USER_ID;
    const accountsCollectionRef = collection(
      db,
      "Accounts",
      userId,
      "accounts"
    );
    const q = query(accountsCollectionRef, orderBy("title"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAccounts: AccountRecord[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data &&
            typeof data.title === "string" &&
            typeof data.balance === "number" &&
            typeof data.iconName === "string"
          ) {
            fetchedAccounts.push({
              id: doc.id,
              title: data.title,
              balance: data.balance,
              iconName: data.iconName,
              incomeAmount: data.incomeAmount ?? null,
              incomeFrequency: data.incomeFrequency ?? null,
            });
          } else {
            console.warn(`Invalid account data found for doc ID: ${doc.id}`);
          }
        });
        setAccountRecords(fetchedAccounts);
        setIsLoadingAccounts(false);
      },
      (err) => {
        console.error("Error fetching accounts: ", err);
        setErrorAccounts("Failed to load accounts. Please try again.");
        if (err.code === "permission-denied") {
          setErrorAccounts(
            "Permission denied. Check Firestore rules for Accounts/User/accounts."
          );
        }
        setIsLoadingAccounts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // --- Calculate Total Income ---
  useEffect(() => {
    let calculatedMonthlyTotal = 0;
    accountRecords.forEach((account) => {
      const income = account.incomeAmount;
      const freq = account.incomeFrequency;
      if (income && income > 0 && freq) {
        switch (freq) {
          case "Daily":
            calculatedMonthlyTotal += income * (365 / 12);
            break;
          case "Weekly":
            calculatedMonthlyTotal += income * (52 / 12);
            break;
          case "Monthly":
            calculatedMonthlyTotal += income;
            break;
        }
      }
    });
    setTotalMonthlyIncome(calculatedMonthlyTotal);
    if (calculatedMonthlyTotal > 0) {
      const yearlyIncome = calculatedMonthlyTotal * 12;
      setTotalWeeklyIncome(yearlyIncome / 52);
      setTotalDailyIncome(yearlyIncome / 365);
    } else {
      setTotalWeeklyIncome(0);
      setTotalDailyIncome(0);
    }
  }, [accountRecords]);

  // --- Helper Function to find icon option by name ---
  const findIconOptionByName = (
    name: string | undefined
  ): AccountImageOption | null => {
    return accountIconOptions.find((option) => option.name === name) || null;
  };

  // --- Reset Modal Fields ---
  const resetModalFields = () => {
    setNewAccountName("");
    setNewAccountAmount("");
    setSelectedIconOption(null);
    setNewAccountIncomeAmount("");
    setSelectedIncomeFrequency(null);
  };

  // --- Account Modal Handling ---
  const openAddAccountModal = () => {
    setIsEditMode(false);
    setEditingAccountId(null);
    resetModalFields();
    setIsAccountModalVisible(true);
  };

  const openEditAccountModal = (account: AccountRecord) => {
    setIsEditMode(true);
    setEditingAccountId(account.id);
    setNewAccountName(account.title);
    setNewAccountAmount(String(account.balance)); // Store current balance for comparison later
    setSelectedIconOption(findIconOptionByName(account.iconName));
    setNewAccountIncomeAmount(
      account.incomeAmount ? String(account.incomeAmount) : ""
    );
    setSelectedIncomeFrequency(account.incomeFrequency || null);
    setIsAccountModalVisible(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalVisible(false);
    setIsEditMode(false);
    setEditingAccountId(null);
    resetModalFields();
  };

  // --- CRUD Operations ---
  const handleSaveAccount = async () => {
    // --- Validations ---
    if (!newAccountName.trim()) {
      Alert.alert("Validation Error", "Please enter an account name.");
      return;
    }
    if (!newAccountAmount) {
      Alert.alert("Validation Error", "Please enter an initial balance.");
      return;
    }
    const newBalance = parseFloat(newAccountAmount);
    if (isNaN(newBalance)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid number for the balance."
      );
      return;
    }
    if (!selectedIconOption) {
      Alert.alert("Validation Error", "Please select an icon for the account.");
      return;
    }
    let incomeAmount: number | null = null;
    if (newAccountIncomeAmount.trim()) {
      incomeAmount = parseFloat(newAccountIncomeAmount);
      if (isNaN(incomeAmount) || incomeAmount < 0) {
        Alert.alert(
          "Validation Error",
          "Please enter a valid positive number for the income amount or leave it blank."
        );
        return;
      }
      if (!selectedIncomeFrequency) {
        Alert.alert(
          "Validation Error",
          "Please select an income frequency if entering an income amount."
        );
        return;
      }
    } else {
      if (selectedIncomeFrequency) {
        Alert.alert(
          "Validation Error",
          "Please clear the income frequency if no income amount is entered."
        );
        return;
      }
    }
    // --- End Validations ---

    const userId = HARDCODED_USER_ID;
    const accountData = {
      title: newAccountName.trim(),
      balance: newBalance,
      iconName: selectedIconOption.name,
      incomeAmount: incomeAmount,
      incomeFrequency: incomeAmount ? selectedIncomeFrequency : null,
    };

    // --- Firestore Transaction ---
    try {
      await runTransaction(db, async (transaction) => {
        const accountsCollectionRef = collection(
          db,
          "Accounts",
          userId,
          "accounts"
        );
        const transactionsCollectionRef = collection(
          db,
          "Accounts",
          userId,
          "transactions"
        );
        let accountDocRef;
        let balanceChange = 0;
        let transactionType: "Income" | "Expenses" | null = null;
        let transactionCategory = "";
        let transactionIcon = "bank-transfer"; // Default icon for adjustments

        if (isEditMode && editingAccountId) {
          // --- EDIT MODE ---
          accountDocRef = doc(accountsCollectionRef, editingAccountId);
          const accountDoc = await transaction.get(accountDocRef);
          if (!accountDoc.exists()) {
            throw new Error("Account to edit does not exist!");
          }
          const currentBalance = accountDoc.data()?.balance ?? 0;
          balanceChange = newBalance - currentBalance;

          transaction.update(accountDocRef, accountData);

          if (balanceChange !== 0) {
            transactionType = balanceChange > 0 ? "Income" : "Expenses";
            transactionCategory = "Balance Adjustment";
            transactionIcon = balanceChange > 0 ? "bank-plus" : "bank-minus";
          }
        } else {
          // --- ADD MODE ---
          accountDocRef = doc(accountsCollectionRef);
          transaction.set(accountDocRef, accountData);

          if (newBalance > 0) {
            balanceChange = newBalance;
            transactionType = "Income";
            transactionCategory = "Initial Balance";
            transactionIcon = "bank-plus";
          }
        }

        // --- Create Transaction Record ---
        if (transactionType && balanceChange !== 0) {
          const newTransactionRef = doc(transactionsCollectionRef);
          const transactionData = {
            type: transactionType,
            categoryName: transactionCategory,
            categoryIcon: transactionIcon,
            amount: Math.abs(balanceChange),
            accountId: accountDocRef.id,
            accountName: accountData.title,
            timestamp: serverTimestamp(),
          };
          transaction.set(newTransactionRef, transactionData);
        }
      });

      // --- Success ---
      console.log("Account and transaction successfully saved!");
      Alert.alert(
        "Success",
        `Account ${isEditMode ? "updated" : "added"} successfully.`
      );
      closeAccountModal();
    } catch (error: any) {
      // --- Error Handling ---
      console.error("Account save transaction failed: ", error);
      Alert.alert(
        "Error",
        `Could not save the account. ${error.message || "Please try again."}`
      );
    }
  };

  const handleDeleteAccount = (accountToDelete: AccountRecord) => {
    // --- Keep existing delete logic ---
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete the account "${accountToDelete.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const userId = HARDCODED_USER_ID;
            const accountDocRef = doc(
              db,
              "Accounts",
              userId,
              "accounts",
              accountToDelete.id
            );
            try {
              await deleteDoc(accountDocRef);
              Alert.alert(
                "Success",
                `Account "${accountToDelete.title}" deleted.`
              );
            } catch (error: any) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                `Could not delete account. ${
                  error.message || "Please try again."
                }`
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // --- Render Loading/Error/Content ---
  const renderAccountList = () => {
    if (isLoadingAccounts) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#006400" />
          <Text style={styles.infoText}>Loading Accounts...</Text>
        </View>
      );
    }
    if (errorAccounts) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={40} color="red" />
          <Text style={[styles.infoText, styles.errorText]}>
            {errorAccounts}
          </Text>
        </View>
      );
    }
    if (accountRecords.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="wallet-outline" size={40} color="#888" />
          <Text style={styles.infoText}>No accounts found.</Text>
          <Text style={styles.infoText}>Tap 'Add New Account' below.</Text>
        </View>
      );
    }
    return (
      <>
        {accountRecords.map((acrecord) => (
          <View key={acrecord.id} style={styles.accountItem}>
            <Image
              source={getIconSourceFromName(acrecord.iconName)}
              style={styles.accountIconImage}
              resizeMode="contain"
            />
            <View style={styles.accountDetails}>
              <Text style={styles.accountTitle}>{acrecord.title}</Text>
              <Text style={styles.accountBalance}>
                Balance: {formatCurrency(acrecord.balance)}
              </Text>
              {acrecord.incomeAmount && acrecord.incomeFrequency && (
                <Text style={styles.accountIncomeInfo}>
                  Income: {formatCurrency(acrecord.incomeAmount)} /{" "}
                  {acrecord.incomeFrequency}
                </Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => openEditAccountModal(acrecord)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil-outline" size={22} color="#006400" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteAccount(acrecord)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={22} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </>
    );
  };

  // --- Rendering ---
  return (
    <>
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.scrollView}>
          {/* --- TOTAL Income Section --- */}
          <View style={styles.incomeSection}>
            <View style={styles.incomeHeader}>
              <Text style={styles.incomeTitle}>Total Estimated Income</Text>
            </View>
            <View style={styles.incomeDetails}>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Monthly (Avg):</Text>
                <Text style={styles.incomeValue}>
                  {formatCurrency(totalMonthlyIncome)}
                </Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Weekly (Avg):</Text>
                <Text style={styles.incomeValue}>
                  {formatCurrency(totalWeeklyIncome)}
                </Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Daily (Avg):</Text>
                <Text style={styles.incomeValue}>
                  {formatCurrency(totalDailyIncome)}
                </Text>
              </View>
            </View>
          </View>

          {/* --- Add New Account Button (Moved Here) --- */}
          {!isLoadingAccounts && !errorAccounts && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddAccountModal}
            >
              <Ionicons name="add-circle-outline" size={24} color="#006400" />
              <Text style={styles.addButtonText}>Add New Account</Text>
            </TouchableOpacity>
          )}
          {/* --- End Add New Account Button --- */}

          {/* --- Accounts List --- */}
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          {renderAccountList()}

          {/* Button Removed From Bottom */}
        </ScrollView>

        {/* --- Add/Edit Account Modal --- */}
        <Modal
          visible={isAccountModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeAccountModal}
        >
          <View style={styles.modalParent}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? "Edit Account" : "Add New Account"}
                </Text>

                {/* Balance */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Current Balance (₱)</Text>
                  <TextInput
                    placeholder="0.00"
                    style={styles.input}
                    keyboardType="numeric"
                    value={newAccountAmount}
                    onChangeText={setNewAccountAmount}
                    placeholderTextColor="#888"
                  />
                </View>

                {/* Account Name */}
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

                {/* Icon Selection */}
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
                          selectedIconOption?.id === iconOption.id &&
                            styles.iconSelected,
                        ]}
                        onPress={() => setSelectedIconOption(iconOption)}
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

                {/* --- Income Section in Modal --- */}
                <View style={styles.modalIncomeSection}>
                  <Text style={styles.modalSectionTitle}>
                    Associated Income (Optional)
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Income Amount (₱)</Text>
                    <TextInput
                      placeholder="e.g., 1000 (Leave blank if none)"
                      style={styles.input}
                      keyboardType="numeric"
                      value={newAccountIncomeAmount}
                      onChangeText={setNewAccountIncomeAmount}
                      placeholderTextColor="#888"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Income Frequency</Text>
                    <View style={styles.frequencySelector}>
                      {incomeFrequencies.map((freq) => (
                        <TouchableOpacity
                          key={freq}
                          style={[
                            styles.frequencyButton,
                            selectedIncomeFrequency === freq &&
                              styles.frequencyButtonSelected,
                          ]}
                          onPress={() => setSelectedIncomeFrequency(freq)}
                          disabled={!newAccountIncomeAmount.trim()}
                        >
                          <Text
                            style={[
                              styles.frequencyButtonText,
                              selectedIncomeFrequency === freq &&
                                styles.frequencyButtonTextSelected,
                              !newAccountIncomeAmount.trim() &&
                                styles.frequencyButtonDisabledText,
                            ]}
                          >
                            {freq}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                {/* --- End Income Section --- */}

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={closeAccountModal}
                    style={[styles.modalButton, styles.cancelButton]}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAccount}
                    style={[styles.modalButton, styles.saveButton]}
                  >
                    <Text
                      style={[styles.modalButtonText, styles.saveButtonText]}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
  incomeSection: {
    backgroundColor: "#e0f2e0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  incomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#c1e0c1",
    paddingBottom: 8,
  },
  incomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004d00",
  },
  incomeDetails: {},
  incomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  incomeLabel: {
    fontSize: 15,
    color: "#005d00",
  },
  incomeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#006400",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 0, // Adjusted margin
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingLeft: 15,
    paddingRight: 5,
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
    flex: 1,
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
  accountIncomeInfo: {
    fontSize: 12,
    color: "#007700",
    marginTop: 3,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    // Style for the moved button
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 0, // Adjusted margin
    marginBottom: 20, // Adjusted margin
    marginHorizontal: 0, // Adjusted margin
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#006400",
  },
  modalParent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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
  modalIncomeSection: {
    width: "100%",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  frequencySelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 5,
  },
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
  },
  frequencyButtonSelected: {
    backgroundColor: "#006400",
    borderColor: "#004d00",
  },
  frequencyButtonText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  frequencyButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  frequencyButtonDisabledText: {
    color: "#aaa",
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
  cancelButton: {
    borderColor: "#aaa",
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    minHeight: 150,
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
});

export default Accounts;
