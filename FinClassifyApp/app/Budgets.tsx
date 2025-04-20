// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\Budgets.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList, // Keep using FlatList
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";

// Import components and config
import HeaderTopNav from "../components/headertopnav";
import BotNavigationBar from "../components/botnavigationbar";
import { app } from "../app/firebase";

// --- Firestore Initialization ---
const db = getFirestore(app);
const HARDCODED_USER_ID = "User"; // Replace with actual auth user ID in a real app

// --- Hardcoded Predefined Expense Categories (Base List) ---
const PREDEFINED_EXPENSE_CATEGORIES: Array<{
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { name: "Bills", icon: "file-document-outline" },
  { name: "Car", icon: "car" },
  { name: "Clothing", icon: "tshirt-crew" },
  { name: "Education", icon: "school" },
  { name: "Foods", icon: "food" },
  { name: "Health", icon: "heart-pulse" },
  { name: "House", icon: "home" },
  { name: "Leisure", icon: "movie" },
  { name: "Pets", icon: "paw" },
  { name: "Shopping", icon: "cart" },
  { name: "Sports", icon: "basketball" },
  { name: "Travel", icon: "train" },
  // Add other desired default categories here
];

// --- Interfaces ---
interface BudgetDefinition {
  id: string;
  categoryName: string;
  limit: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface UserCategory {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description?: string | null;
}

interface BudgetDisplayData {
  categoryName: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  limit: number;
  budgetId: string | null;
}

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  const prefix = "₱";
  const formattedAmount = Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${prefix}${formattedAmount}`;
};
// --- End Helper Functions ---

const BudgetsScreen = () => {
  const navigation = useNavigation();

  // State for budget limits fetched from 'budgets' collection
  const [budgetDefinitions, setBudgetDefinitions] = useState<
    BudgetDefinition[]
  >([]);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);
  const [errorBudgets, setErrorBudgets] = useState<string | null>(null);

  // State for user-defined categories fetched from 'Expenses' collection
  const [userExpenseCategories, setUserExpenseCategories] = useState<
    UserCategory[]
  >([]);
  const [isLoadingUserCategories, setIsLoadingUserCategories] = useState(true);
  const [errorUserCategories, setErrorUserCategories] = useState<string | null>(
    null
  );

  // State for the Add/Edit Budget Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [budgetLimit, setBudgetLimit] = useState<string>(""); // Input is string

  // --- Navigation Handler for FAB ---
  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never); // Navigate to the transaction screen
  };

  // --- Fetch User-Defined Expense Categories ('Expenses' collection) ---
  useEffect(() => {
    setIsLoadingUserCategories(true);
    setErrorUserCategories(null);
    const userId = HARDCODED_USER_ID;

    const userCategoriesColRef = collection(db, "Accounts", userId, "Expenses");
    const qUser = query(userCategoriesColRef, orderBy("name"));

    const unsubscribeUserCats = onSnapshot(
      qUser,
      (snapshot) => {
        const fetchedUserCats: UserCategory[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              name: doc.data().name,
              icon: doc.data().icon || "help-circle-outline", // Ensure icon exists
              description: doc.data().description,
            } as UserCategory)
        );
        setUserExpenseCategories(fetchedUserCats);
        setIsLoadingUserCategories(false);
      },
      (err) => {
        console.error("Error fetching user expense categories:", err);
        setErrorUserCategories(
          `Failed to load custom categories. ${
            err.code === "permission-denied" ? "Check Firestore rules." : ""
          }`
        );
        setIsLoadingUserCategories(false);
      }
    );

    return () => unsubscribeUserCats();
  }, []);

  // --- Fetch Budget Definitions (Limits from 'budgets' collection) ---
  useEffect(() => {
    if (isLoadingUserCategories) {
      setIsLoadingBudgets(true);
      return;
    }

    setIsLoadingBudgets(true);
    setErrorBudgets(null);
    const userId = HARDCODED_USER_ID;

    const predefinedNames = PREDEFINED_EXPENSE_CATEGORIES.map((c) => c.name);
    const userNames = userExpenseCategories.map((c) => c.name);
    const allCategoryNames = [...new Set([...predefinedNames, ...userNames])];

    const budgetsColRef = collection(db, "Accounts", userId, "budgets");

    const categoryFilter =
      allCategoryNames.length > 0
        ? allCategoryNames.slice(0, 30)
        : ["__EMPTY_PLACEHOLDER__"];

    if (allCategoryNames.length > 30) {
      console.warn(
        "Warning: More than 30 expense categories detected. Budget fetching might be incomplete due to Firestore 'in' query limits."
      );
    }

    const qBudget = query(
      budgetsColRef,
      where("categoryName", "in", categoryFilter)
    );

    const unsubscribeBudgets = onSnapshot(
      qBudget,
      (snapshot) => {
        const fetchedBudgets: BudgetDefinition[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as BudgetDefinition)
        );
        setBudgetDefinitions(fetchedBudgets);
        setIsLoadingBudgets(false);
      },
      (err) => {
        console.error("Error fetching budget definitions:", err);
        setErrorBudgets(
          `Failed to load budget limits. ${
            err.code === "permission-denied" ? "Check Firestore rules." : ""
          }`
        );
        setIsLoadingBudgets(false);
      }
    );

    return () => unsubscribeBudgets();
  }, [userExpenseCategories, isLoadingUserCategories]);

  // --- Calculate Display Items using useMemo ---
  const displayItems = useMemo(() => {
    if (isLoadingBudgets || isLoadingUserCategories) {
      return [];
    }

    const combinedCategoriesMap = new Map<
      string,
      { name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
    >();

    PREDEFINED_EXPENSE_CATEGORIES.forEach((cat) => {
      combinedCategoriesMap.set(cat.name, cat);
    });

    userExpenseCategories.forEach((userCat) => {
      if (!combinedCategoriesMap.has(userCat.name)) {
        combinedCategoriesMap.set(userCat.name, {
          name: userCat.name,
          icon: userCat.icon || "help-circle-outline",
        });
      }
    });

    const allCategories = Array.from(combinedCategoriesMap.values());

    return allCategories
      .map((category) => {
        const budgetDef = budgetDefinitions.find(
          (b) => b.categoryName === category.name
        );
        const limit = budgetDef?.limit ?? 0;
        const budgetId = budgetDef?.id ?? null;
        return {
          categoryName: category.name,
          icon: category.icon,
          limit: limit,
          budgetId: budgetId,
        };
      })
      .sort((a, b) => {
        const aHasBudget = a.limit > 0 && a.budgetId !== null;
        const bHasBudget = b.limit > 0 && b.budgetId !== null;
        if (aHasBudget && !bHasBudget) return -1;
        if (!aHasBudget && bHasBudget) return 1;
        return a.categoryName.localeCompare(b.categoryName);
      });
  }, [
    budgetDefinitions,
    isLoadingBudgets,
    userExpenseCategories,
    isLoadingUserCategories,
  ]);

  // --- Find the index of the first item without a budget ---
  // This is used to know where to place the "Not Budgeted" header
  const firstUnbudgetedIndex = useMemo(() => {
    return displayItems.findIndex(
      (item) => !(item.limit > 0 && item.budgetId !== null)
    );
  }, [displayItems]);

  // --- Modal Handling ---
  const openModalForCategory = (item: BudgetDisplayData) => {
    setSelectedCategoryName(item.categoryName);
    setIsEditMode(!!item.budgetId);
    setEditingBudgetId(item.budgetId);
    setBudgetLimit(item.limit > 0 ? String(item.limit) : "");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setEditingBudgetId(null);
    setSelectedCategoryName(null);
    setBudgetLimit("");
  };

  // --- Save/Update Budget Limit ---
  const handleSaveBudget = async () => {
    const limitValue = parseFloat(budgetLimit);

    if (!selectedCategoryName) {
      Alert.alert("Error", "Category not selected. Please try again.");
      return;
    }
    if (isNaN(limitValue) || limitValue <= 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid positive number for the budget limit."
      );
      return;
    }

    const allCategoriesMap = new Map<
      string,
      { name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
    >();
    PREDEFINED_EXPENSE_CATEGORIES.forEach((cat) =>
      allCategoriesMap.set(cat.name, cat)
    );
    userExpenseCategories.forEach((userCat) => {
      if (!allCategoriesMap.has(userCat.name)) {
        allCategoriesMap.set(userCat.name, {
          name: userCat.name,
          icon: userCat.icon || "help-circle-outline",
        });
      }
    });

    const categoryInfo = allCategoriesMap.get(selectedCategoryName);

    if (!categoryInfo) {
      Alert.alert("Error", "Internal error: Category details not found.");
      return;
    }

    const budgetData = {
      categoryName: selectedCategoryName,
      limit: limitValue,
      icon: categoryInfo.icon,
    };

    const userId = HARDCODED_USER_ID;
    const budgetsColRef = collection(db, "Accounts", userId, "budgets");

    try {
      if (isEditMode && editingBudgetId) {
        const budgetDocRef = doc(budgetsColRef, editingBudgetId);
        await updateDoc(budgetDocRef, budgetData);
        Alert.alert(
          "Success",
          `Budget limit for "${selectedCategoryName}" updated.`
        );
      } else {
        const existingBudget = budgetDefinitions.find(
          (b) => b.categoryName === selectedCategoryName
        );
        if (existingBudget) {
          Alert.alert(
            "Info",
            `Budget for "${selectedCategoryName}" already exists. Updating limit.`
          );
          const budgetDocRef = doc(budgetsColRef, existingBudget.id);
          await updateDoc(budgetDocRef, budgetData);
        } else {
          await addDoc(budgetsColRef, budgetData);
          Alert.alert(
            "Success",
            `Budget limit for "${selectedCategoryName}" set.`
          );
        }
      }
      closeModal();
    } catch (err: any) {
      console.error("Error saving budget:", err);
      Alert.alert(
        "Error",
        `Could not save budget limit. ${err.message || "Please try again."}`
      );
    }
  };

  // --- Delete Budget Limit ---
  const handleDeleteBudget = (
    budgetId: string | null,
    categoryName: string
  ) => {
    if (!budgetId) {
      Alert.alert(
        "Info",
        `No budget limit is currently set for "${categoryName}".`
      );
      return;
    }

    Alert.alert(
      "Delete Budget Limit",
      `Are you sure you want to remove the budget limit for "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Limit",
          style: "destructive",
          onPress: async () => {
            const userId = HARDCODED_USER_ID;
            const budgetDocRef = doc(
              db,
              "Accounts",
              userId,
              "budgets",
              budgetId
            );
            try {
              await deleteDoc(budgetDocRef);
              Alert.alert(
                "Success",
                `Budget limit for "${categoryName}" removed.`
              );
            } catch (err: any) {
              console.error("Error deleting budget limit:", err);
              Alert.alert(
                "Error",
                `Could not remove budget limit. ${
                  err.message || "Please try again."
                }`
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // --- Rendering Logic ---

  // Renders a single budget item in the FlatList, potentially with a header
  const renderBudgetItem = ({
    item,
    index,
  }: {
    item: BudgetDisplayData;
    index: number;
  }) => {
    const hasBudgetSet = item.limit > 0 && item.budgetId !== null;
    let header = null;

    // Check if this is the first item AND it has a budget
    if (index === 0 && hasBudgetSet) {
      header = (
        <Text style={styles.listSectionHeader}>Categories Budgeted</Text>
      );
    }
    // Check if this is the first item WITHOUT a budget
    else if (index === firstUnbudgetedIndex) {
      header = <Text style={styles.listSectionHeader}>Not Budgeted</Text>;
    }

    return (
      <>
        {/* Render the header if it exists */}
        {header}
        {/* Render the actual budget item */}
        <TouchableOpacity
          onPress={() => openModalForCategory(item)}
          activeOpacity={0.7}
          style={styles.touchableItem}
        >
          <View style={styles.budgetItem}>
            <View style={styles.budgetIconContainer}>
              <MaterialCommunityIcons
                name={item.icon}
                size={26}
                color={styles.budgetIcon.color}
              />
            </View>
            <View style={styles.budgetDetails}>
              <Text style={styles.budgetCategoryTitle}>
                {item.categoryName}
              </Text>
              {hasBudgetSet ? (
                <Text style={styles.budgetInfoText}>
                  Limit: {formatCurrency(item.limit)}
                </Text>
              ) : (
                <Text style={styles.budgetInfoTextMuted}>
                  Tap to set budget limit
                </Text>
              )}
            </View>
            <View style={styles.budgetActions}>
              {hasBudgetSet ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteBudget(item.budgetId, item.categoryName);
                  }}
                  style={styles.actionButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color="#D32F2F"
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.actionButtonPlaceholder} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  // Renders the main content area (Loading, Error, or List)
  const renderContent = () => {
    if (isLoadingBudgets || isLoadingUserCategories) {
      return (
        <View style={styles.centeredStateContainer}>
          <ActivityIndicator size="large" color="#006400" />
          <Text style={styles.centeredStateText}>Loading Budgets...</Text>
        </View>
      );
    }

    const combinedError = [errorBudgets, errorUserCategories]
      .filter(Boolean)
      .join("\n");
    if (combinedError) {
      return (
        <View style={styles.centeredStateContainer}>
          <MaterialIcons name="error-outline" size={40} color="red" />
          <Text style={[styles.centeredStateText, styles.errorText]}>
            {combinedError}
          </Text>
        </View>
      );
    }

    if (displayItems.length === 0) {
      return (
        <View style={styles.centeredStateContainer}>
          <MaterialIcons name="list-alt" size={60} color="#ccc" />
          <Text style={styles.centeredStateText}>
            No budget categories found.
          </Text>
          <Text style={styles.centeredStateText}>
            Add categories in Transactions.
          </Text>
        </View>
      );
    }

    // Render the FlatList with the combined budget items
    return (
      <FlatList
        data={displayItems} // Use the sorted array
        renderItem={renderBudgetItem} // Use the updated render function
        keyExtractor={(item) => item.categoryName}
        style={styles.budgetList}
        contentContainerStyle={styles.budgetListContent}
        // Remove ListHeaderComponent, headers are now rendered inline
      />
    );
  };

  // --- Component Return JSX ---
  return (
    <>
      <View style={styles.container}>
        <HeaderTopNav />
        <View style={styles.content}>{renderContent()}</View>

        {/* --- Modal for Setting/Editing Budget Limit --- */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>
            <ScrollView
              contentContainerStyle={styles.modalScrollViewContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? "Edit Budget Limit" : "Set Budget Limit"}
                </Text>
                {selectedCategoryName && (
                  <View style={styles.modalCategoryDisplay}>
                    <Text style={styles.modalLabel}>For Category:</Text>
                    <Text style={styles.modalCategoryName}>
                      {selectedCategoryName}
                    </Text>
                  </View>
                )}
                <Text style={styles.modalLabel}>Budget Limit (₱):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 5000"
                  keyboardType="numeric"
                  value={budgetLimit}
                  onChangeText={setBudgetLimit}
                  placeholderTextColor="#999"
                  autoFocus={true}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalSaveButton,
                      (!budgetLimit || parseFloat(budgetLimit) <= 0) &&
                        styles.modalSaveButtonDisabled,
                    ]}
                    onPress={handleSaveBudget}
                    disabled={!budgetLimit || parseFloat(budgetLimit) <= 0}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      {isEditMode ? "Update Limit" : "Set Limit"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <TouchableOpacity style={styles.fab} onPress={navigateToTransaction}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <BotNavigationBar />
    </>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
  },
  // Removed sectionTitle style as it's replaced by listSectionHeader
  listSectionHeader: {
    // Style for the new inline headers
    fontSize: 16,
    fontWeight: "bold",
    color: "#444", // Slightly darker than sectionTitle
    backgroundColor: "#f0f0f0", // Match list background
    paddingVertical: 8,
    paddingHorizontal: 15, // Match list padding
    marginTop: 10, // Add some space above the header
    marginBottom: 5, // Space between header and first item
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetList: {
    flex: 1,
  },
  budgetListContent: {
    paddingHorizontal: 15, // Keep padding for items
    paddingBottom: 90,
  },
  touchableItem: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    // Remove marginHorizontal if list padding handles it
  },
  budgetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 15,
    paddingRight: 10,
    borderRadius: 8,
  },
  budgetIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#e0f2e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  budgetIcon: {
    color: "#006400",
  },
  budgetDetails: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  budgetCategoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  budgetInfoText: {
    fontSize: 14,
    color: "#006400",
    fontWeight: "500",
    marginTop: 2,
  },
  budgetInfoTextMuted: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
  },
  budgetActions: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 38,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  centeredStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: -50,
  },
  centeredStateText: {
    fontSize: 17,
    color: "#6c757d",
    marginTop: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalScrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    width: "100%",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006400",
    marginBottom: 20,
    textAlign: "center",
  },
  modalCategoryDisplay: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  modalCategoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 25,
    fontSize: 18,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  modalSaveButton: {
    backgroundColor: "#DAA520",
    borderWidth: 1,
    borderColor: "#DAA520",
  },
  modalSaveButtonDisabled: {
    backgroundColor: "#e9d8a1",
    borderColor: "#e9d8a1",
    opacity: 0.7,
  },
  modalCancelButtonText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalSaveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BudgetsScreen;
