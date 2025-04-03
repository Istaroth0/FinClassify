import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectDropdown from 'react-native-select-dropdown';
//import DateTimePicker from '@react-native-community/datetimepicker';
const { width, height } = Dimensions.get('window'); // Get screen height

const Header = () => {
    const [selectedDate, setSelectedDate] = useState('2025 Mar');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedMonth, setSelectedMonth] = useState("Mar");

    const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const showDatePicker = () => {
        setShowYearPicker(true);
    };

    const hideDatePicker = () => {
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setDatePickerVisibility(false);
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setShowYearPicker(false);
        setShowMonthPicker(true);
    };

    const handleMonthSelect = (month: string) => {
        setSelectedMonth(month);
        setSelectedDate(`${selectedYear} ${month}`);
        setShowMonthPicker(false);
        hideDatePicker();
    };


    const handleConfirm = (date: Date) => {
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        setSelectedDate(formattedDate);
        hideDatePicker();
    };

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isMenuVisible ? 0 : -width,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isMenuVisible]);

    const menuItems = [
        { id: '1', title: 'Profile' },
        { id: '2', title: 'Settings' },
        { id: '3', title: 'Logout' },
    ];

    const renderMenuItem = ({ item }: { item: { id: string; title: string } }) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); console.log(`Menu item ${item.title} pressed`); }}>
            <Text style={styles.menuItemText}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Hamburger Menu */}
            <TouchableOpacity style={styles.iconContainer} onPress={() => setMenuVisible(true)}>
                <Ionicons name="menu-outline" size={24} color="white" /> {/* Reduced size */}
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>FinClassify</Text>

            {/* Search Icon */}
            <TouchableOpacity style={styles.iconContainer}>
                <Ionicons name="search-outline" size={24} color="white" /> {/* Reduced size */}
            </TouchableOpacity>

            {/* Date/Month Selector */}
            <TouchableOpacity style={styles.dateSelector} onPress={showDatePicker}>
                <Text style={styles.dateText}>{selectedDate}</Text>
                <Ionicons name="chevron-down-outline" size={16} color="white" /> {/* Reduced size */}
            </TouchableOpacity>

            {/* Category Labels and Amounts */}
            <View style={styles.categoryRow}>
                <View style={styles.categoryItem}>
                    <Text style={styles.categoryLabel}>Expenses</Text>
                    <Text style={styles.categoryAmount}>₱ 0.00</Text>
                </View>
                <View style={styles.categoryItem}>
                    <Text style={styles.categoryLabel}>Income</Text>
                    <Text style={styles.categoryAmount}>₱ 0.00</Text>
                </View>
                <View style={styles.categoryItem}>
                    <Text style={styles.categoryLabel}>Total</Text>
                    <Text style={styles.categoryAmount}>₱ 0.00</Text>
                </View>
            </View>

            {/* Filter/Sort Icon */}
            <TouchableOpacity style={styles.filterIcon}>
                <Ionicons name="options-outline" size={20} color="white" /> {/* Reduced size */}
            </TouchableOpacity>

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
                            keyExtractor={item => item.id}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            {/* Year Picker Modal */}
            {showYearPicker && (
                <Modal transparent animationType="fade">
                    <View style={styles.pickerModalContainer}>
                        <View style={styles.pickerContent}>
                            <Text style={styles.pickerTitle}>Select Year</Text>
                            <FlatList
                                data={years.map(String)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.pickerItem}
                                        onPress={() => handleYearSelect(parseInt(item, 10))}
                                    >
                                        <Text style={styles.pickerText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item}
                            />
                            <TouchableOpacity style={styles.pickerButton} onPress={hideDatePicker}>
                                <Text style={styles.pickerButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Month Picker Modal */}
            {showMonthPicker && (
                <Modal transparent animationType="fade">
                    <View style={styles.pickerModalContainer}>
                        <View style={styles.pickerContent}>
                            <Text style={styles.pickerTitle}>Select Month</Text>
                            <FlatList
                                data={months}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.pickerItem}
                                        onPress={() => handleMonthSelect(item)}
                                    >
                                        <Text style={styles.pickerText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item}
                            />
                            <TouchableOpacity style={styles.pickerButton} onPress={hideDatePicker}>
                                <Text style={styles.pickerButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#006400',
        padding: 8, // Reduced padding by a significant amount
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        padding: 4, // Reduced padding
        zIndex: 2,
    },
    title: {
        color: 'white',
        fontSize: 16, // Reduced font size
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8, // Reduced margin
        zIndex: 2,
    },
    dateText: {
        color: 'white',
        marginRight: 3, // Reduced margin
        fontSize: 12, // Reduced font size
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5, // Reduced margin
    },
    categoryItem: {
        alignItems: 'center',
        marginHorizontal: 3, // Reduced margin
    },
    categoryLabel: {
        color: 'white',
        fontSize: 10, // Reduced font size
    },
    categoryAmount: {
        color: 'white',
        fontSize: 12, // Reduced font size
        fontWeight: 'bold',
    },
    filterIcon: {
        padding: 4, // Reduced padding
        zIndex: 2,
    },
    datePickerModal: {
        position: 'absolute',
        top: 40, // Reduced top
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 10,
        padding: 15, // Reduced padding
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        backgroundColor: 'white',
        width: width * 0.7,
        padding: 15, // Reduced padding
        marginTop: 0,
    },
    menuItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    menuItemText: {
        fontSize: 14, // Reduced font size
    },
    pickerModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContent: {
        backgroundColor: 'white',
        padding: 15, // Reduced padding
        borderRadius: 8, // Reduced border radius
        width: width * 0.7, // Reduced width
        maxHeight: height * 0.5, //Reduced height
    },
    pickerTitle: {
        fontSize: 18, // Reduced font size
        fontWeight: 'bold',
        marginBottom: 8, // Reduced margin
        textAlign: 'center',
    },
    pickerItem: {
        paddingVertical: 10, // Reduced padding
        borderBottomWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        cursor: 'pointer',
    },
    pickerText: {
        fontSize: 16, // Reduced font size
        color: '#333',
    },
    pickerButton: {
        marginTop: 15, // Reduced margin
        padding: 8, // Reduced padding
        backgroundColor: '#ddd',
        borderRadius: 5,
        alignSelf: 'center'
    },
    pickerButtonText: {
        fontSize: 16, // Reduced font size
        color: '#333',
    },
});

export default Header;
