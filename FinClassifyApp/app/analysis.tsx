import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import HeaderTopNav from '../components/headertopnav';
import BottomNavigationBar from '../components/botnavigationbar';
import { Dimensions } from 'react-native';

const AnalysisScreen = () => {
    const [expenses, setExpenses] = useState([
        { category: 'Bills', amount: 2500, color: '#FF0000' },
        { category: 'Car', amount: 1500, color: '#0000FF' },
        { category: 'Clothing', amount: 550, color: '#FFA500' },
        { category: 'Education', amount: 200, color: '#FFFF00' },
    ]);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    const pieData = expenses.map((item) => ({
        ...item,
        percentage: ((item.amount / totalExpenses) * 100).toFixed(2),
    }));

    const renderPieChart = () => {
        const Labels = ({ slices, height, width }: { slices: any[], height: number, width: number }) => { // Change slices type to any[]
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;
                return (
                    <SvgText
                        key={index}
                        x={labelCentroid[0]}
                        y={labelCentroid[1]}
                        fill={'white'}
                        textAnchor={'middle'}
                        alignmentBaseline={'middle'}
                        fontSize={12}
                    >
                        <Text>{`${data.percentage}%`}</Text>
                    </SvgText>
                );
            });
        };

        return (
            <PieChart
                style={{ height: 200, width: 200, marginVertical: 20, alignSelf: 'center' }}
                valueAccessor={({ amount }: { amount: number }) => amount}
                data={pieData}
                spacing={0}
                outerRadius={'90%'}

            >
                <Labels slices={pieData} height={0} width={0} /> {/* Pass pieData to Labels */}
            </PieChart>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderTopNav title="FinClassify" />
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Expenses</Text>
                    <Text style={styles.headerText}>Income</Text>
                </View>
                {renderPieChart()}
                <View style={styles.breakdownContainer}>
                    {pieData.map((item) => (
                        <View key={item.category} style={styles.itemContainer}>
                            <View style={[styles.icon, { backgroundColor: item.color }]} />
                            <Text style={styles.categoryText}>{item.category}</Text>
                            <Text style={styles.amountText}>-₱{item.amount.toFixed(2)}</Text>
                            <Text style={styles.percentageText}>{item.percentage}%</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <BottomNavigationBar />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    breakdownContainer: {
        marginTop: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    categoryText: {
        fontSize: 16,
        flex: 1,
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    percentageText: {
        fontSize: 14,
        color: 'gray',
    },
});

export default AnalysisScreen;
