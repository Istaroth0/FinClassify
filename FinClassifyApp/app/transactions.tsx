// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\transactions.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Stack, useNavigation } from "expo-router";
// Re-import AddIncomeCategoryModal
import AddIncomeCategoryModal from "../components/AddIncomeModal";
import AddExpenseCategoryModal from "../components/AddExpenseModal";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { app } from "../app/firebase";

// Initialize Firestore
const db = getFirestore(app);

// Hardcoded User ID
const HARDCODED_USER_ID = "User";

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  isDefault?: boolean;
}

interface Account {
  id: string;
  title: string;
  iconName: string;
}

// --- Account Icon Data ---
interface AccountImageOption {
  id: string;
  source: ImageSourcePropType;
  name: string;
}
const CardsSource = require("../assets/CAImages/Cards.png");
const MoneySource = require("../assets/CAImages/Money.png");
const PiggybankSource = require("../assets/CAImages/Piggybank.png");
const StoreSource = require("../assets/CAImages/Store.png");
const WalletSource = require("../assets/CAImages/Wallet.png");

const accountIconOptions: AccountImageOption[] = [
  { id: "1", source: CardsSource, name: "Cards" },
  { id: "2", source: MoneySource, name: "Money" },
  { id: "3", source: PiggybankSource, name: "Piggybank" },
  { id: "4", source: StoreSource, name: "Store" },
  { id: "5", source: WalletSource, name: "Wallet" },
];

// --- Initial Categories ---
// Re-add initialIncomeCategories
const initialIncomeCategories: Category[] = [
  {
    id: "inc1",
    name: "Awards",
    icon: "trophy",
    description: "Prize money or awards received",
    isDefault: true,
  },
  {
    id: "inc2",
    name: "Lottery",
    icon: "ticket",
    description: "Winnings from lottery",
    isDefault: true,
  },
  {
    id: "inc3",
    name: "Refunds",
    icon: "credit-card-refund",
    description: "Money received as a refund",
    isDefault: true,
  },
  {
    id: "inc4",
    name: "Rental",
    icon: "home-city",
    description: "Income from rental properties",
    isDefault: true,
  },
  {
    id: "inc5",
    name: "Salary",
    icon: "cash",
    description: "Regular salary or wages",
    isDefault: true,
  },
  {
    id: "inc6",
    name: "Sale",
    icon: "tag",
    description: "Income from selling items",
    isDefault: true,
  },
];

const initialExpenseCategories: Category[] = [
  {
    id: "exp1",
    name: "Bills",
    icon: "file-document-outline",
    description: "Utility bills, subscriptions, etc.",
    isDefault: true,
  },
  {
    id: "exp2",
    name: "Car",
    icon: "car",
    description: "Fuel, maintenance, insurance",
    isDefault: true,
  },
  {
    id: "exp3",
    name: "Clothing",
    icon: "tshirt-crew",
    description: "Apparel purchases",
    isDefault: true,
  },
  {
    id: "exp4",
    name: "Education",
    icon: "school",
    description: "Tuition, books, courses",
    isDefault: true,
  },
  {
    id: "exp5",
    name: "Foods",
    icon: "food",
    description: "Groceries, dining out",
    isDefault: true,
  },
  {
    id: "exp6",
    name: "Health",
    icon: "heart-pulse",
    description: "Medical expenses, pharmacy",
    isDefault: true,
  },
  {
    id: "exp7",
    name: "House",
    icon: "home",
    description: "Rent, mortgage, repairs",
    isDefault: true,
  },
  {
    id: "exp8",
    name: "Leisure",
    icon: "movie",
    description: "Entertainment, hobbies",
    isDefault: true,
  },
  {
    id: "exp9",
    name: "Pets",
    icon: "paw",
    description: "Pet food, vet visits",
    isDefault: true,
  },
  {
    id: "exp10",
    name: "Shopping",
    icon: "cart",
    description: "General shopping",
    isDefault: true,
  },
  {
    id: "exp11",
    name: "Sports",
    icon: "basketball",
    description: "Gym, sports equipment",
    isDefault: true,
  },
  {
    id: "exp12",
    name: "Travel",
    icon: "train",
    description: "Transportation, accommodation",
    isDefault: true,
  },
];

// --- Helper function to get ImageSourcePropType from icon name ---
const getIconSourceFromName = (
  iconName: string | undefined
): ImageSourcePropType => {
  const foundOption = accountIconOptions.find(
    (option) => option.name === iconName
  );
  return foundOption ? foundOption.source : WalletSource; // Default to Wallet
};

export default function TransactionScreen() {
  const navigation = useNavigation();
  // Re-introduce transactionType state, default to Expenses
  const [transactionType, setTransactionType] = useState<"Expenses" | "Income">(
    "Expenses"
  );
  // Re-introduce incomeCategories state
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(
    initialIncomeCategories
  );
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(
    initialExpenseCategories
  );
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);
  const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
  const [selectedCategoryForAmount, setSelectedCategoryForAmount] =
    useState<Category | null>(null);
  const [amount, setAmount] = useState("");

  // --- State for Accounts ---
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [errorAccounts, setErrorAccounts] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  // --- Fetch Categories from Firestore ---
  useEffect(() => {
    const userId = HARDCODED_USER_ID;

    // Fetch Income Categories
    const incomeCollectionRef = collection(db, "Accounts", userId, "Income");
    const incomeQuery = query(incomeCollectionRef, orderBy("name"));
    const unsubscribeIncome = onSnapshot(
      incomeQuery,
      (querySnapshot) => {
        const fetchedIncomeCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.name === "string") {
            fetchedIncomeCategories.push({
              id: doc.id,
              name: data.name,
              icon: data.icon || "help-circle-outline",
              description: data.description,
              isDefault: false,
            });
          }
        });
        const initialNames = new Set(
          fetchedIncomeCategories.map((cat) => cat.name)
        );
        const combinedIncome = [
          ...initialIncomeCategories.filter(
            (cat) => cat.name && !initialNames.has(cat.name)
          ),
          ...fetchedIncomeCategories,
        ];
        setIncomeCategories(combinedIncome);
      },
      (error) => {
        console.error("Error fetching income categories: ", error);
        setIncomeCategories(initialIncomeCategories); // Fallback
      }
    );

    // Fetch Expense Categories
    const expenseCollectionRef = collection(db, "Accounts", userId, "Expenses");
    const expenseQuery = query(expenseCollectionRef, orderBy("name"));
    const unsubscribeExpenses = onSnapshot(
      expenseQuery,
      (querySnapshot) => {
        const fetchedExpenseCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.name === "string") {
            fetchedExpenseCategories.push({
              id: doc.id,
              name: data.name,
              icon: data.icon || "help-circle-outline",
              description: data.description,
              isDefault: false,
            });
          }
        });
        const initialExpenseNames = new Set(
          fetchedExpenseCategories.map((cat) => cat.name)
        );
        const combinedExpenses = [
          ...initialExpenseCategories.filter(
            (cat) => cat.name && !initialExpenseNames.has(cat.name)
          ),
          ...fetchedExpenseCategories,
        ];
        setExpenseCategories(combinedExpenses);
      },
      (error) => {
        console.error("Error fetching expense categories: ", error);
        setExpenseCategories(initialExpenseCategories); // Fallback
      }
    );

    // Cleanup Firestore listeners
    return () => {
      unsubscribeIncome(); // Unsubscribe income listener
      unsubscribeExpenses();
    };
  }, []);

  // --- Fetch Accounts ---
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

    const unsubscribeAccounts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAccounts: Account[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data &&
            typeof data.title === "string" &&
            typeof data.iconName === "string"
          ) {
            fetchedAccounts.push({
              id: doc.id,
              title: data.title,
              iconName: data.iconName,
            });
          } else {
            console.warn(`Invalid account data found for doc ID: ${doc.id}`);
          }
        });
        setAccountsList(fetchedAccounts);
        if (!selectedAccountId && fetchedAccounts.length > 0) {
          setSelectedAccountId(fetchedAccounts[0].id);
        }
        setIsLoadingAccounts(false);
      },
      (err) => {
        console.error("Error fetching accounts: ", err);
        setErrorAccounts("Failed to load accounts.");
        setIsLoadingAccounts(false);
      }
    );

    return () => unsubscribeAccounts();
  }, []);

  // --- handleAddCategory ---
  const handleAddCategory = (newCategoryData: {
    name: string;
    icon: string;
    description?: string | null;
  }) => {
    setIsAddCategoryModalVisible(false);
  };

  // Update currentCategories based on transactionType
  const currentCategories =
    transactionType === "Expenses" ? expenseCategories : incomeCategories;

  // --- Handlers for Amount Input Modal ---
  const handleCategoryPress = (category: Category) => {
    setSelectedCategoryForAmount(category);
    setAmount("");
    setIsAmountModalVisible(true);
  };

  const handleCloseAmountModal = () => {
    setIsAmountModalVisible(false);
    setSelectedCategoryForAmount(null);
    setAmount("");
  };

  // --- handleSaveAmount (Updated for Income/Expense Balance Update) ---
  const handleSaveAmount = async () => {
    const userId = HARDCODED_USER_ID;
    const transactionAmount = parseFloat(amount); // Use a clear variable name

    // --- Input Validations ---
    if (!amount || isNaN(transactionAmount) || transactionAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      return;
    }
    if (!selectedCategoryForAmount) {
      Alert.alert("Error", "No category selected.");
      return;
    }
    if (!selectedAccountId) {
      Alert.alert("Account Required", "Please select an account.");
      return;
    }

    // --- Prepare Data ---
    const selectedAccountInfo = accountsList.find(
      (acc) => acc.id === selectedAccountId
    );
    const accountName = selectedAccountInfo
      ? selectedAccountInfo.title
      : "Unknown Account";

    const newTransactionData = {
      type: transactionType, // Use the state variable
      categoryName: selectedCategoryForAmount.name,
      categoryIcon: selectedCategoryForAmount.icon,
      amount: transactionAmount,
      accountId: selectedAccountId,
      accountName: accountName,
      timestamp: serverTimestamp(),
    };

    // --- Firestore Transaction ---
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Define references
        const accountDocRef = doc(
          db,
          "Accounts",
          userId,
          "accounts",
          selectedAccountId
        );
        const newTransactionRef = doc(
          collection(db, "Accounts", userId, "transactions")
        );

        // 2. Read the current account balance
        const accountDoc = await transaction.get(accountDocRef);
        if (!accountDoc.exists()) {
          throw new Error("Account document does not exist!");
        }

        const currentBalance = accountDoc.data()?.balance ?? 0;

        // 3. Calculate the new balance based on transaction type
        let newBalance;
        if (transactionType === "Income") {
          newBalance = currentBalance + transactionAmount; // Add income
        } else {
          // transactionType === "Expenses"
          newBalance = currentBalance - transactionAmount; // Subtract expense
        }

        // 4. Perform writes
        transaction.update(accountDocRef, { balance: newBalance });
        transaction.set(newTransactionRef, newTransactionData);
      });

      // --- Success ---
      console.log("Transaction successfully committed!");
      Alert.alert(
        `Transaction Saved (${transactionType})`, // Dynamic title
        `Category: ${
          selectedCategoryForAmount.name
        }\nAmount: ₱${transactionAmount.toFixed(2)}\nAccount: ${accountName}`
      );
      handleCloseAmountModal();
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error: any) {
      // --- Error Handling ---
      console.error("Transaction failed: ", error);
      Alert.alert(
        "Save Error",
        `Could not save the transaction and update balance. ${
          error.message || "Please try again."
        }`
      );
    }
  };

  // --- Header Button Handlers ---
  const handleCancel = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSaveHeader = () => {
    Alert.alert(
      "Save Action",
      "Select a category and enter details in the modal to save."
    );
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      {/* --- Stack Screen Options --- */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSaveHeader}
            >
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          ),
          title: "Add Transaction", // Keep generic title
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#006400",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      {/* --- Type Selector Re-added --- */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === "Expenses" && styles.activeTypeButton,
          ]}
          onPress={() => setTransactionType("Expenses")}
        >
          <Text
            style={[
              styles.typeButtonText,
              transactionType === "Expenses" && styles.activeTypeButtonText,
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === "Income" && styles.activeTypeButton,
          ]}
          onPress={() => setTransactionType("Income")}
        >
          <Text
            style={[
              styles.typeButtonText,
              transactionType === "Income" && styles.activeTypeButtonText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ScrollView Content --- */}
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {currentCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons
                  name={
                    category.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color="white"
                />
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setIsAddCategoryModalVisible(true)}
          >
            <Text style={styles.addNewButtonText}>+ Add New Category</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Conditionally Render Add Category Modals --- */}
      {transactionType === "Income" ? (
        <AddIncomeCategoryModal
          visible={isAddCategoryModalVisible}
          onClose={() => setIsAddCategoryModalVisible(false)}
          onSave={handleAddCategory}
          userId={HARDCODED_USER_ID}
        />
      ) : (
        <AddExpenseCategoryModal
          visible={isAddCategoryModalVisible}
          onClose={() => setIsAddCategoryModalVisible(false)}
          onSave={handleAddCategory}
          userId={HARDCODED_USER_ID}
        />
      )}

      {/* --- Amount Input Modal --- */}
      <Modal
        visible={isAmountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAmountModal}
      >
        <View style={styles.amountModalContainer}>
          <ScrollView contentContainerStyle={styles.amountModalScrollContent}>
            <View style={styles.amountModalContent}>
              {/* Dynamic Title */}
              <Text style={styles.amountModalTitle}>
                Enter {transactionType === "Income" ? "Income" : "Expense"}{" "}
                Details
              </Text>

              {/* Category Info */}
              {selectedCategoryForAmount && (
                <View style={styles.categoryInfoContainer}>
                  <View style={styles.categoryIconSmall}>
                    <MaterialCommunityIcons
                      name={
                        selectedCategoryForAmount.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={20}
                      color="white"
                    />
                  </View>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryInfoName}>
                      {selectedCategoryForAmount.name}
                    </Text>
                    {selectedCategoryForAmount.description && (
                      <Text style={styles.categoryInfoDesc}>
                        {selectedCategoryForAmount.description}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Amount Input */}
              <Text style={styles.amountLabel}>Amount:</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#999"
                autoFocus={true}
              />

              {/* --- Account Selection --- */}
              <Text style={styles.amountLabel}>Account:</Text>
              {isLoadingAccounts ? (
                <ActivityIndicator
                  color="#006400"
                  style={styles.accountLoader}
                />
              ) : errorAccounts ? (
                <Text style={styles.errorTextSmall}>{errorAccounts}</Text>
              ) : accountsList.length === 0 ? (
                <Text style={styles.infoTextSmall}>
                  No accounts found. Please add an account first.
                </Text>
              ) : (
                <View style={styles.accountSelectorContainer}>
                  <ScrollView nestedScrollEnabled={true}>
                    {accountsList.map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        style={[
                          styles.accountSelectItem,
                          selectedAccountId === account.id &&
                            styles.accountSelectItemActive,
                        ]}
                        onPress={() => setSelectedAccountId(account.id)}
                      >
                        <Image
                          source={getIconSourceFromName(account.iconName)}
                          style={styles.accountSelectIconImage}
                          resizeMode="contain"
                        />
                        <Text
                          style={[
                            styles.accountSelectText,
                            selectedAccountId === account.id &&
                              styles.accountSelectTextActive,
                          ]}
                        >
                          {account.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {/* --- End Account Selection --- */}

              {/* Modal Buttons */}
              <View style={styles.amountModalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseAmountModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveAmount}
                  disabled={isLoadingAccounts || accountsList.length === 0}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  // Re-add Type Selector styles
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTypeButton: {
    borderBottomColor: "#006400",
  },
  typeButtonText: {
    fontSize: 16,
    color: "#6c757d",
  },
  activeTypeButtonText: {
    color: "#006400",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
    // Remove paddingTop added previously
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DAA520",
    marginBottom: 15,
    paddingLeft: 5,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -5,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
    color: "#495057",
    fontWeight: "500",
    marginTop: 2,
  },
  addNewButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#DAA520",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addNewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  amountModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  amountModalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  amountModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  amountModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006400",
    marginBottom: 20,
    textAlign: "center",
  },
  categoryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryInfoName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  categoryInfoDesc: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
    alignSelf: "flex-start",
    width: "100%",
    fontWeight: "500",
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 20,
    width: "100%",
    textAlign: "right",
    backgroundColor: "#fff",
    color: "#212529",
  },
  accountSelectorContainer: {
    width: "100%",
    marginBottom: 25,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  accountSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  accountSelectItemActive: {
    backgroundColor: "#006400",
  },
  accountSelectIconImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  accountSelectText: {
    fontSize: 16,
    color: "#333",
  },
  accountSelectTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  accountLoader: {
    marginVertical: 20,
  },
  errorTextSmall: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
  },
  infoTextSmall: {
    color: "#6c757d",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
  },
  amountModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  saveButton: {
    backgroundColor: "#DAA520",
    borderWidth: 1,
    borderColor: "#DAA520",
  },
  cancelButtonText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
