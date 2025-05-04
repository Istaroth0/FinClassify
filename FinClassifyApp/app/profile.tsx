import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal, // <-- Add Modal
  TextInput, // <-- Add TextInput
  KeyboardAvoidingView, // <-- Add KeyboardAvoidingView
  Platform, // <-- Add Platform
  ScrollView, // <-- Add ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Or any other icon library
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  User,
  EmailAuthProvider, // <-- Add EmailAuthProvider
  reauthenticateWithCredential, // <-- Add reauthenticateWithCredential
  updatePassword, // <-- Add updatePassword
} from "firebase/auth"; // Import Firebase Auth
import { useRouter } from "expo-router";
import { app } from "./firebase"; // Import your Firebase app instance

const auth = getAuth(app);

const ProfilePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- State for Change Password Modal ---
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // --- Handle Password Change ---
  const handleChangePassword = async () => {
    setPasswordError(null); // Clear previous errors
    if (!currentUser || !currentUser.email) {
      setPasswordError("Could not verify user information.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // 1. Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Update the password
      await updatePassword(currentUser, newPassword);

      Alert.alert("Success", "Password updated successfully.");
      closeChangePasswordModal(); // Close modal on success
    } catch (error: any) {
      console.error("Password Change Error:", error);
      let userFriendlyError = "Failed to update password. Please try again.";
      if (error.code === "auth/wrong-password") {
        userFriendlyError = "Incorrect current password.";
      } else if (error.code === "auth/weak-password") {
        userFriendlyError = "New password is too weak.";
      } else if (error.code === "auth/requires-recent-login") {
        userFriendlyError =
          "For security, please log out and log back in before changing your password.";
      }
      setPasswordError(userFriendlyError);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- Helper to close and reset modal state ---
  const closeChangePasswordModal = () => {
    setIsChangePasswordModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError(null);
    setIsUpdatingPassword(false);
  };

  // --- Logout Handler ---
  const handleLogout = async () => {
    if (!currentUser) return;
    try {
      // Sign the user out
      await signOut(auth);
      // Navigate to the root route ("/") which is your login page (index.tsx)
      router.replace("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", "Could not log out. Please try again.");
    }
  };
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View /> {/* Spacer for the right side if needed */}
      </View>

      {/* Profile Header */}
      <View style={styles.header}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#006400" />
        ) : currentUser ? (
          <>
            {/* Profile Photo */}
            <View style={styles.photoPlaceholder}>
              {currentUser.photoURL ? (
                <Image
                  source={{ uri: currentUser.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={80} color="#888" />
              )}
            </View>

            {/* Name */}
            <Text style={styles.name}>
              {currentUser.displayName || "User Name"}
            </Text>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#555"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>{currentUser.email}</Text>
              </View>
              {/* Add phone number if available */}
              {currentUser.phoneNumber && (
                <View style={styles.infoItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#555"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>{currentUser.phoneNumber}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.infoText}>Not Logged In</Text>
        )}
      </View>

      {/* Additional Sections (Like in the example image) */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setIsChangePasswordModalVisible(true)} // <-- Open modal
            disabled={!currentUser || isLoading}
          >
            <Text>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text>Notifications</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
          </TouchableOpacity>
          {/* Add more settings options */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.listItem}>
            <Text>Currency</Text>
            <Text>PHP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text>Language</Text>
            <Text>English</Text>
          </TouchableOpacity>
          {/* Add more preferences */}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, !currentUser && styles.disabledButton]}
          onPress={handleLogout} // Call the restored handleLogout function
          disabled={!currentUser}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* --- Change Password Modal --- */}
      <Modal
        visible={isChangePasswordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeChangePasswordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Change Password</Text>

              {passwordError && (
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              )}

              <Text style={styles.modalLabel}>Current Password:</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                placeholderTextColor="#999"
                editable={!isUpdatingPassword}
              />

              <Text style={styles.modalLabel}>New Password:</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min. 6 characters)"
                placeholderTextColor="#999"
                editable={!isUpdatingPassword}
              />

              <Text style={styles.modalLabel}>Confirm New Password:</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirm your new password"
                placeholderTextColor="#999"
                editable={!isUpdatingPassword}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={closeChangePasswordModal}
                  disabled={isUpdatingPassword}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalSaveButton,
                    isUpdatingPassword && styles.modalSaveButtonDisabled,
                  ]}
                  onPress={handleChangePassword}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>
                      Update Password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#006400",
    // Adjust paddingTop for status bar if needed (e.g., using SafeAreaView or Platform checks)
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 20,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoContainer: {
    width: "80%",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
    color: "#777",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
  },
  content: {
    paddingHorizontal: 15,
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#aaa", // Grey out disabled button
    opacity: 0.7,
  },

  // --- Modal Styles ---
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006400",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalErrorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    minHeight: 46, // Ensure consistent height with loader
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  modalSaveButton: {
    backgroundColor: "#DAA520",
    borderWidth: 1,
    borderColor: "#DAA520",
  },
  modalSaveButtonDisabled: {
    backgroundColor: "#e9d8a1",
    borderColor: "#e9d8a1",
    opacity: 0.7,
  },
  modalCancelButtonText: { color: "#495057", fontSize: 16, fontWeight: "bold" },
  modalSaveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default ProfilePage;
