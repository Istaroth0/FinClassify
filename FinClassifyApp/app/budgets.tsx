import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'; // Import ScrollView
import HeaderTopNav from '../components/headertopnav';
import BudgetBottomNavBar from '../components/budgetsbotnavbar';
import { useNavigation } from '@react-navigation/native';

const BudgetedCategoriesScreen = () => {
    const navigation = useNavigation();
    const [isSetBudgetPopupVisible, setSetBudgetPopupVisible] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');

    const categories = [
        { name: 'Bills', route: 'Bills' },
        { name: 'Car', route: 'Car' },
        { name: 'Clothing', route: 'Clothing' },
        { name: 'Education', route: 'Education' },
        { name: 'Foods', route: 'Foods' },
        { name: 'Health', route: 'Health' },
        { name: 'House', route: 'House' },
        { name: 'Leisure', route: 'Leisure' },
        { name: 'Pets', route: 'Pets' },
        { name: 'Shopping', route: 'Shopping' },
        { name: 'Sports', route: 'Sports' },
        { name: 'Travel', route: 'Travel' },
        { name: 'Others', route: 'Others' }, //Added more categories
        { name: 'Gifts', route: 'Gifts' },
        { name: 'Investment', route: 'Investment'},
        { name: 'Salary', route: 'Salary'}
    ];

    const handleCategoryPress = (categoryName: string) => {
        setSelectedCategoryName(categoryName);
        setSetBudgetPopupVisible(true);
    };

    const handleSetBudgetSave = (icon: string, name: string, description: string) => {
        console.log('Icon:', icon);
        console.log('Category Name:', name);
        console.log('Description:', description);
        setSetBudgetPopupVisible(false);
    };

    return (
        <View style={styles.container}>
            <HeaderTopNav title="Budgeted Categories" />
            {/* Wrap the content in a ScrollView */}
            <ScrollView style={styles.content}>
                <Text style={styles.noBudgetMessage}>
                    Currently, no budget is applied for this month.
                </Text>
                <Text style={styles.notBudgetedTitle}>Not budgeted this month</Text>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.name}
                        style={styles.categoryItem}
                        onPress={() => handleCategoryPress(category.name)}
                    >
                        <View style={styles.categoryIcon} />
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.setAction}>Set {'>'}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <BudgetBottomNavBar />
            <SetBudgetPopup
                isVisible={isSetBudgetPopupVisible}
                onClose={() => setSetBudgetPopupVisible(false)}
                categoryName={selectedCategoryName}
                onSave={handleSetBudgetSave}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    noBudgetMessage: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
    },
    notBudgetedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 8,
    },
    categoryIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#228B22',
        marginRight: 10,
    },
    categoryName: {
        fontSize: 16,
        color: 'black',
        flex: 1,
    },
    setAction: {
        color: '#228B22',
        fontWeight: 'bold',
    },
});

export default BudgetedCategoriesScreen;
