// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\CreateAccounts.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageSourcePropType,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  getFirestore,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../app/firebase"; // Adjust path if needed

// --- Firestore Initialization ---
const db = getFirestore(app);
// FIXME: Replace this with actual user authentication logic
const userId = "User"; // Replace with actual user ID from auth

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

// --- Data ---
const accountIconOptions: AccountImageOption[] = [
  { id: "1", source: CardsSource, name: "Cards" },
  { id: "2", source: MoneySource, name: "Money" },
  { id: "3", source: PiggybankSource, name: "Piggybank" },
  { id: "4", source: StoreSource, name: "Store" },
  { id: "5", source: WalletSource, name: "Wallet" },
];

const incomeFrequencies: IncomeFrequency[] = ["Daily", "Weekly", "Monthly"];

// --- Component ---
function CreateAccountsScreen() {
  const router = useRouter();

  // State for the form
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountAmount, setNewAccountAmount] = useState("");
  const [selectedIconOption, setSelectedIconOption] =
    useState<AccountImageOption | null>(null);
  const [newAccountIncomeAmount, setNewAccountIncomeAmount] = useState("");
  const [selectedIncomeFrequency, setSelectedIncomeFrequency] =
    useState<IncomeFrequency>(null);
  const [isSaving, setIsSaving] = useState(false); // Loading state

  // --- Navigation Handlers ---
  const handleCancel = () => {
    if (isSaving) return;
    // Navigate explicitly to Accounts screen, replacing the current screen
    router.replace("/Accounts");
  };

  // --- Form Validation Check (Corrected) ---
  const isFormValid =
    !!newAccountName.trim() && // Convert to boolean
    !!newAccountAmount.trim() && // Convert to boolean
    !!selectedIconOption; // Convert to boolean

  // --- Save Account Logic ---
  const handleSaveAccount = async () => {
    // No changes needed within handleSaveAccount itself for this specific issue
    if (!isFormValid || isSaving) return;

    // --- Input Validations ---
    const trimmedName = newAccountName.trim();
    const newBalance = parseFloat(newAccountAmount);
    if (isNaN(newBalance)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid number for the balance (e.g., 1500.50)."
      );
      return;
    }

    let incomeAmount: number | null = null;
    const trimmedIncome = newAccountIncomeAmount.trim();
    if (trimmedIncome) {
      incomeAmount = parseFloat(trimmedIncome);
      if (isNaN(incomeAmount) || incomeAmount < 0) {
        Alert.alert(
          "Validation Error",
          "Income amount must be a valid positive number (e.g., 1000) or left blank."
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
    } else if (selectedIncomeFrequency) {
      // Clear frequency if income amount is removed
      setSelectedIncomeFrequency(null);
    }
    // --- End Validations ---

    if (!userId) {
      Alert.alert("Error", "User not identified. Please log in again.");
      return;
    }

    setIsSaving(true);

    const accountData = {
      title: trimmedName,
      balance: newBalance,
      iconName: selectedIconOption!.name, // Non-null assertion is safe here due to isFormValid check
      incomeAmount: incomeAmount,
      incomeFrequency: incomeAmount ? selectedIncomeFrequency : null,
      // Consider adding createdAt timestamp if needed for sorting/auditing
      // createdAt: serverTimestamp(),
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

        // 1. Create the new account document reference *first* to get its ID
        const accountDocRef = doc(accountsCollectionRef);

        // 2. Set the account data
        transaction.set(accountDocRef, accountData);

        // 3. If there's an initial balance, create an initial transaction
        if (newBalance !== 0) {
          const balanceChange = newBalance;
          const transactionType = balanceChange > 0 ? "Income" : "Expenses";
          const transactionCategory = "Initial Balance";
          const transactionIcon =
            balanceChange > 0 ? "bank-plus" : "bank-minus"; // Or a more generic icon like 'cash-plus'/'cash-minus'

          const newTransactionRef = doc(transactionsCollectionRef);
          const transactionData = {
            type: transactionType,
            categoryName: transactionCategory,
            categoryIcon: transactionIcon,
            amount: Math.abs(balanceChange),
            accountId: accountDocRef.id, // Use the generated ID
            accountName: accountData.title, // Use the account title
            timestamp: serverTimestamp(),
          };
          transaction.set(newTransactionRef, transactionData);
        }
      });

      Alert.alert(
        "Success",
        `Account "${accountData.title}" added successfully.`
      );
      // Navigate explicitly to Accounts screen, replacing the current screen
      router.replace("/Accounts");
    } catch (error: any) {
      console.error("Account save transaction failed: ", error);
      Alert.alert(
        "Save Error",
        `Could not save the account. ${error.message || "Please try again."}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      {/* --- Stack Screen Options (Header Only) --- */}
      <Stack.Screen
        options={{
          title: "Create New Account",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#006400", // Match theme
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // Default back button is usually sufficient
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Balance Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Initial Balance (₱)</Text>
              <TextInput
                placeholder="0.00"
                style={styles.input}
                keyboardType="numeric"
                value={newAccountAmount}
                onChangeText={setNewAccountAmount}
                placeholderTextColor="#999"
                autoFocus={true} // Focus on the first field
                editable={!isSaving}
              />
            </View>

            {/* Account Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                placeholder="e.g., BDO Savings, GCash Wallet"
                style={styles.input}
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholderTextColor="#999"
                maxLength={50}
                editable={!isSaving}
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
                      isSaving && styles.disabledOverlay, // Apply disabled style if saving
                    ]}
                    onPress={() =>
                      !isSaving && setSelectedIconOption(iconOption)
                    }
                    activeOpacity={0.6}
                    disabled={isSaving} // Disable interaction if saving
                  >
                    <Image
                      source={iconOption.source}
                      style={styles.iconImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Validation hint for icon selection - Comparison is now valid */}
              {!selectedIconOption &&
                isFormValid === false && ( // Show hint only if trying to save without icon
                  <Text style={styles.validationHint}>
                    Please select an icon.
                  </Text>
                )}
            </View>

            {/* --- Associated Income Section --- */}
            <View style={styles.incomeSection}>
              <Text style={styles.sectionTitle}>
                Associated Income (Optional)
              </Text>
              {/* Income Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Income Amount (₱)</Text>
                <TextInput
                  placeholder="e.g., 1000 (Leave blank if none)"
                  style={styles.input}
                  keyboardType="numeric"
                  value={newAccountIncomeAmount}
                  onChangeText={setNewAccountIncomeAmount}
                  placeholderTextColor="#999"
                  editable={!isSaving}
                />
              </View>
              {/* Income Frequency */}
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
                        // Disable if no income amount entered or if saving
                        (!newAccountIncomeAmount.trim() || isSaving) &&
                          styles.frequencyButtonDisabled,
                      ]}
                      onPress={() =>
                        !isSaving && setSelectedIncomeFrequency(freq)
                      }
                      // Disable interaction if no income amount or saving
                      disabled={!newAccountIncomeAmount.trim() || isSaving}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          selectedIncomeFrequency === freq &&
                            styles.frequencyButtonTextSelected,
                          // Style text differently if disabled
                          (!newAccountIncomeAmount.trim() || isSaving) &&
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

            {/* --- Action Buttons (Moved to Bottom) --- */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[
                  styles.actionButton,
                  styles.cancelButton,
                  isSaving && styles.actionButtonDisabled, // Disable visually if saving
                ]}
                disabled={isSaving} // Disable interaction if saving
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAccount}
                style={[
                  styles.actionButton,
                  styles.saveButton,
                  // Disable visually if form is invalid OR saving is in progress
                  (!isFormValid || isSaving) && styles.actionButtonDisabled,
                ]}
                // Disable interaction if form is invalid OR saving is in progress
                disabled={!isFormValid || isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Account</Text>
                )}
              </TouchableOpacity>
            </View>
            {/* --- End Action Buttons --- */}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
// Styles remain unchanged
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8", // Light grey background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40, // Ensure space for buttons at the bottom
  },
  formContainer: {
    padding: 25,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555", // Dark grey label
    marginBottom: 8,
  },
  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#bdc3c7", // Medium grey border
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fdfdfd", // Slightly off-white input background
    color: "#333", // Dark text color
  },
  iconScrollView: {
    paddingTop: 5,
    paddingBottom: 10,
  },
  iconTouchable: {
    marginRight: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: "transparent", // Default no border
    borderRadius: 10,
    backgroundColor: "#f0f0f0", // Light background for icons
    alignItems: "center",
    justifyContent: "center",
    // Add transition for smoother selection feedback (optional)
    // transitionProperty: 'borderColor, backgroundColor',
    // transitionDuration: '0.2s',
  },
  iconSelected: {
    borderColor: "#006400", // Dark green border when selected
    backgroundColor: "#e8f5e9", // Light green background when selected
  },
  iconImage: {
    width: 55,
    height: 55,
  },
  disabledOverlay: {
    opacity: 0.6, // Make disabled icons/buttons look faded
    // Optionally change background color for disabled state
    // backgroundColor: '#e0e0e0',
  },
  validationHint: {
    fontSize: 12,
    color: "red",
    marginTop: 5,
    marginLeft: 5,
  },
  incomeSection: {
    width: "100%",
    marginTop: 15,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1", // Light separator line
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7f8c8d", // Muted grey for optional section title
    marginBottom: 20,
    textAlign: "center",
  },
  frequencySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  frequencyButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#bdc3c7", // Match input border
    borderRadius: 25, // Pill shape
    backgroundColor: "#fdfdfd", // Match input background
    alignItems: "center",
  },
  frequencyButtonSelected: {
    backgroundColor: "#006400", // Dark green background when selected
    borderColor: "#004d00", // Slightly darker border for selected
  },
  frequencyButtonDisabled: {
    backgroundColor: "#f0f0f0", // Lighter background when disabled
    borderColor: "#dcdcdc", // Lighter border when disabled
    opacity: 0.7, // Fade disabled button
  },
  frequencyButtonText: {
    fontSize: 13,
    color: "#555", // Match label color
    fontWeight: "500",
    textAlign: "center",
  },
  frequencyButtonTextSelected: {
    color: "#fff", // White text on selected button
    fontWeight: "bold",
  },
  frequencyButtonDisabledText: {
    color: "#aaa", // Greyed out text when disabled
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30, // Space above buttons
    paddingHorizontal: 5, // Slight horizontal padding if needed
  },
  actionButton: {
    flex: 1, // Equal width buttons
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6, // Space between buttons
    borderWidth: 1,
    minHeight: 48, // Ensure consistent height, especially with loader
    justifyContent: "center", // Center content (text or loader)
  },
  cancelButton: {
    borderColor: "#ccc", // Light grey border for cancel
    backgroundColor: "#f8f9fa", // Very light grey background for cancel
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555", // Dark grey text for cancel
  },
  saveButton: {
    backgroundColor: "#DAA520", // Gold color for save
    borderColor: "#DAA520", // Match background color for border
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // White text for save
  },
  actionButtonDisabled: {
    opacity: 0.6, // General disabled style
    backgroundColor: "#e9d8a1", // Lighter gold when save is disabled
    borderColor: "#e9d8a1",
  },
  // Specific disabled style for cancel button if needed (currently uses general)
  // cancelButtonDisabled: {
  //   backgroundColor: '#e9ecef',
  //   borderColor: '#dee2e6',
  //   opacity: 0.7,
  // },
});

export default CreateAccountsScreen;
