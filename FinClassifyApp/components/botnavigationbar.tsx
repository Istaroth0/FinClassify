import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this: `expo install @expo/vector-icons`

const BottomNavigationBar = () => {
  return (
    <View style={styles.container}>
      <NavItem icon="reader-outline" label="Records" />
      <NavItem icon="pie-chart-outline" label="Analysis" />
      <NavItem icon="calculator-outline" label="Budgets" />
      <NavItem icon="pricetag-outline" label="Categories" />
      <NavItem icon="wallet-outline" label="Accounts" />
    </View>
  );
};

const NavItem: React.FC<{ icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = ({ icon, label }) => {
  return (
    <TouchableOpacity style={styles.navItem} onPress={() => {
        // Add your navigation logic here.  For example:
        console.log(`Navigating to ${label}`);
        // You might use a navigation library like React Navigation:
        // navigation.navigate(label);
    }}>
      <Ionicons name={icon} size={25} color="#2E8B57" />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white', // Background color of the navigation bar
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd', // Light border at the top
  },
  navItem: {
    flex: 1, // Distribute items evenly
    alignItems: 'center', // Center icon and text
  },
  navLabel: {
    fontSize: 12,
    color: '#2E8B57',
    marginTop: 5,
  },
});

export default BottomNavigationBar;
