import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal, // Import Modal
  TextInput, // Import TextInput
  Alert, // Import Alert for feedback (optional)
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import AddCategoryModal from "../components/AddCategoryModal";

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// --- Initial Categories (remain the same) ---
const initialIncomeCategories: Category[] = [
  {
    id: "inc1",
    name: "Awards",
    icon: "trophy",
    description: "Prize money or awards received",
  },
  {
    id: "inc2",
    name: "Lottery",
    icon: "ticket",
    description: "Winnings from lottery",
  },
  {
    id: "inc3",
    name: "Refunds",
    icon: "credit-card-refund",
    description: "Money received as a refund",
  },
  {
    id: "inc4",
    name: "Rental",
    icon: "home-city",
    description: "Income from rental properties",
  },
  {
    id: "inc5",
    name: "Salary",
    icon: "cash",
    description: "Regular salary or wages",
  },
  {
    id: "inc6",
    name: "Sale",
    icon: "tag",
    description: "Income from selling items",
  },
];

const initialExpenseCategories: Category[] = [
  {
    id: "exp1",
    name: "Bills",
    icon: "file-document-outline",
    description: "Utility bills, subscriptions, etc.",
  },
  {
    id: "exp2",
    name: "Car",
    icon: "car",
    description: "Fuel, maintenance, insurance",
  },
  {
    id: "exp3",
    name: "Clothing",
    icon: "tshirt-crew",
    description: "Apparel purchases",
  },
  {
    id: "exp4",
    name: "Education",
    icon: "school",
    description: "Tuition, books, courses",
  },
  {
    id: "exp5",
    name: "Foods",
    icon: "food",
    description: "Groceries, dining out",
  },
  {
    id: "exp6",
    name: "Health",
    icon: "heart-pulse",
    description: "Medical expenses, pharmacy",
  },
  {
    id: "exp7",
    name: "House",
    icon: "home",
    description: "Rent, mortgage, repairs",
  },
  {
    id: "exp8",
    name: "Leisure",
    icon: "movie",
    description: "Entertainment, hobbies",
  },
  {
    id: "exp9",
    name: "Pets",
    icon: "paw",
    description: "Pet food, vet visits",
  },
  {
    id: "exp10",
    name: "Shopping",
    icon: "cart",
    description: "General shopping",
  },
  {
    id: "exp11",
    name: "Sports",
    icon: "basketball",
    description: "Gym, sports equipment",
  },
  {
    id: "exp12",
    name: "Travel",
    icon: "train",
    description: "Transportation, accommodation",
  },
];
// --- End Initial Categories ---

export default function TransactionScreen() {
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

  // --- State for the Amount Input Modal ---
  const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
  const [selectedCategoryForAmount, setSelectedCategoryForAmount] =
    useState<Category | null>(null);
  const [amount, setAmount] = useState("");
  // --- End State for Amount Input Modal ---

  const currentCategories =
    transactionType === "Expenses" ? expenseCategories : incomeCategories;

  const handleAddCategory = (newCategoryData: {
    name: string;
    icon: string;
    description?: string;
  }) => {
    const newCategory: Category = {
      id: `${transactionType.toLowerCase()}${Date.now()}`,
      name: newCategoryData.name,
      icon: newCategoryData.icon,
      description: newCategoryData.description,
    };

    if (transactionType === "Expenses") {
      setExpenseCategories((prev) => [...prev, newCategory]);
    } else {
      setIncomeCategories((prev) => [...prev, newCategory]);
    }
    setIsAddCategoryModalVisible(false);
  };

  // --- Handlers for Amount Input Modal ---
  const handleCategoryPress = (category: Category) => {
    setSelectedCategoryForAmount(category);
    setAmount(""); // Reset amount when opening
    setIsAmountModalVisible(true);
  };

  const handleCloseAmountModal = () => {
    setIsAmountModalVisible(false);
    setSelectedCategoryForAmount(null); // Clear selected category
  };

  const handleSaveAmount = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      return;
    }
    // --- TODO: Implement actual transaction saving logic here ---
    // For now, just log the details and close the modal
    console.log(
      `Saving transaction: Type=${transactionType}, Category=${selectedCategoryForAmount?.name}, Amount=${amount}`
    );
    Alert.alert(
      "Transaction Saved (Placeholder)",
      `Type: ${transactionType}\nCategory: ${selectedCategoryForAmount?.name}\nAmount: ${amount}`
    );
    handleCloseAmountModal();
    // Potentially navigate away or clear form
  };
  // --- End Handlers for Amount Input Modal ---

  return (
    <View style={styles.container}>
      {/* --- Stack Screen Options (remain the same) --- */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            // You might want to disable/change this Save button if saving happens in the modal
            <TouchableOpacity style={styles.headerButton}>
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

      {/* --- Type Selector (remains the same) --- */}
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
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {currentCategories.map((category) => (
            // --- Updated TouchableOpacity to open amount modal ---
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category)} // Call handler on press
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
            // --- End Updated TouchableOpacity ---
          ))}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setIsAddCategoryModalVisible(true)}
          >
            <Text style={styles.addNewButtonText}>+ Add New Category</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Add Category Modal (remains the same) --- */}
      <AddCategoryModal
        visible={isAddCategoryModalVisible}
        onClose={() => setIsAddCategoryModalVisible(false)}
        onSave={handleAddCategory}
      />

      {/* --- Amount Input Modal --- */}
      <Modal
        visible={isAmountModalVisible}
        transparent
        animationType="none" // Or "slide"
        onRequestClose={handleCloseAmountModal}
      >
        <View style={styles.amountModalContainer}>
          <View style={styles.amountModalContent}>
            <Text style={styles.amountModalTitle}>
              Enter {transactionType === "Income" ? "Income" : "Expense"} Amount
            </Text>

            {/* Display Selected Category Info */}
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
                <View>
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
              autoFocus={true} // Automatically focus the input
            />

            {/* Buttons */}
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
      {/* --- End Amount Input Modal --- */}
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  typeSelector: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTypeButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#006400",
  },
  typeButtonText: {
    fontSize: 16,
    color: "#666",
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
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 30,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
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
  // --- Amount Modal Styles ---
  amountModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay
  },
  amountModalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25, // More padding
    width: "90%",
    maxWidth: 400,
    alignItems: "center", // Center content horizontally
  },
  amountModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006400", // Use theme color
    marginBottom: 20,
    textAlign: "center",
  },
  categoryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f0f0f0", // Light background for the info section
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  categoryIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  categoryInfoName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryInfoDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  amountLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    alignSelf: "flex-start", // Align label to the left
    width: "100%",
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ccc", // Lighter border
    borderRadius: 8,
    padding: 12,
    marginBottom: 25, // More space before buttons
    fontSize: 18, // Larger font for amount
    width: "100%",
    textAlign: "right", // Align amount to the right
    backgroundColor: "#f9f9f9",
  },
  amountModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1, // Make buttons take equal space
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5, // Add space between buttons
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#eee", // Lighter cancel button
    borderWidth: 1,
    borderColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#DAA520", // Use theme color
  },
  cancelButtonText: {
    color: "#555", // Darker text for cancel
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
