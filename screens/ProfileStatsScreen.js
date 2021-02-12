import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
  VictoryGroup,
  VictoryLegend,
  VictoryVoronoiContainer,
  VictoryPie,
} from 'victory-native';
import * as firebase from 'firebase';
import {
  totalCalories,
  daysView,
  totalCaloriesWeekly,
} from '../api/healthStatsMethods';
import Icon from 'react-native-vector-icons/Ionicons';

const dummyData = [
  { x: 'Actual Calories', y: 500 / 100 },
  { x: 'Goal', y: 10 },
];

export default function ProfileStats({ navigation }) {
  const avgCalorieGoal = 500;
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [isLoading, setIsLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState([]);

  // sets beginning date to current day at midnight:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);
  console.log('beginningDateObj----->', beginningDateObject);

  // Pull estimates data:
  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection('routes')
      .doc(currentUserUID)
      .collection('sessions')
      .where('created', '>=', beginningDateObject)
      .orderBy('created', 'asc')
      .onSnapshot((querySnapshot) => {
        let actualCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log('dataobj=====>', dataObj);
          // convert to Victory chart format:
          actualCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.actualCaloriesBurned),
          });
        });
        const dailyActualCalories = totalCalories(actualCalories);

        const pieChartData = [
          { x: 'Actuals', y: dailyActualCalories, label: `Today's Burn:\n${dailyActualCalories} cals` },
          { x: 'Goal', y: 500 - dailyActualCalories, label: `Remaining:\n${500 - dailyActualCalories} cals`},
        ];
        setPieChartData(pieChartData);
        setIsLoading(false);
      });
    return () => unsubscribe();
  }, []);

  return isLoading ? (
    <SafeAreaView>
      <Text>Loading</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <VictoryChart
          // width={400}
          // height={400}
          theme={VictoryTheme.material}
          // domainPadding={30}
        >
          <VictoryLabel text={`Your Daily Progress\n\n*based on a recommended daily total of 500 calories`} x={225} y={30} textAnchor="middle" style={{fontSize: 15, fontWeight: "bold"}}/>
          <VictoryAxis
            style={{
              axis: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: 'transparent' },
            }}
            dependentAxis
          />
          <VictoryAxis
            style={{
              axis: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: 'transparent' },
            }}
          />
          <VictoryPie
            data={pieChartData}
            colorScale={["#EF767A","#456990" ]}
            innerRadius={100}
            style={{ labels: { fontSize: 15, fontWeight: "bold"} }}
          />
        </VictoryChart>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
