import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, FlatList, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

interface HeaderTopNavProps {
    title: string;
}

const HeaderTopNav = ({ title }: HeaderTopNavProps) => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const [showDateAndTotal, setShowDateAndTotal] = useState(true);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedMonth, setSelectedMonth] = useState('Mar');
    const [isYearPickerVisible, setYearPickerVisible] = useState(false);
    const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
    const [expenses, setExpenses] = useState(100);
    const [income, setIncome] = useState(100);
    const totalCalc = expenses + income;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isMenuVisible ? 0 : -width,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isMenuVisible]);

    const menuItems = [
        { id: '1', title: 'Profile', route: 'Profile' },
        { id: '2', title: 'Settings', route: 'Settings' },
        { id: '3', title: 'Logout', route: 'Logout' },
    ];

    const years = ['2023', '2024', '2025', '2026', '2027'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const renderMenuItem = ({ item }: { item: { id: string; title: string; route?: string } }) => {
        return (
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    setMenuVisible(false);
                    if (item.route) {
                        console.log(`Navigating to ${item.route}`);
                    }
                    console.log(`Menu item ${item.title} pressed`);
                }}
            >
                <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    const showYearPicker = () => {
        console.log('showYearPicker called');
        setYearPickerVisible(true);
    };

    const showMonthPicker = () => {
        console.log('showMonthPicker called');
        setMonthPickerVisible(true);
    };

    const handleYearChange = useCallback((itemValue: string) => {
        setSelectedYear(itemValue);
    }, []);

    const handleMonthChange = useCallback((itemValue: string) => {
        setSelectedMonth(itemValue);
    }, []);

    const closeYearPicker = useCallback(() => {
        setYearPickerVisible(false);
    }, []);

    const closeMonthPicker = useCallback(() => {
        setMonthPickerVisible(false);
    }, []);



    return (
        <View style={styles.container}>
            {/* Top Row (Hamburger, Title, Search) */}
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.iconContainer} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu-outline" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity style={styles.iconContainer}>
                    <Ionicons name="search-outline" size={30} color="white" />
                </TouchableOpacity>
            </View>

            {/* Date and Total Row */}
            {showDateAndTotal && (
                <View style={styles.dateAndTotalRow}>
                    <TouchableOpacity
                        style={styles.dateSelector}
                        onPress={showMonthPicker}
                    >
                        <Text style={styles.dateText}>{selectedYear} {selectedMonth}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.categoryContainer}>
                        <View style={styles.categoryLabels}>
                            <Text style={styles.categoryLabel}>Expenses</Text>
                            <Text style={styles.categoryLabel}>Income</Text>
                            <Text style={styles.categoryLabel}>Total</Text>
                        </View>
                        <View style={styles.categoryAmounts}>
                            <Text style={styles.categoryAmount}>₱ {expenses.toFixed(2)}</Text>
                            <Text style={styles.categoryAmount}>₱ {income.toFixed(2)}</Text>
                            <Text style={styles.categoryAmount}>₱ {totalCalc.toFixed(2)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.filterIcon}>
                        <Ionicons name="options-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Side Menu Modal */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setMenuVisible(false)}
                >
                    <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
                        <FlatList
                            data={menuItems}
                            renderItem={renderMenuItem}
                            keyExtractor={(item) => item.id}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            {/* Year Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isYearPickerVisible}
                onRequestClose={closeYearPicker}
            >
                <View style={styles.pickerModalOverlay}>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedYear}
                            onValueChange={handleYearChange}
                        >
                            {years.map((year) => (
                                <Picker.Item key={year} label={year} value={year} />
                            ))}
                        </Picker>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={closeYearPicker}
                        >
                            <Text style={styles.pickerButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Month Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMonthPickerVisible}
                onRequestClose={closeMonthPicker}
            >
                <View style={styles.pickerModalOverlay}>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedMonth}
                            onValueChange={handleMonthChange}
                        >
                            {months.map((month) => (
                                <Picker.Item key={month} label={month} value={month} />
                            ))}
                        </Picker>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={closeMonthPicker}
                        >
                            <Text style={styles.pickerButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#006400',
        paddingHorizontal: 15,
        paddingTop: 15,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    iconContainer: {
        padding: 5,
        zIndex: 2,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        backgroundColor: 'white',
        width: width * 0.7,
        padding: 20,
        marginTop: 0,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    menuItemText: {
        fontSize: 16,
    },
    dateAndTotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 0,
        width: '100%',
        backgroundColor: '#004a00',
        paddingVertical: 10,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#006400',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
    },
    dateText: {
        color: 'white',
        marginRight: 5,
        fontSize: 16,
    },
    categoryContainer: {
        flexDirection: 'column', // Stack labels and amounts vertically
        alignItems: 'flex-start', // Align items to the start (left in LTR)
        marginRight: 10, // Add some margin to the right of the whole container
    },
    categoryLabels: {
        flexDirection: 'row',
        color: 'white',
        fontSize: 12,
        marginBottom: 4, // Add space between labels and amounts
    },
    categoryLabel: {
        color: 'white',
        fontSize: 12,
        marginHorizontal: 10,
        minWidth: 50, // Ensure labels have consistent width
        textAlign: 'center',
    },
    categoryAmounts: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryAmount: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 10,
        minWidth: 50, // Ensure amounts have consistent width
        textAlign: 'center',
    },
    filterIcon: {
        padding: 5,
        zIndex: 2,
    },
    pickerModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
        alignItems: 'stretch',
    },
    pickerButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#006400',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    pickerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HeaderTopNav;

