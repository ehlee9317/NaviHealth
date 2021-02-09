import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
} from 'victory-native';
import * as firebase from 'firebase';
import {
  totalCalories,
  totalCaloriesWeekly,
  convertWeekToChart,
} from '../api/healthStatsMethods';
import HealthStatsScreen from './HealthStatsScreen';

// data for Victory: [
//   {"date": date, "calories": calories},
// ]

export default function WeeklyHealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [weekCalorieData, setWeekCalorieData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // sets beginning date to 7 days ago:
  let beginningDate = Date.now() - 604800000;
  let beginningDateObject = new Date(beginningDate);
  console.log('beginningDateObj----->', beginningDateObject);

  useEffect(() => {
    console.log('isloading initial state---->', isLoading);
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
          const dataObj = doc.data();
          console.log('dataobj=====>', dataObj);
          // convert to Victory chart format:
          userCalories.push({
            date: dataObj.date,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
        });
        setCalorieData(userCalories);
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

  return isLoading ? (
    <SafeAreaView>
      <Text>Loading</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <Button
            title='Day'
            onPress={() => {
              console.log('button pressed');
              navigation.navigate('DailyHealthStats');
            }}
          />
          <Button title='Week' />
          <Button title='Month' />
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        <Text>
          AVERAGE DAILY CALORIES BURNED:{' '}
          {Math.round(totalCalories(calorieData) / 7)}
        </Text>
        <VictoryChart
          width={350}
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
                fontSize: 11,
                padding: 1,
                angle: 45,
                verticalAnchor: 'middle',
                textAnchor: 'start',
              },
            }}
          />
          <VictoryBar
            data={weekCalorieData}
            x='date'
            y='calories'
            labels={(d) => {
              return d.datum.calories;
            }}
          />
        </VictoryChart>
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

// useEffect(() => {
//   const getWeeksCalories = async () => {
//     console.log('isloading initial state---->', isLoading)
//     let userCalories = []

//     // sets beginning date to last week:
//     let beginningDate = Date.now() - 604800000
//     let beginningDateObject = new Date(beginningDate)
//     console.log('beginningDateObj----->', beginningDateObject)
//     try {
//       await db.collection("routes").doc(currentUserUID).collection("sessions").where("created",">=", beginningDateObject).orderBy("created","asc").get()
//       .then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           const dataObj = doc.data();
//           console.log('dataObj----->', dataObj)
//           const caloriesOverTime = {
//             day: dataObj.created.toDate().toString().slice(0,10),
//             calories: Math.round(dataObj.estCaloriesBurned)
//           }
//           userCalories.push(caloriesOverTime)
//         })
//       })
//       setCalorieData(userCalories)
//       console.log('calorieData array--->', userCalories)
//       // aggregate calorie count for each day in the week:
//       const weekTotals = totalCaloriesWeekly(userCalories)
//       console.log('weekTotals', weekTotals)
//       const weeklyChartData = convertWeekToChart(weekTotals)
//       setWeekCalorieData(weeklyChartData)
//       console.log('weekly chart data====>', weekCalorieData)
//       setIsLoading(false)
//       console.log('isloading second state---->', isLoading)
//     } catch (error) {
//       console.log("Error getting documents", error);
//     }
//   }
//   getWeeksCalories();
// }, []);
