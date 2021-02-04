import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import * as firebase from 'firebase';

// const data = [
//   { week: 1, calories: 100 },
//   { week: 2, calories: 300 },
//   { week: 3, calories: 500 },
//   { week: 4, calories: 400 },
// ];


export default function HealthStatsScreen ({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([])

  useEffect(() => {
    const getCalorieData = async () => {
      let userCalories = []
      try {
        await db.collection("fakeHealthData").where("userId", "==", currentUserUID).get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const dataObj = doc.data();
            console.log('dataObj----->', dataObj)
            const caloriesOverTime = {
              day: dataObj.timestamp.toDate().toString().slice(0,10),
              calories: dataObj.calories
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
    getCalorieData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text>Calories Burned</Text>
        <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30}>
          <VictoryBar data={calorieData} x='day' y='calories' />
        </VictoryChart>
      </View>
      <View>
        <Text>PLACEHOLDER METRIC</Text>
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
