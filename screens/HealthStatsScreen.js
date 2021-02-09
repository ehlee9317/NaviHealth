import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';
import * as firebase from 'firebase';
import { totalCalories, daysView, totalCaloriesWeekly } from '../api/healthStatsMethods'
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen'

let unsubscribe

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
        unsubscribe = await db.collection("routes").doc(currentUserUID).collection("sessions").where("created",">=", beginningDateObject).orderBy("created","asc").get()
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
          setCalorieData(userCalories)
          console.log('calorieData array--->', userCalories)
        })
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
            onPress={() => {
              console.log('button pressed')
              // navigation.navigate("WeeklyHealthStats")
              // {WeeklyHealthStatsScreen}
            }}
          />
          <Button title="Month"/>
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        {calorieData&& (
          <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30}>
            <VictoryBar data={calorieData} x='date' y='calories'
            labels={
              (d) => {return `${d.datum.date}\n${d.datum.calories}`}
            } />
          </VictoryChart>
        )}
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




// componentDidMount() {
//   this.db = firebase.firestore();
//   unsubscribed = this.db
//     .collection("games")
//     .doc(this.state.gameID)
//     .onSnapshot((snapshot) => {
//       let data = {};
//       let userUID = this.props.route.params.userUID;
//       data["status"] = snapshot.data().status;
//       data["score"] = snapshot.data()[userUID];
//       data["answered"] = snapshot.data()[`answered${userUID}`];
//       data["creator"] = snapshot.data().creator;
//       data["numOneFS"] = snapshot.data().numOne;
//       data["numTwoFS"] = snapshot.data().numTwo;
//       data["answerFS"] = snapshot.data().answer;
//       data["waiting"] = snapshot.data().waiting;
//       data["received"] = snapshot.data().received;
//       data["players"] = snapshot.data().players;
//       data["question"] = snapshot.data().question;
//       data["gameEnded"] = snapshot.data().gameEnded;
//       this.setState(data);
//     });
// }
