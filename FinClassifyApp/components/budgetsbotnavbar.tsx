import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BottomNavigationBar = () => {
  const navigation = useNavigation();

  // Define the types for the NavItem component
    interface NavItemProps {
        icon: keyof typeof Ionicons.glyphMap;
        label: string | null;
        onPress: () => void;
        isCenter?: boolean; // New prop to indicate the center button
    }

  const NavItem = ({ icon, label, onPress, isCenter }: NavItemProps) => {
        const buttonStyle = isCenter ? styles.centerButton : styles.navItem;
        const textStyle = isCenter ? styles.centerButtonText : styles.navLabel;
    return (
      <TouchableOpacity style={buttonStyle} onPress={onPress}>
        <Ionicons name={icon} size={isCenter? 35: 25} color="#2E8B57" />
        {label && <Text style={textStyle}>{label}</Text>}
      </TouchableOpacity>
    );
  };

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
        icon="add-circle-outline" // Changed to add
        label={null} // No label for the center button
        onPress={() => (navigation.navigate as NavigateFunction)('Add')} // Corrected route name.
        isCenter={true} // Set this to true for center button
      />
      <NavItem
        icon="calculator-outline"
        label="Budgets"
        onPress={() => (navigation.navigate as NavigateFunction)('Budgets')}
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
  centerButton: { // Style for the center button
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    flex: 1,
  },
    centerButtonText: {
    fontSize: 12,
    color: '#2E8B57',
    marginTop: 5,
  },
});

export default BottomNavigationBar;
