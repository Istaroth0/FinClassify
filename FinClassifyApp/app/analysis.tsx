import React from "react";
import { View, Text } from "react-native";
import Header from "@/components/headertopnav";
import BottomNavigationBar from "@/components/botnavigationbar";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

function analysis() {
  const navigation = useNavigation();
  const navigateToTransaction = () => {
    navigation.navigate("transactions" as never);
  };

  return (
    <>
      <View
        style={{
          flex: 1,

          backgroundColor: "#FFFFFF",
        }}
      >
        <Header />
        <Text>Analysis</Text>

        <TouchableOpacity style={styles.fab} onPress={navigateToTransaction}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <BottomNavigationBar />
    </>
  );
}
const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "#0F730C",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
});
export default analysis;
