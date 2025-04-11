import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

const AuthScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [isLogin, setIsLogin] = useState(true);
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const login = () => {
    if (Email === "admin@gmail.com" && Password === "admin") {
      console.log("Successfully Logged in!");
      Alert.alert("Successfully Logged in!");
      navigation.navigate("record"); // Now this works!
    } else {
      console.log("Invalid Credentials!");
      Alert.alert("Invalid Credentials!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? "Login here" : "Create Account"}
      </Text>
      <Text style={styles.subtitle}>
        {isLogin
          ? "Welcome back, you've been missed!"
          : "Create an account to manage your money smarter and celebrate every win."}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#4F4F4F"
        value={Email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#4F4F4F"
        value={Password}
        onChangeText={setPassword}
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          placeholderTextColor="#4F4F4F"
        />
      )}

      {isLogin && (
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>{isLogin ? "Sign In" : "Sign Up"}</Text>
      </TouchableOpacity>

      <Text style={styles.toggleText} onPress={toggleAuthMode}>
        {isLogin ? "Create new account" : "Already have an account? Log in"}
      </Text>

      <Text style={styles.orContinueText}>Or continue with</Text>

      <View style={styles.socialIcons}>
        <Image
          source={require("../assets/images/facebook.png")}
          style={styles.icon}
        />
        <Image
          source={require("../assets/images/apple.png")}
          style={styles.icon}
        />
        <Image
          source={require("../assets/images/google (1).png")}
          style={styles.icon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#B58900",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#4F4F4F",
    backgroundColor: "#F9F9F9",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#0F730C",
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#B58900",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#B58900",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  toggleText: {
    marginTop: 15,
    color: "#0F730C",
    fontSize: 14,
    fontWeight: "bold",
  },
  orContinueText: {
    marginTop: 20,
    fontSize: 14,
    color: "#333",
  },
  socialIcons: { flexDirection: "row", marginTop: 10 },
  icon: { width: 24, height: 24, marginHorizontal: 8 },
});

export default AuthScreen;
