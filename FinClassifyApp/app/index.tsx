// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router"; // Use useRouter from expo-router

const AuthScreen = () => {
  const router = useRouter(); // Get the router object
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(""); // Renamed for clarity
  const [password, setPassword] = useState(""); // Renamed for clarity
  const [confirmPassword, setConfirmPassword] = useState(""); // Added state for confirm password

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear fields when switching modes
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleAuthentication = () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password."
      );
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (isLogin) {
      // --- Login Logic ---
      // Replace this with your actual Firebase authentication logic
      if (email === "admin@gmail.com" && password === "admin") {
        console.log("Successfully Logged in!");
        Alert.alert("Login Successful", "Welcome back!");
        // Navigate using router.replace to prevent going back to login
        router.replace("/record"); // Use path-based navigation
      } else {
        console.log("Invalid Credentials!");
        Alert.alert("Login Failed", "Invalid email or password.");
      }
    } else {
      // --- Sign Up Logic ---
      // Replace this with your actual Firebase sign-up logic
      console.log("Attempting Sign Up with:", email);
      Alert.alert(
        "Sign Up Attempt",
        `Account creation requested for ${email}. (Implement Firebase signup)`
      );
      // Example: After successful signup, navigate to the main app screen
      // router.replace('/record');
    }
  };

  return (
    // Use KeyboardAvoidingView and ScrollView for better handling on smaller screens
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
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
              placeholderTextColor="#888" // Slightly lighter placeholder
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none" // Disable auto-capitalization for email
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}

            {isLogin && (
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleAuthentication} // Use the combined handler
            >
              <Text style={styles.buttonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Create new account"
                  : "Already have an account? Log in"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.orContinueText}>Or continue with</Text>

            <View style={styles.socialIcons}>
              {/* Add TouchableOpacity wrappers for social logins */}
              <TouchableOpacity onPress={() => console.log("Facebook Login")}>
                <Image
                  source={require("../assets/images/facebook.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log("Apple Login")}>
                <Image
                  source={require("../assets/images/apple.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log("Google Login")}>
                <Image
                  source={require("../assets/images/google (1).png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1, // Make KAV take full height
  },
  scrollContainer: {
    flexGrow: 1, // Allow content to grow and enable scrolling
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    backgroundColor: "#FFFFFF", // Explicitly set a white background
  },
  innerContainer: {
    width: "90%", // Use percentage width for responsiveness
    maxWidth: 400, // Max width for larger screens
    alignItems: "center", // Center items within the inner container
    paddingVertical: 30, // Add vertical padding
  },
  title: {
    fontSize: 28, // Slightly larger title
    fontWeight: "bold",
    color: "#B58900", // Keep gold color
    marginBottom: 8, // Adjusted spacing
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555", // Slightly darker subtitle
    marginBottom: 30, // More space after subtitle
    lineHeight: 22, // Improve readability
  },
  input: {
    width: "100%",
    height: 50, // Standard input height
    paddingHorizontal: 15, // More horizontal padding
    borderWidth: 1,
    borderRadius: 8, // Slightly softer corners
    marginBottom: 15, // Consistent spacing
    borderColor: "#ccc", // Lighter border
    backgroundColor: "#fdfdfd", // Very light background
    fontSize: 16, // Standard font size
    color: "#333", // Ensure text color is dark
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#006400", // Use a consistent green
    marginBottom: 20, // More space before button
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#B58900", // Keep gold color
    paddingVertical: 15, // Standard button padding
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#B58900",
    shadowOffset: { width: 0, height: 4 }, // Slightly larger shadow
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5, // Add elevation for Android
    marginBottom: 15, // Space after button
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  toggleText: {
    marginTop: 10, // Adjusted spacing
    color: "#006400", // Consistent green
    fontSize: 15, // Slightly larger toggle text
    fontWeight: "bold",
  },
  orContinueText: {
    marginTop: 30, // More space before social
    fontSize: 14,
    color: "#666", // Slightly lighter grey
    marginBottom: 15, // Space after text
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center", // Center icons
    width: "60%", // Limit width for better spacing
  },
  icon: {
    width: 40, // Larger icons
    height: 40,
    marginHorizontal: 15, // More space between icons
  },
});

export default AuthScreen;
