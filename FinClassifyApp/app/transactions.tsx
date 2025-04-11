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
  // ActivityIndicator removed as we are hardcoding the user
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useNavigation } from "expo-router";
import AddIncomeCategoryModal from "../components/AddIncomeModal";
import AddExpenseCategoryModal from "../components/AddExpenseModal";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
} from "firebase/firestore";
// Auth imports removed
import { app } from "../app/firebase";

// Initialize Firestore
const db = getFirestore(app);
// Auth initialization removed

// Hardcoded User ID
const HARDCODED_USER_ID = "User";

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  isDefault?: boolean;
}

// --- Initial Categories (remain the same) ---
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
// --- End Initial Categories ---

export default function TransactionScreen() {
  const navigation = useNavigation();
  // Removed currentUser and isLoadingAuth states
  const [transactionType, setTransactionType] = useState<"Expenses" | "Income">(
    "Income"
  );
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

  // --- Fetch Categories from Firestore (using hardcoded userId) ---
  useEffect(() => {
    const userId = HARDCODED_USER_ID; // Use hardcoded ID

    // --- Fetch Income Categories ---
    const incomeCollectionRef = collection(db, "Accounts", userId, "Income");
    const incomeQuery = query(incomeCollectionRef);
    const unsubscribeIncome = onSnapshot(
      incomeQuery,
      (querySnapshot) => {
        const fetchedIncomeCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure fetched data has a name before adding
          if (data && typeof data.name === "string") {
            fetchedIncomeCategories.push({
              id: doc.id,
              name: data.name,
              icon: data.icon || "help-circle-outline", // Default icon
              description: data.description,
              isDefault: false,
            });
          } else {
            console.warn(
              `Fetched income category document ${doc.id} is missing a name.`
            );
          }
        });
        const initialNames = new Set(
          fetchedIncomeCategories.map((cat) => cat.name)
        );
        const combinedIncome = [
          ...initialIncomeCategories.filter(
            (cat) => cat.name && !initialNames.has(cat.name) // Ensure initial has name
          ),
          ...fetchedIncomeCategories,
        ];
        // --- Safely sort combined list ---
        combinedIncome.sort((a, b) => {
          const nameA = a.name || ""; // Default to empty string if name is missing
          const nameB = b.name || ""; // Default to empty string if name is missing
          return nameA.localeCompare(nameB);
        });
        setIncomeCategories(combinedIncome);
      },
      (error) => {
        console.error("Error fetching income categories: ", error);
        if (error.code === "permission-denied") {
          Alert.alert(
            "Permission Error",
            "You don't have permission to read income categories."
          );
        }
        setIncomeCategories(initialIncomeCategories); // Fallback
      }
    );

    // --- Fetch Expense Categories ---
    const expenseCollectionRef = collection(db, "Accounts", userId, "Expenses");
    const expenseQuery = query(expenseCollectionRef);
    const unsubscribeExpenses = onSnapshot(
      expenseQuery,
      (querySnapshot) => {
        const fetchedExpenseCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure fetched data has a name before adding
          if (data && typeof data.name === "string") {
            fetchedExpenseCategories.push({
              id: doc.id,
              name: data.name,
              icon: data.icon || "help-circle-outline", // Default icon
              description: data.description,
              isDefault: false,
            });
          } else {
            console.warn(
              `Fetched expense category document ${doc.id} is missing a name.`
            );
          }
        });
        const initialExpenseNames = new Set(
          fetchedExpenseCategories.map((cat) => cat.name)
        );
        const combinedExpenses = [
          ...initialExpenseCategories.filter(
            (cat) => cat.name && !initialExpenseNames.has(cat.name) // Ensure initial has name
          ),
          ...fetchedExpenseCategories,
        ];
        // --- Safely sort combined list ---
        combinedExpenses.sort((a, b) => {
          const nameA = a.name || ""; // Default to empty string
          const nameB = b.name || ""; // Default to empty string
          return nameA.localeCompare(nameB);
        });
        setExpenseCategories(combinedExpenses);
      },
      (error) => {
        console.error("Error fetching expense categories: ", error);
        if (error.code === "permission-denied") {
          Alert.alert(
            "Permission Error",
            "You don't have permission to read expense categories."
          );
        }
        setExpenseCategories(initialExpenseCategories); // Fallback
      }
    );

    // Cleanup Firestore listeners
    return () => {
      unsubscribeIncome();
      unsubscribeExpenses();
    };
  }, []); // Empty dependency array, runs once

  // --- handleAddCategory (remains the same logic) ---
  const handleAddCategory = (newCategoryData: {
    name: string;
    icon: string;
    description?: string | null;
  }) => {
    console.log("Category saved to Firestore by modal, closing modal.");
    setIsAddCategoryModalVisible(false);
  };

  const currentCategories =
    transactionType === "Expenses" ? expenseCategories : incomeCategories;

  // --- Handlers for Amount Input Modal ---
  const handleCategoryPress = (category: Category) => {
    // Removed currentUser check
    setSelectedCategoryForAmount(category);
    setAmount("");
    setIsAmountModalVisible(true);
  };

  const handleCloseAmountModal = () => {
    setIsAmountModalVisible(false);
    setSelectedCategoryForAmount(null);
    setAmount("");
  };

  // --- Updated handleSaveAmount to use hardcoded userId ---
  const handleSaveAmount = async () => {
    const userId = HARDCODED_USER_ID; // Use hardcoded ID

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      return;
    }
    if (!selectedCategoryForAmount) {
      Alert.alert("Error", "No category selected.");
      return;
    }

    const transactionData = {
      type: transactionType,
      categoryName: selectedCategoryForAmount.name,
      categoryIcon: selectedCategoryForAmount.icon,
      amount: parsedAmount,
      timestamp: serverTimestamp(),
    };

    try {
      const transactionsCollectionRef = collection(
        db,
        "Accounts",
        userId,
        "transactions"
      );
      const docRef = await addDoc(transactionsCollectionRef, transactionData);
      console.log("Transaction saved with ID: ", docRef.id);

      Alert.alert(
        "Transaction Saved",
        `Type: ${transactionType}\nCategory: ${
          selectedCategoryForAmount.name
        }\nAmount: ₱${parsedAmount.toFixed(2)}`
      );
      handleCloseAmountModal();
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Error saving transaction to Firestore: ", error);
      if (error.code === "permission-denied") {
        Alert.alert(
          "Permission Error",
          "You don't have permission to save transactions."
        );
      } else {
        Alert.alert(
          "Save Error",
          "Could not save the transaction. Please try again."
        );
      }
    }
  };

  // --- Header Button Handlers (remain the same) ---
  const handleCancel = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log("Cancel pressed - cannot go back");
    }
  };

  const handleSaveHeader = () => {
    console.log("Header Save pressed - this button might be removed");
  };
  // --- End Other handlers ---

  // Removed Loading State check

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
              // Removed disabled prop
            >
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          ),
          title: "Add Transaction",
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

      {/* --- Type Selector --- */}
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
          {/* Map over the combined categories from state */}
          {currentCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category)}
              // Removed disabled prop
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
          {/* Add New Category Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              // Removed currentUser check
              setIsAddCategoryModalVisible(true);
            }}
            // Removed disabled prop
          >
            <Text style={styles.addNewButtonText}>+ Add New Category</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Conditionally Render Add Category Modals --- */}
      {/* Pass hardcoded userId to the modals */}
      {transactionType === "Income" ? (
        <AddIncomeCategoryModal
          visible={isAddCategoryModalVisible}
          onClose={() => setIsAddCategoryModalVisible(false)}
          onSave={handleAddCategory}
          userId={HARDCODED_USER_ID} // Pass hardcoded userId
        />
      ) : (
        <AddExpenseCategoryModal
          visible={isAddCategoryModalVisible}
          onClose={() => setIsAddCategoryModalVisible(false)}
          onSave={handleAddCategory}
          userId={HARDCODED_USER_ID} // Pass hardcoded userId
        />
      )}

      {/* --- Amount Input Modal (remain the same structure) --- */}
      <Modal
        visible={isAmountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAmountModal}
      >
        <View style={styles.amountModalContainer}>
          <View style={styles.amountModalContent}>
            <Text style={styles.amountModalTitle}>
              Enter {transactionType === "Income" ? "Income" : "Expense"} Amount
            </Text>

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
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  // Removed loadingContainer and disabled styles
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
    marginBottom: 25,
    textAlign: "center",
  },
  categoryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
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
    marginBottom: 10,
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
    marginBottom: 30,
    fontSize: 20,
    width: "100%",
    textAlign: "right",
    backgroundColor: "#fff",
    color: "#212529",
  },
  amountModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
