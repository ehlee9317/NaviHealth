import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import {
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryPie,
} from "victory-native";
import * as firebase from "firebase";
import { totalCalories } from "../api/healthStatsMethods";

export default function ProfileStats() {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [isLoading, setIsLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState([]);

  // sets beginning date to current day at midnight:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);

  // Pull estimates data:
  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection("routes")
      .doc(currentUserUID)
      .collection("sessions")
      .where("created", ">=", beginningDateObject)
      .orderBy("created", "asc")
      .onSnapshot((querySnapshot) => {
        let actualCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          // convert to Victory chart format:
          actualCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.actualCaloriesBurned),
          });
        });
        const dailyActualCalories = totalCalories(actualCalories);

        const pieChartData = [
          {
            x: "Actuals",
            y: dailyActualCalories,
            label: `Today's Burn:\n${dailyActualCalories} cals`,
          },
          {
            x: "Goal",
            y: 500 - dailyActualCalories,
            label: `Remaining:\n${500 - dailyActualCalories} cals`,
          },
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your Daily Progress</Text>
        <Text style={styles.information}>
          *recommended daily total of 500 cals
        </Text>
      </View>
      <View style={styles.chartContainer}>
        <VictoryChart height={310} theme={VictoryTheme.material}>
          <VictoryAxis
            style={{
              axis: { stroke: "transparent" },
              ticks: { stroke: "transparent" },
              tickLabels: { fill: "transparent" },
            }}
            dependentAxis
          />
          <VictoryAxis
            style={{
              axis: { stroke: "transparent" },
              ticks: { stroke: "transparent" },
              tickLabels: { fill: "transparent" },
            }}
          />
          <VictoryPie
            data={pieChartData}
            colorScale={["#EF767A", "#456990"]}
            innerRadius={70}
            labelRadius={({ innerRadius }) => innerRadius + 40}
            style={{ labels: { fontSize: 14, fontWeight: "bold" } }}
          />
        </VictoryChart>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20%",
  },
  title: {
    fontFamily: "HelveticaNeue",
    fontWeight: "bold",
    fontSize: 20,
  },
  information: {
    fontSize: 11,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
