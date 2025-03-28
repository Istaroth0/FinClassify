import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import AddCategoryModal from '../components/AddCategoryModal';
import AddAccountModal from '../components/AddAccountModal';

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface Account {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

const incomeCategories: Category[] = [
  { id: '1', name: 'Awards', icon: 'trophy' },
  { id: '2', name: 'Lottery', icon: 'ticket' },
  { id: '3', name: 'Refunds', icon: 'credit-card-refund' },
  { id: '4', name: 'Rental', icon: 'home-city' },
  { id: '5', name: 'Salary', icon: 'cash' },
  { id: '6', name: 'Sale', icon: 'tag' },
];

const expenseCategories: Category[] = [
  { id: '1', name: 'Bills', icon: 'file-document-outline' },
  { id: '2', name: 'Car', icon: 'car' },
  { id: '3', name: 'Clothing', icon: 'tshirt-crew' },
  { id: '4', name: 'Education', icon: 'school' },
  { id: '5', name: 'Foods', icon: 'food' },
  { id: '6', name: 'Health', icon: 'heart-pulse' },
  { id: '7', name: 'House', icon: 'home' },
  { id: '8', name: 'Leisure', icon: 'movie' },
  { id: '9', name: 'Pets', icon: 'paw' },
  { id: '10', name: 'Shopping', icon: 'cart' },
  { id: '11', name: 'Sports', icon: 'basketball' },
  { id: '12', name: 'Travel', icon: 'train' },
];

const initialAccounts: Account[] = [
  { id: '1', name: 'Cash', icon: 'cash' },
  { id: '2', name: 'Card', icon: 'credit-card' },
  { id: '3', name: 'Savings', icon: 'piggy-bank' },
];

export default function TransactionScreen() {
  const [transactionType, setTransactionType] = useState<'Expenses' | 'Income'>('Income');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [isAddAccountModalVisible, setIsAddAccountModalVisible] = useState(false);

  const currentCategories = transactionType === 'Expenses' ? expenseCategories : incomeCategories;

  const handleAddCategory = (newCategory: { name: string; icon: string; description?: string }) => {
    // Note: In a real app, you'd want to persist these changes
    // For now, we'll just show the modal but not actually add categories
    setIsAddCategoryModalVisible(false);
  };

  const handleAddAccount = (newAccount: { name: string; icon: string; description?: string }) => {
    const account: Account = {
      id: (accounts.length + 1).toString(),
      ...newAccount,
    };
    setAccounts([...accounts, account]);
    setIsAddAccountModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          ),
          title: 'Add Transaction',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#006400',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'Expenses' && styles.activeTypeButton,
          ]}
          onPress={() => setTransactionType('Expenses')}
        >
          <Text style={[
            styles.typeButtonText,
            transactionType === 'Expenses' && styles.activeTypeButtonText,
          ]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'Income' && styles.activeTypeButton,
          ]}
          onPress={() => setTransactionType('Income')}
        >
          <Text style={[
            styles.typeButtonText,
            transactionType === 'Income' && styles.activeTypeButtonText,
          ]}>Income</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {currentCategories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name={category.icon as any} size={24} color="white" />
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

        <Text style={styles.sectionTitle}>Accounts</Text>
        <View style={styles.accountsGrid}>
          {accounts.map((account) => (
            <TouchableOpacity key={account.id} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name={account.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.categoryText}>{account.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.addNewButton}
            onPress={() => setIsAddAccountModalVisible(true)}
          >
            <Text style={styles.addNewButtonText}>+ Add New Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddCategoryModal
        visible={isAddCategoryModalVisible}
        onClose={() => setIsAddCategoryModalVisible(false)}
        onSave={handleAddCategory}
      />
      <AddAccountModal
        visible={isAddAccountModalVisible}
        onClose={() => setIsAddAccountModalVisible(false)}
        onSave={handleAddAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTypeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#006400',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#006400',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 30,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  addNewButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#DAA520',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addNewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 