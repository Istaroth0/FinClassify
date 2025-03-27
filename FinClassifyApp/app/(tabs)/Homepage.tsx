import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FinClassify</Text>
        <TouchableOpacity>
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.date}>2025 Mar</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Expenses</Text>
          <Text style={styles.statValue}>₱ 0.00</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Income</Text>
          <Text style={styles.statValue}>₱ 0.00</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Total</Text>
          <Text style={styles.statValue}>₱ 0.00</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Image source={require('../../assets/images/!.png')} style={styles.image} />
        <Text style={styles.noRecordText}>No record in this month. Tap + to add new expense or income.</Text>
      </View>

      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#0F730C', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  statsContainer: { backgroundColor: '#0F730C', padding: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  date: { color: 'white', fontSize: 16, marginBottom: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { color: 'white', fontSize: 14 },
  statValue: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  image: { width: 80, height: 80, marginBottom: 10 },
  noRecordText: { fontSize: 14, color: '#555', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#0F730C', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 } }
});

export default HomeScreen;
