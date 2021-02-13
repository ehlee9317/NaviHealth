import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Button, StyleSheet } from "react-native";
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
} from "victory-native";
import * as firebase from "firebase";
import {
  totalCalories,
  totalCaloriesWeekly,
  convertWeekToChart,
} from "../api/healthStatsMethods";
import Icon from "react-native-vector-icons/Ionicons";
// data for Victory: [
//   {"date": date, "calories": calories},
// ]

export default function MonthlyHealthStatsScreen({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [monthCalorieDataEstimates, setMonthCalorieDataEstimates] = useState(
    {}
  );
  const [monthCalorieDataActuals, setMonthCalorieDataActuals] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // sets beginning date to 30 days ago:
  let beginningDate = Date.now() - 2592000000;
  let beginningDateObject = new Date(beginningDate);
  console.log("beginningDateObj----->", beginningDateObject);

  useEffect(() => {
    console.log("isloading initial state---->", isLoading);
    // Pulls data from firebase and converts format to Victory chart format:
    const unsubscribe = db
      .collection("routes")
      .doc(currentUserUID)
      .collection("sessions")
      .where("created", ">=", beginningDateObject)
      .orderBy("created", "asc")
      .onSnapshot((querySnapshot) => {
        let estCalories = [];
        let actualCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log("dataobj=====>", dataObj);
          // convert to Victory chart format:
          estCalories.push({
            date: dataObj.date,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
          actualCalories.push({
            date: dataObj.date,
            calories: Math.round(dataObj.actualCaloriesBurned),
          });
        });
        setCalorieData(actualCalories);

        // aggregate calories each day:
        const estMonthTotals = totalCaloriesWeekly(estCalories);
        const actualMonthTotals = totalCaloriesWeekly(actualCalories);
        // console.log('monthTotals', monthTotals);
        // convert weekly calories into victory chart format:
        const estMonthlyChartData = convertWeekToChart(estMonthTotals);
        const actualMonthlyChartData = convertWeekToChart(actualMonthTotals);
        setMonthCalorieDataEstimates(estMonthlyChartData);
        setMonthCalorieDataActuals(actualMonthlyChartData);

        // console.log('weekly chart data====>', monthCalorieData);
        setIsLoading(false);
      });
    return () => unsubscribe();
  }, []);

  return isLoading ? (
    <SafeAreaView>
      <Text>Loading</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView>
      <View style={styles.container}>
        <VictoryChart
          width={400}
          height={400}
          theme={VictoryTheme.material}
          domainPadding={30}
          containerComponent={
            <VictoryVoronoiContainer
              labels={(d) => {
                return `${d.datum.calories}\n${d.datum.date}`;
                // return `${d.datum.calories}`;
              }}
              labelComponent={
                <VictoryTooltip
                  constrainToVisibleArea
                  style={{ fontSize: 13 }}
                />
              }
            />
          }
        >
          <VictoryLegend
            x={125}
            y={10}
            centerTitle
            orientation="horizontal"
            gutter={20}
            style={{ border: { stroke: "black" } }}
            colorScale={["#456990", "#EF767A"]}
            data={[{ name: "Potential Calories Burned Per Route" }, { name: "Actual Calories Burned Per Route" }]}
            itemsPerRow={1}
          />
          <VictoryAxis
            style={{
              axis: { stroke: "#ABB0AC" },
              axisLabel: { fontSize: 16 },
              ticks: { stroke: "#ABB0AC" },
              grid: { stroke: "white", strokeWidth: 0.25 },
            }}
            dependentAxis
          />
          <VictoryAxis
            style={{
              axis: { stroke: "#ABB0AC" },
              axisLabel: { fontSize: 16 },
              ticks: { stroke: "#ABB0AC" },
              grid: { stroke: "white", strokeWidth: 0.25 },
              tickLabels: {
                fill: "transparent",
                fontSize: 12,
                padding: 1,
                angle: 45,
                verticalAnchor: "middle",
                textAnchor: "start",
              },
            }}
          />
          <VictoryGroup offset={12} colorScale={"qualitative"}>
            <VictoryBar
              data={monthCalorieDataEstimates}
              style={{ data: { fill: "#456990" } }}
              x="date"
              y="calories"
              // labels={(d) => {
              //   // return `${d.datum.calories}\n${d.datum.date}`;
              //   return `${d.datum.calories}`;
              // }}
              // labelComponent={<VictoryTooltip style={{fontSize: 15}}/>}
            />
            <VictoryBar
              data={monthCalorieDataActuals}
              style={{ data: { fill: "#EF767A" } }}
              x="date"
              y="calories"
              // labels={(d) => {
              //   // return `${d.datum.calories}\n${d.datum.date}`;
              //   return `${d.datum.calories}`;
              // }}
              // labelComponent={<VictoryTooltip style={{fontSize: 15}}/>}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>
      <Text style={styles.subTitle}>SUMMARY</Text>
      <View style={styles.statMainContainer}>
        <View style={styles.statContainer}>
          <Icon name="ios-checkmark-outline" style={styles.checkmark} />
          <Text style={styles.statText}>TOTAL CALORIES BURNED:</Text>
          <Text style={styles.statNumber}>{totalCalories(calorieData)} cal</Text>
        </View>
        <View style={styles.statContainer}>
          <Icon name="ios-checkmark-outline" style={styles.checkmark} />
          <Text style={styles.statText}>
            AVG DAILY CALORIES BURNED:
          </Text>
          <Text style={styles.statNumber}>
            {Math.round(totalCalories(calorieData) / 30)} cal
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    width: 370,
    height: 390,
    padding: "2%",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginLeft: "1.2%"
  },
  statMainContainer: {
    backgroundColor: "white",
    width: 370,
    height: 100,
    borderRadius: 20,
    padding: "5%",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginBottom: "10%",
    marginLeft: "1.2%",
  },
  statContainer: {
    flexDirection: "row",
  },
  checkmark: {
    fontSize: 26,
    color: "black",
  },
  statText: {
    fontSize: 16,
    padding: 5,
  },
  statNumber: {
    fontSize: 19,
    fontWeight: "700",
    padding: 3,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "8%",
    marginBottom: "4%",
    marginLeft: "2%"
  },
});
