import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryTooltip,
  VictoryGroup,
  VictoryLegend,
} from 'victory-native';
import * as firebase from 'firebase';
import {
  totalCalories,
  // daysView,
  totalCaloriesWeekly,
  convertWeekToChart,
} from '../api/healthStatsMethods';
import DailyHealthStatsScreen from './DailyHealthStatsScreen'
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen'

export default function HealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [actualsCalorieData, setActualsData] = useState([]);
  const [weekCalorieData, setWeekCalorieData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ['Day', 'Week', 'Month'];

  // sets beginning date to current day at midnight:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);
  console.log('beginningDateObj----->', beginningDateObject);

  // daily stats:
  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection('routes')
      .doc(currentUserUID)
      .collection('sessions')
      .where('created', '>=', beginningDateObject)
      .orderBy('created', 'asc')
      .onSnapshot((querySnapshot) => {
        let estCalories = [];
        let actualCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log('dataobj=====>', dataObj);
          // convert to Victory chart format:
          estCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
          actualCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.actualCaloriesBurned),
          });
          console.log('estimated calories array----->', estCalories);
          console.log('actual calories array----->', actualCalories);
        });
        setCalorieData(estCalories);
        setActualsData(actualCalories);
      });
    return () => unsubscribe();
  }, []);

  // sets beginning date to 7 days ago:
  let beginningWeekDate = Date.now() - 604800000;
  let beginningWeekDateObject = new Date(beginningWeekDate);
  console.log('beginningWeekDateObject----->', beginningWeekDateObject);

  // weekly stats:
  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection('routes')
      .doc(currentUserUID)
      .collection('sessions')
      .where('created', '>=', beginningWeekDateObject)
      .orderBy('created', 'asc')
      .onSnapshot((querySnapshot) => {
        let userCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log('dataobj=====>', dataObj);
          // convert to Victory chart format:
          userCalories.push({
            date: dataObj.date,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
        });
        //   setCalorieData(userCalories);
        console.log('user calories array----->', userCalories);
        // aggregate calories each day:
        const weekTotals = totalCaloriesWeekly(userCalories);
        console.log('weekTotals', weekTotals);
        // convert weekly calories into victory chart format:
        const weeklyChartData = convertWeekToChart(weekTotals);
        setWeekCalorieData(weeklyChartData);
        console.log('weekly chart data====>', weekCalorieData);
        setIsLoading(false);
      });
    return () => unsubscribe();
  }, []);
  console.log('is loading second state------>', isLoading);
  console.log('weekCalorieData----->', weekCalorieData);

  const rangeClickHandler = (buttonName, calorieData) => {
    console.log('button clicked!');
    if (buttonName === 'Week') {
      setButtonLabel('Week');
    } else if (buttonName === 'Month') {
      setButtonLabel('Month');
    } else {
      setButtonLabel('Day');
    }
  };

  const displayButtons = (rangeButtons) => {
    return rangeButtons.map((singleButton) => {
      return (
        <Button
          // key={}
          title={`${singleButton}`}
          onPress={() => rangeClickHandler(singleButton)}
        >
          {singleButton}
        </Button>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          {displayButtons(buttonNames)}
        </View>
        <View>
          {buttonLabel === 'Week' ? (
            <View>
              {<WeeklyHealthStatsScreen />}
            </View>
          ) : buttonLabel === 'Month' ? (
            <View>
              <Text>MONTHLY HEALTH DATA CHART</Text>
            </View>
          ) : (
            <View>
              {<DailyHealthStatsScreen />}
            </View>
          )}
        </View>
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
