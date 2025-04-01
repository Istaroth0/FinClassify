import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AddNewAcctModal from '../components/AddNewAcctModal';

const { width } = Dimensions.get('window');

type Account = {
  name: string;
  icon: string;
};

type Category = {
  name: string;
  icon: string;
};

const TransactionModule = () => {
  const [activeTab, setActiveTab] = useState('Income');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([
    { name: 'Cash', icon: 'money-check-alt' },
    { name: 'Card', icon: 'credit-card' },
    { name: 'Savings', icon: 'piggy-bank' },
  ]);
  
  const categories: Category[] = [
    { name: 'Awards', icon: 'trophy' },
    { name: 'Lottery', icon: 'ticket-alt' },
    { name: 'Refunds', icon: 'credit-card' },
    { name: 'Rental', icon: 'home' },
    { name: 'Salary', icon: 'money-bill-wave' },
    { name: 'Sale', icon: 'tag' },
  ];

  const handleSaveNewAccount = (newAccount: Account) => {
    setAccounts([...accounts, newAccount]);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs with Underline */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'Expenses' && styles.activeTabText]}>Expenses</Text>
          {activeTab === 'Expenses' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Income')}
        >
          <Text style={[styles.tabText, activeTab === 'Income' && styles.activeTabText]}>Income</Text>
          {activeTab === 'Income' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
        <View style={styles.categoriesAndAccountsContainer}>
          <View style={styles.sectionContainer}>
            {/* Categories */}
            <Text style={styles.sectionHeader}>Categories</Text>
            <View style={styles.gridContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={[styles.iconButton, selectedCategory === category.name && styles.selectedButton]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <FontAwesome5 name={category.icon} size={24} color="white" />
                  <Text style={styles.iconText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.centeredButtonContainer}>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add New Category</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Separator */}
          <View style={styles.separator} />

          <View style={styles.sectionContainer}>
            {/* Accounts */}
            <Text style={styles.sectionHeader}>Accounts</Text>
            <View style={styles.gridContainer}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.name}
                  style={[styles.iconButton, selectedAccount === account.name && styles.selectedButton]}
                  onPress={() => setSelectedAccount(account.name)}
                >
                  <FontAwesome5 name={account.icon} size={24} color="white" />
                  <Text style={styles.iconText}>{account.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.centeredButtonContainer}>
              <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add New Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Adding New Account */}
      <AddNewAcctModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveNewAccount}
        accounts={accounts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#136207', padding: 16, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  buttonText: { color: 'white', fontSize: 16 },
  headerButton: { padding: 10 },
  
  tabsContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { color: '#333', fontSize: 16, fontWeight: '500' },
  activeTabText: { color: '#136207', fontWeight: 'bold' },
  underline: { height: 2, width: '100%', backgroundColor: '#136207', marginTop: 4 },
  
  categoriesAndAccountsContainer: {
    backgroundColor: '#FFFDFD',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 200,
    flexShrink: 1,
  },
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#D89214', marginBottom: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  iconButton: { backgroundColor: '#136207', padding: 16, borderRadius: 50, width: 70, alignItems: 'center', marginBottom: 12 },
  selectedButton: { backgroundColor: '#0A4D02' },
  iconText: { color: 'white', fontSize: 12, marginTop: 4, textAlign: 'center' },

  
  centeredButtonContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  addButton: { backgroundColor: '#D89214', padding: 12, borderRadius: 8, alignItems: 'center', width: 200 , marginTop:20 },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

  separator: {
    height: 1,
    backgroundColor: '#136207',
    marginVertical: 16,
  },
});

export default TransactionModule;
