// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\app\index.tsx
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword, // Import for Sign Up
  signInWithEmailAndPassword, // Import for Sign In
} from "firebase/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { app } from "./firebase"; // Import your Firebase app instance

// Initialize Firebase Auth
const auth = getAuth(app);

const AuthScreen = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Separate loading for Google

  // --- Google Sign-In Configuration ---
  useEffect(() => {
    GoogleSignin.configure({
      // **********************************************************************
      // Make sure this Web Client ID is correct and ends with .com
      // **********************************************************************
      webClientId:
        "523821328429-3oupi8optbht8hh4sa2gp6rr9r6dq5de.apps.googleusercontent.com", // Corrected typo from .comm to .com
      offlineAccess: true, // Set to true if you need server-side access tokens
    });
  }, []);

  // --- Google Sign-In Handler ---
  const onGoogleButtonPress = async () => {
    if (isLoading) return; // Prevent multiple auth attempts
    setIsGoogleLoading(true); // Start Google-specific loading
    setIsLoading(true); // Also set general loading
    try {
      // Check if device has Google Play Services installed & up-to-date
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the user object which contains the idToken
      const signInResponse = await GoogleSignin.signIn();

      // --- Workaround: Log the response and use 'any' type assertion ---
      console.log(
        "Google Sign-In Raw Response:",
        JSON.stringify(signInResponse, null, 2)
      );
      const idToken =
        (signInResponse as any)?.user?.idToken ??
        (signInResponse as any)?.idToken;
      // --- End Workaround ---

      // Ensure idToken is received
      if (!idToken) {
        // Log already happened above
        throw new Error("Google Sign-In failed: ID token missing in response.");
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the Firebase credential
      const userCredential = await signInWithCredential(auth, googleCredential);

      console.log("Signed in with Google!", userCredential.user);
      Alert.alert(
        "Google Sign-In Successful",
        `Welcome ${userCredential.user.displayName || "User"}!`
      );
      router.replace("/record"); // Navigate to the main app screen on success
    } catch (error: any) {
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-in Cancelled by user");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-in already in progress");
        Alert.alert("Operation in Progress", "Sign-in is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Google Play Services not available or outdated");
        Alert.alert(
          "Play Services Error",
          "Google Play Services is not available or outdated. Please update it."
        );
      } else {
        // Handle other errors (network, configuration, Firebase issues)
        console.error("Google Sign-in Error:", error);
        Alert.alert(
          "Google Sign-In Failed",
          error.message ||
            "An unknown error occurred. Please check your connection or configuration."
        );
      }
    } finally {
      setIsGoogleLoading(false); // Stop Google-specific loading
      setIsLoading(false); // Stop general loading
    }
  };

  // --- Email/Password Authentication Handler ---
  const handleAuthentication = () => {
    if (isGoogleLoading) return; // Prevent overlap with Google Sign-In
    Keyboard.dismiss(); // Dismiss keyboard for better UX

    // --- Input Validations ---
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
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
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    // Basic password length check for sign up
    if (!isLogin && password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password should be at least 6 characters long."
      );
      return;
    }
    // --- End Validations ---

    setIsLoading(true); // Start loading indicator for email/password auth

    if (isLogin) {
      // --- Firebase Sign In with Email/Password ---
      signInWithEmailAndPassword(auth, trimmedEmail, password)
        .then((userCredential) => {
          console.log("Successfully Logged in!", userCredential.user.email);
          Alert.alert("Login Successful", "Welcome back!");
          router.replace("/record"); // Navigate on success
        })
        .catch((error) => {
          console.error("Login Error:", error.code, error.message);
          let errorMessage = "An unexpected error occurred during login.";
          // Provide user-friendly error messages based on Firebase error codes
          switch (error.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential": // More generic credential error
              errorMessage = "Invalid email or password.";
              break;
            case "auth/invalid-email":
              errorMessage = "Please enter a valid email address.";
              break;
            case "auth/user-disabled":
              errorMessage = "This user account has been disabled.";
              break;
            case "auth/too-many-requests":
              errorMessage =
                "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.";
              break;
            default: // Use Firebase's message for other errors
              errorMessage = `Login failed: ${error.message}`;
          }
          Alert.alert("Login Failed", errorMessage);
        })
        .finally(() => setIsLoading(false)); // Stop loading regardless of outcome
    } else {
      // --- Firebase Sign Up with Email/Password ---
      createUserWithEmailAndPassword(auth, trimmedEmail, password)
        .then((userCredential) => {
          console.log("Sign Up Successful!", userCredential.user.email);
          Alert.alert(
            "Sign Up Successful",
            `Account created for ${trimmedEmail}.`
          );
          // Optional: Implement email verification flow
          // sendEmailVerification(userCredential.user);
          router.replace("/record"); // Navigate after successful signup
        })
        .catch((error) => {
          console.error("Sign Up Error:", error.code, error.message);
          let errorMessage = "Could not create account.";
          // Provide user-friendly error messages
          switch (error.code) {
            case "auth/email-already-in-use":
              errorMessage =
                "This email address is already registered. Please log in or use a different email.";
              break;
            case "auth/invalid-email":
              errorMessage = "Please enter a valid email address.";
              break;
            case "auth/weak-password":
              errorMessage =
                "Password is too weak. It should be at least 6 characters long.";
              break;
            default: // Use Firebase's message for other errors
              errorMessage = `Sign up failed: ${error.message}`;
          }
          Alert.alert("Sign Up Failed", errorMessage);
        })
        .finally(() => setIsLoading(false)); // Stop loading regardless of outcome
    }
  };

  // --- Render UI ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // Allows taps on buttons within ScrollView while keyboard is up
        >
          <View style={styles.innerContainer}>
            {/* Title and Subtitle */}
            <Text style={styles.title}>
              {isLogin ? "Login here" : "Create Account"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Welcome back, you've been missed!"
                : "Create an account to manage your money smarter and celebrate every win."}
            </Text>

            {/* --- Email/Password Inputs --- */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading} // Disable input when loading
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry // Hides password input
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              editable={!isLoading} // Disable input when loading
            />

            {/* Confirm Password Input (only for Sign Up) */}
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading} // Disable input when loading
              />
            )}

            {/* Forgot Password Link (only for Login) */}
            {isLogin && (
              <TouchableOpacity disabled={isLoading}>
                {/* TODO: Implement Forgot Password functionality */}
                <Text style={styles.forgotPassword}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            {/* --- Sign In/Sign Up Button --- */}
            <TouchableOpacity
              style={[
                styles.button,
                // Apply disabled style only if general loading is active AND Google isn't loading
                isLoading && !isGoogleLoading && styles.buttonDisabled,
              ]}
              onPress={handleAuthentication}
              disabled={isLoading} // Disable button during any loading state
            >
              {/* Show loader specifically for email/password auth */}
              {isLoading && !isGoogleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            {/* --- Toggle Auth Mode Link --- */}
            {/* Changed to navigate to signup screen */}
            <TouchableOpacity
              onPress={() => router.push("/signup")} // Navigate to signup route
              disabled={isLoading}
            >
              <Text style={styles.toggleText}>Create new account</Text>
            </TouchableOpacity>

            <Text style={styles.orContinueText}>Or continue with</Text>

            {/* --- Social Login Buttons --- */}
            <View style={styles.socialIcons}>
              {/* Facebook (Placeholder) */}
              <TouchableOpacity
                onPress={() => console.log("Facebook Login (Not Implemented)")}
                disabled={isLoading}
              >
                <Image
                  source={require("../assets/images/facebook.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {/* Apple (Placeholder - iOS only) */}
              {Platform.OS === "ios" && ( // Conditionally render for iOS
                <TouchableOpacity
                  onPress={() => console.log("Apple Login (Not Implemented)")}
                  disabled={isLoading}
                >
                  <Image
                    source={require("../assets/images/apple.png")}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
              {/* Google */}
              <TouchableOpacity
                onPress={onGoogleButtonPress}
                disabled={isLoading}
              >
                {/* Show loader specifically for Google button */}
                {isGoogleLoading ? (
                  <ActivityIndicator
                    size="large" // Use large for icon replacement
                    color="#DB4437" // Google Red
                    style={styles.icon} // Use icon style for size/spacing
                  />
                ) : (
                  <Image
                    source={require("../assets/images/google (1).png")}
                    style={styles.icon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Ensure background color for the view
  },
  scrollContainer: {
    flexGrow: 1, // Ensures content can grow and scroll
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    paddingVertical: 20, // Add some vertical padding
  },
  innerContainer: {
    width: "90%", // Use percentage width for responsiveness
    maxWidth: 400, // Max width for larger screens
    alignItems: "center",
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#B58900", // Gold color
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555", // Dark grey
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: "#ccc", // Light grey border
    backgroundColor: "#fdfdfd", // Slightly off-white background
    fontSize: 16,
    color: "#333", // Dark text color
  },
  forgotPassword: {
    alignSelf: "flex-end", // Position to the right
    color: "#006400", // Dark green
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#B58900", // Gold color
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#B58900",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5, // Android shadow
    marginBottom: 15,
    minHeight: 50, // Ensure consistent height with loader
    justifyContent: "center", // Center content (text or loader)
  },
  buttonDisabled: {
    // Style for disabled button
    backgroundColor: "#CFAA70", // Lighter gold
    opacity: 0.7,
    elevation: 0, // Remove shadow when disabled
    shadowOpacity: 0,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  toggleText: {
    marginTop: 10,
    color: "#006400", // Dark green
    fontSize: 15,
    fontWeight: "bold",
  },
  orContinueText: {
    marginTop: 30,
    fontSize: 14,
    color: "#666", // Medium grey
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Align icons vertically
    width: "80%", // Adjust width as needed
    marginTop: 10,
  },
  icon: {
    width: 40, // Standard icon size
    height: 40,
    marginHorizontal: 15, // Spacing between icons
  },
});

export default AuthScreen;
