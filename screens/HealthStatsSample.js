import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Button, StyleSheet } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryZoomContainer,
  VictoryAxis,
} from "victory-native";
import * as firebase from "firebase";
import {
  totalCalories,
  daysView,
  totalCaloriesWeekly,
  convertWeekToChart,
} from "../api/healthStatsMethods";

let unsubscribe;

export default function HealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [weekCalorieData, setWeekCalorieData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ["Day", "Week", "Month"];

  // let userCalories = []

  // sets beginning date to current day at midnight:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);
  console.log("beginningDateObj----->", beginningDateObject);

  useEffect(() => {
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection("routes")
      .doc(currentUserUID)
      .collection("sessions")
      .where("created", ">=", beginningDateObject)
      .orderBy("created", "asc")
      .onSnapshot((querySnapshot) => {
        let userCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log("dataobj=====>", dataObj);
          // convert to Victory chart format:
          userCalories.push({
            timeStamp: dataObj.timeStamp,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
          console.log("user calories array----->", userCalories);
        });
        setCalorieData(userCalories);
      });
    return () => unsubscribe();
  }, []);

  // sets beginning date to 7 days ago:
  let beginningWeekDate = Date.now() - 604800000;
  let beginningWeekDateObject = new Date(beginningWeekDate);
  console.log("beginningWeekDateObject----->", beginningWeekDateObject);

  useEffect(() => {
    console.log("isloading initial state---->", isLoading);
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection("routes")
      .doc(currentUserUID)
      .collection("sessions")
      .where("created", ">=", beginningWeekDateObject)
      .orderBy("created", "asc")
      .onSnapshot((querySnapshot) => {
        let userCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log("dataobj=====>", dataObj);
          // convert to Victory chart format:
          userCalories.push({
            date: dataObj.date,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
        });
      //   setCalorieData(userCalories);
        console.log("user calories array----->", userCalories);
        // aggregate calories each day:
        const weekTotals = totalCaloriesWeekly(userCalories);
        console.log("weekTotals", weekTotals);
        // convert weekly calories into victory chart format:
        const weeklyChartData = convertWeekToChart(weekTotals);
        setWeekCalorieData(weeklyChartData);
        console.log("weekly chart data====>", weekCalorieData);
        setIsLoading(false);
      });
    return () => unsubscribe();
  }, []);
  console.log("is loading second state------>", isLoading);
  console.log("weekCalorieData----->", weekCalorieData);

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
          {displayButtons(buttonNames)}
        </View>
        <View>
          {buttonLabel === "Week" ? (
            <View>
              <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
              <Text>
                AVERAGE DAILY CALORIES BURNED:{" "}
                {Math.round(totalCalories(calorieData) / 7)}
              </Text>
              <VictoryChart
                width={350}
                height={400}
                theme={VictoryTheme.material}
                domainPadding={30}
              >
                <VictoryAxis
                  style={{
                    axis: { stroke: "#000" },
                    axisLabel: { fontSize: 16 },
                    ticks: { stroke: "#000" },
                    grid: { stroke: "#B3E5FC", strokeWidth: 0.25 },
                  }}
                  dependentAxis
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: "#000" },
                    axisLabel: { fontSize: 16 },
                    ticks: { stroke: "#000" },
                    tickLabels: {
                      // fill: "transparent",
                      fontSize: 11,
                      padding: 1,
                      angle: 45,
                      verticalAnchor: "middle",
                      textAnchor: "start",
                    },
                  }}
                />
                <VictoryBar
                  data={weekCalorieData}
                  x="date"
                  y="calories"
                  labels={(d) => {
                    return d.datum.calories;
                  }}
                />
              </VictoryChart>
            </View>
          ) : buttonLabel === "Month" ? (
            <View>
              <Text>MONTHLY HEALTH DATA CHART</Text>
            </View>
          ) : (
            <View>
              <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
              {calorieData && (
                <VictoryChart
                  width={350}
                  height={400}
                  theme={VictoryTheme.material}
                  domainPadding={30}
                  containerComponent={
                    <VictoryZoomContainer
                      responsive={false}
                      zoomDimension="x"
                    />
                  }
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "#000" },
                      axisLabel: { fontSize: 16 },
                      ticks: { stroke: "#000" },
                      grid: { stroke: "#B3E5FC", strokeWidth: 0.25 },
                    }}
                    dependentAxis
                  />
                  <VictoryAxis
                    style={{
                      axis: { stroke: "#000" },
                      axisLabel: { fontSize: 16 },
                      ticks: { stroke: "#000" },
                      tickLabels: {
                        // fill: "transparent",
                        fontSize: 12,
                        padding: 1,
                        angle: 45,
                        verticalAnchor: "middle",
                        textAnchor: "start",
                      },
                    }}
                  />
                  <VictoryBar
                    data={calorieData}
                    x="timeStamp"
                    y="calories"
                    labels={(d) => {
                      //  return `${d.datum.date}\n${d.datum.calories}`;
                      return `${d.datum.calories}`;
                    }}
                  />
                </VictoryChart>
              )}
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
