import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
  VictoryGroup,
  VictoryLegend,
  VictoryVoronoiContainer
} from 'victory-native';
import * as firebase from 'firebase';
import {
  totalCalories,
  totalCaloriesWeekly,
  convertWeekToChart,
} from '../api/healthStatsMethods';

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
        let estCalories = [];
        let actualCalories = [];
        querySnapshot.forEach((doc) => {
          const dataObj = doc.data();
          console.log('dataobj=====>', dataObj);
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
    <SafeAreaView style={styles.container}>
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
                <VictoryTooltip   constrainToVisibleArea style={{fontSize: 13}} />
              }
            />
          }
        >
          <VictoryLegend
            x={125}
            y={10}
            centerTitle
            orientation='horizontal'
            gutter={20}
            style={{ border: { stroke: 'black' } }}
            colorScale={["#456990", "#EF767A"]}
            data={[{ name: 'Estimated' }, { name: 'Actuals' }]}
          />
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
                fill: "transparent",
                fontSize: 12,
                padding: 1,
                angle: 45,
                verticalAnchor: 'middle',
                textAnchor: 'start',
              },
            }}
          />
          <VictoryGroup offset={12} colorScale={'qualitative'}>
            <VictoryBar
              data={monthCalorieDataEstimates}
              style={{data: { fill: "#456990" }}}
              x='date'
              y='calories'
              // labels={(d) => {
              //   // return `${d.datum.calories}\n${d.datum.date}`;
              //   return `${d.datum.calories}`;
              // }}
              // labelComponent={<VictoryTooltip style={{fontSize: 15}}/>}
            />
            <VictoryBar
              data={monthCalorieDataActuals}
              style={{data: { fill: "#EF767A" }}}
              x='date'
              y='calories'
              // labels={(d) => {
              //   // return `${d.datum.calories}\n${d.datum.date}`;
              //   return `${d.datum.calories}`;
              // }}
              // labelComponent={<VictoryTooltip style={{fontSize: 15}}/>}
            />
          </VictoryGroup>
        </VictoryChart>

        <View style={{margin: 50}}>
          <Text style={styles.statsBox}>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
          <Text style={styles.statsBox}>
            AVERAGE DAILY CALORIES BURNED:{' '}
            {Math.round(totalCalories(calorieData) / 30)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBox: {
    fontSize: 16,
    borderColor: "#EF767A",
    borderWidth: 1,
    padding: 10
  }
});
