import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';
import * as firebase from 'firebase';
import { totalCalories, daysView, totalCaloriesWeekly } from '../api/healthStatsMethods'
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen'

export default function HealthStatsScreen ({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([])
  // const [caloriesByWeek, setWeekTotals] = useState({})
  // const [weekCalorieData, setWeekCalorieData] = useState({})

  useEffect(() => {
    const getTodaysCalories = async () => {
      let userCalories = []

      // sets beginning date to current day at midnight:
      let beginningDate = (new Date()).setHours(0,0,0,0)
      let beginningDateObject = new Date(beginningDate)
      console.log('beginningDateObj----->', beginningDateObject)
      try {
        await db.collection("routes").doc(currentUserUID).collection("sessions").where("created",">=", beginningDateObject).orderBy("created","asc").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const dataObj = doc.data();
            console.log('dataObj----->', dataObj)
            const caloriesOverTime = {
              // day: dataObj.created.toDate().toString().slice(0,10),
              date: dataObj.created.toDate().toLocaleTimeString(),
              calories: Math.round(dataObj.estCaloriesBurned)
            }
            userCalories.push(caloriesOverTime)
          })
        })
        setCalorieData(userCalories)
        console.log('calorieData array--->', userCalories)
      } catch (error) {
        console.log("Error getting documents", error);
      }
    }
    getTodaysCalories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row" }}>
          <Button title="Day"/>
          <Button title="Week"
            onPress={() => navigation.navigate("WeeklyHealthStats")}
          />
          <Button title="Month"/>
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30} >
          <VictoryBar data={calorieData} x='date' y='calories' labels={(d)=>{return d.datum.calories}} />

        </VictoryChart>
      </View>

      <Button title='Go back' onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

