import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router"; // Import Link, remove useNavigation

const BottomNavigationBar = () => {
  // Remove useNavigation and navigateTo functions
  // const navigation = useNavigation();
  // const navigateToRecord = () => { ... };
  // ...

  return (
    <View style={styles.container}>
      {/* Use Link for navigation */}
      {/* Make sure the href paths match your file structure in the 'app' directory */}
      <Link href="../../record" asChild>
        {/* asChild passes Link's props (like onPress) to NavItem */}
        <NavItem icon="reader-outline" label="Records" />
      </Link>

      <Link href="../../analysis" asChild>
        <NavItem icon="pie-chart-outline" label="Analysis" />
      </Link>

      <Link href="../../Budgets" asChild>
        {/* Ensure 'Budgets.tsx' exists at app/Budgets.tsx */}
        <NavItem icon="calculator-outline" label="Budgets" />
      </Link>

      <Link href="../../Accounts" asChild>
        {/* Ensure 'Accounts.tsx' exists at app/Accounts.tsx */}
        <NavItem icon="wallet-outline" label="Accounts" />
      </Link>
    </View>
  );
};

// --- NavItem Component ---
// Needs to accept props passed down from Link (like onPress)
// Wrap content in TouchableOpacity to receive the press handling
const NavItem: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  // Add props that Link might pass down via asChild
  onPress?: () => void;
  accessibilityRole?: any;
}> = ({ icon, label, onPress, accessibilityRole }) => {
  return (
    // This TouchableOpacity receives the onPress from the parent Link
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress} // Use the onPress passed from Link
      accessibilityRole={accessibilityRole} // Pass accessibility role
    >
      <Ionicons name={icon} size={25} color="#2E8B57" />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// --- Styles (remain the same) ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    color: "#2E8B57",
    marginTop: 5,
  },
});

export default BottomNavigationBar;
