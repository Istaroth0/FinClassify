import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Or any other icon library

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => console.log("Back")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View /> {/* Spacer for the right side if needed */}
      </View>

      {/* Profile Header */}
      <View style={styles.header}>
        {/* Temporary Photo Placeholder */}
        <View style={styles.photoPlaceholder}>
          <Ionicons name="person-circle-outline" size={80} color="#888" />
          {/* You can replace the Icon with an Image component later */}
          {/* <Image source={{ uri: 'your_image_url' }} style={styles.profileImage} /> */}
        </View>

        {/* Name */}
        <Text style={styles.name}>Your Name Here</Text>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#555"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>your.email@example.com</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#555"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>+63 9XX XXX XXXX</Text>
          </View>
          {/* Add more info items as needed */}
        </View>
      </View>

      {/* Additional Sections (Like in the example image) */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.listItem}>
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

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    overflow: "hidden", // To contain the image if used
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
});

export default ProfilePage;
