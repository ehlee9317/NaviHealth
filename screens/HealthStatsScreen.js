import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
} from 'victory-native';
import * as firebase from 'firebase';
import {
  totalCalories,
  daysView,
  totalCaloriesWeekly,
} from '../api/healthStatsMethods';
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen';

let unsubscribe;

export default function HealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  // const [caloriesByWeek, setWeekTotals] = useState({})
  // const [weekCalorieData, setWeekCalorieData] = useState({})

  // let userCalories = []

  // sets beginning date to current day at midnight:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);
  console.log('beginningDateObj----->', beginningDateObject);

  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection('routes')
      .doc(currentUserUID)
      .collection('sessions')
      .where('created', '>=', beginningDateObject)
      .orderBy('created', 'asc')
      .onSnapshot((querySnapshot) => {
        let userCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data()
          console.log('dataobj=====>', dataObj)
          // convert to Victory chart format:
          userCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.estCaloriesBurned)
          })
          console.log('user calories array----->', userCalories)
        })
        setCalorieData(userCalories)
      });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <Button title='Day' />
          <Button
            title='Week'
            onPress={() => {
              console.log('button pressed');
              navigation.navigate("WeeklyHealthStats")
              // {WeeklyHealthStatsScreen}
            }}
          />
          <Button title='Month' />
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        {calorieData && (
          <VictoryChart
            width={400}
            height={400}
            theme={VictoryTheme.material}
            domainPadding={30}
          >
            <VictoryAxis
              style={{
                axis: { stroke: '#000' },
                axisLabel: { fontSize: 16 },
                ticks: { stroke: '#000' },
                grid: { stroke: '#B3E5FC', strokeWidth: 0.25 },
              }}
              dependentAxis
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#000' },
                axisLabel: { fontSize: 16 },
                ticks: { stroke: '#000' },
                tickLabels: {
                  // fill: "transparent",
                  fontSize: 12,
                  padding: 1,
                  angle: 45,
                  verticalAnchor: 'middle',
                  textAnchor: 'start',
                },
              }}
            />
            <VictoryBar
              data={calorieData}
              x='date'
              y='calories'
              labels={(d) => {
                // return `${d.datum.calories}\n${d.datum.date}`;
                return `${d.datum.calories}`;
              }}
              // labelComponent={<VictoryTooltip style={{fontSize: 15}}/>}
            />

          </VictoryChart>
        )}
      </View>

      <Button title='Go back' onPress={() => navigation.goBack()} />
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
