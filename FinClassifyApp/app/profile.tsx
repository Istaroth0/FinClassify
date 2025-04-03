import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Circle } from 'react-native-svg';

const ProfileScreen = () => {
    const [expenses] = useState([
        { category: 'Bills', amount: 1200, color: '#FF0000' },
        { category: 'Car', amount: 800, color: '#0000FF' },
        { category: 'Clothing', amount: 500, color: '#FFA500' },
        { category: 'Education', amount: 200, color: '#FFFF00' },
    ]);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    const pieData = expenses.map((item) => ({
        ...item,
        key: item.category, // Use a unique key for each item
        ...item,
        percentage: ((item.amount / totalExpenses) * 100).toFixed(2),
    }));

    const renderPieChart = () => {
      const CustomLabel = ({ pieCentroid, data, color }: { pieCentroid: [number, number], data: { percentage: string }, color: string }) => (
        <View style={{ position: 'absolute', left: pieCentroid[0], top: pieCentroid[1] }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {`${data.percentage}%`}
          </Text>
        </View>
      );

        return (
            <PieChart
                style={{ height: 200, width: 200, alignSelf: 'center' }}
                valueAccessor={({ item }) => item.amount}
                data={pieData}
                outerRadius={'90%'}
            >
              {pieData.map((item, index) => (
                <CustomLabel
                  key={index}
                  pieCentroid={[
                    100 + 80 * Math.cos((((index + 0.5) / pieData.length) * 2 * Math.PI)),
                    100 + 80 * Math.sin((((index + 0.5) / pieData.length) * 2 * Math.PI)),
                  ]}
                  data={item}
                  color={item.color}
                />
              ))}
            </PieChart>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Welcome Back,</Text>
                <Text style={styles.headerName}>Yourname</Text>
                <View style={styles.profileIcon} />
            </View>

            <Text style={styles.manageExpensesText}>Manage your expenses</Text>

            <View style={styles.expensesCard}>
                <Text style={styles.expensesTitle}>Expenses</Text>
                {renderPieChart()}
                <View style={styles.legendContainer}>
                    {expenses.map((item) => (
                        <View key={item.category} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.category}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.summary}>
                    <TouchableOpacity style={styles.summaryButton}>
                        <Text style={styles.summaryButtonText}>This week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.summaryButton}>
                        <Text style={styles.summaryButtonText}>This Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.summaryButton}>
                        <Text style={styles.summaryButtonText}>This Year</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.incomeExpenses}>
                    <View style={styles.incomeContainer}>
                        <Text style={styles.incomeTitle}>Income</Text>
                        <Text style={styles.incomeAmount}>+₱4,450.00</Text>
                         <View style={styles.incomeBar}/>
                    </View>
                    <View style={styles.expensesContainer}>
                        <Text style={styles.expensesTitle}>Expenses</Text>
                        <Text style={styles.expensesAmount}>+₱4,450.00</Text>
                        <View style={styles.expenseBar}/>
                    </View>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                 <View style={styles.lightBulbIcon} />
                <Text style={styles.bottomText}>Your expense plan is so good</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Light background
    },
    header: {
        backgroundColor: '#228B22', // Forest Green
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerName: {
        fontSize: 20,
        color: 'white',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
    },
    manageExpensesText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#228B22', // Forest Green
        padding: 20,
    },
    expensesCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    expensesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 20
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 10,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: 'gray',
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    summaryButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    summaryButtonText: {
        fontSize: 12,
    },
    incomeExpenses: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    incomeContainer: {
        flex: 1,
        marginRight: 10
    },
    expensesContainer:{
        flex: 1,
        marginLeft: 10
    },
    incomeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
    },
    incomeAmount: {
        fontSize: 16,
        color: 'green',
    },
      expensesAmount: {
        fontSize: 16,
        color: 'red',
    },
    incomeBar: {
        height: 5,
        backgroundColor: 'green',
        borderRadius: 5,
        marginTop: 5
    },
    expenseBar: {
        height: 5,
        backgroundColor: 'red',
        borderRadius: 5,
        marginTop: 5
    },
    bottomContainer: {
        backgroundColor: '#228B22',
        padding: 20,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center'

    },
    bottomText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    },
    lightBulbIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFDA62'
    }
});

export default ProfileScreen;
