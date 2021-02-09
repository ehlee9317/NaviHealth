import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Button, StyleSheet } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
} from "victory-native";
import * as firebase from "firebase";
import {
  totalCalories,
  daysView,
  totalCaloriesWeekly,
} from "../api/healthStatsMethods";
import WeeklyHealthStatsScreen from "./HealthStatsWeeklyScreen";

let unsubscribe;

export default function HealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [weekCalorieData, setWeekCalorieData] = useState({});
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ["Day", "Week", "Month"];

  useEffect(() => {
    const getTodaysCalories = async () => {
      let userCalories = [];

      // sets beginning date to current day at midnight:
      let beginningDate = new Date().setHours(0, 0, 0, 0);
      let beginningDateObject = new Date(beginningDate);
      console.log("beginningDateObj----->", beginningDateObject);
      try {
        unsubscribe = await db
          .collection("routes")
          .doc(currentUserUID)
          .collection("sessions")
          .where("created", ">=", beginningDateObject)
          .orderBy("created", "asc")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const dataObj = doc.data();
              console.log("dataObj----->", dataObj);
              const caloriesOverTime = {
                // day: dataObj.created.toDate().toString().slice(0,10),
                date: dataObj.created.toDate().toLocaleTimeString(),
                calories: Math.round(dataObj.estCaloriesBurned),
              };
              userCalories.push(caloriesOverTime);
            });
            setCalorieData(userCalories);
            console.log("calorieData array--->", userCalories);
          });
      } catch (error) {
        console.log("Error getting documents", error);
      }
    };
    getTodaysCalories();
  }, []);

  useEffect(() => {
    const getWeeksCalories = async () => {
      let userCalories = [];

      // sets beginning date to last week:
      let beginningDate = Date.now() - 604800000;
      let beginningDateObject = new Date(beginningDate);
      console.log("beginningDateObj----->", beginningDateObject);
      try {
        await db
          .collection("routes")
          .doc(currentUserUID)
          .collection("sessions")
          .where("created", ">=", beginningDateObject)
          .orderBy("created", "asc")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const dataObj = doc.data();
              console.log("dataObj----->", dataObj);
              const caloriesOverTime = {
                day: dataObj.created.toDate().toString().slice(0, 10),
                calories: Math.round(dataObj.estCaloriesBurned),
              };
              userCalories.push(caloriesOverTime);
            });
          });
        setCalorieData(userCalories);
        console.log("calorieData array--->", userCalories);
        // aggregate calorie count for each day in the week:
        const weekTotals = totalCaloriesWeekly(userCalories);
        console.log("weekTotals", weekTotals);
        const weeklyChartData = convertWeekToChart(weekTotals);
        setWeekCalorieData(weeklyChartData);
        console.log("weekly chart data====>", weekCalorieData);
      } catch (error) {
        console.log("Error getting documents", error);
      }
    };
    getWeeksCalories();
  }, []);

  const rangeClickHandler = (buttonName, calorieData) => {
    console.log("button clicked!");
    if (buttonName === "Week") {
      setButtonLabel("Week");
    } else if (buttonName === "Month") {
      setButtonLabel("Month");
    } else {
      setButtonLabel("Day");
    }
  };

  const displayButtons = (rangeButtons) => {
    return rangeButtons.map((singleButton) => {
      return (
        <Button
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
        <View style={{ flexDirection: "row" }}>
          {/* <Button title="Day"/>
         <Button title="Week"
           onPress={() => {
             console.log('button pressed')
             // navigation.navigate("WeeklyHealthStats")
             // {WeeklyHealthStatsScreen}
           }}
         />
         <Button title="Month"/> */}
          {displayButtons(buttonNames)}
        </View>
        <View>
          {buttonLabel === "Day" ? (
            <View>
              <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
              {calorieData && (
                <VictoryChart
                  width={350}
                  theme={VictoryTheme.material}
                  domainPadding={30}
                >
                  <VictoryBar
                    data={calorieData}
                    x="date"
                    y="calories"
                    labels={(d) => {
                      return `${d.datum.date}\n${d.datum.calories}`;
                    }}
                  />
                </VictoryChart>
              )}
            </View>
          ) : (
            <View>
              <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
              <Text>
                AVERAGE DAILY CALORIES BURNED:{" "}
                {Math.round(totalCalories(calorieData) / 7)}
              </Text>
              {/* {weekCalorieData && (
        <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30} standalone={false}>
          <VictoryBar data={weekCalorieData} x='date' y='calories' labels={(d)=>{return d.datum.calories}} />

        </VictoryChart>
        )} */}
            </View>
          )}
        </View>
      </View>

      <Button title="Go back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
