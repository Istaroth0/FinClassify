import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Define the types for the NavItem component
interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

const NavItem = ({ icon, label, onPress }: NavItemProps) => {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={25} color="#2E8B57" />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const BottomNavigationBar = () => {
  const navigation = useNavigation();

  // Define a type for the navigation functions
  type NavigateFunction = (screenName: string) => void;

  return (
    <View style={styles.container}>
      <NavItem
        icon="reader-outline"
        label="Records"
        onPress={() => (navigation.navigate as NavigateFunction)('Records')}
      />
      <NavItem
        icon="pie-chart-outline"
        label="Analysis"
        onPress={() => (navigation.navigate as NavigateFunction)('Analysis')}
      />
      <NavItem
        icon="calculator-outline"
        label="Budgets"
        onPress={() => (navigation.navigate as NavigateFunction)('Budgets')}
      />
      <NavItem
        icon="pricetag-outline"
        label="Categories"
        onPress={() => (navigation.navigate as NavigateFunction)('Categories')}
      />
      <NavItem
        icon="wallet-outline"
        label="Accounts"
        onPress={() => (navigation.navigate as NavigateFunction)('Accounts')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#2E8B57',
    marginTop: 5,
  },
});

export default BottomNavigationBar;
