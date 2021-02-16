import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
  VictoryGroup,
  VictoryLegend,
  VictoryVoronoiContainer,
} from 'victory-native';
import * as firebase from 'firebase';
import { totalCalories } from '../api/healthStatsMethods';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DailyHealthStatsScreen() {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([]);
  const [actualsCalorieData, setActualsData] = useState([]);

  // sets beginning date to current day at midnight for database pull:
  let beginningDate = new Date().setHours(0, 0, 0, 0);
  let beginningDateObject = new Date(beginningDate);

  // Pulls data from firebase and converts format to Victory chart data format:
  useEffect(() => {
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
          // convert to Victory chart data format:
          estCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.estCaloriesBurned),
          });
          actualCalories.push({
            date: dataObj.timeStamp,
            calories: Math.round(dataObj.actualCaloriesBurned),
          });
        });
        setCalorieData(estCalories);
        setActualsData(actualCalories);
      });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {calorieData && (
          <VictoryChart
            width={380}
            height={380}
            theme={VictoryTheme.material}
            domainPadding={40}
            containerComponent={
              <VictoryVoronoiContainer
                labels={(d) => {
                  return `${d.datum.calories}\n${d.datum.date}`;
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
              orientation='horizontal'
              gutter={20}
              style={{ border: { stroke: 'black' } }}
              colorScale={['#456990', '#EF767A']}
              data={[
                { name: 'Potential Calories Burned Per Route' },
                { name: 'Actual Calories Burned Per Route' },
              ]}
              itemsPerRow={1}
              position='center'
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#ABB0AC' },
                axisLabel: { fontSize: 16 },
                ticks: { stroke: '#ABB0AC' },
                grid: { stroke: 'white', strokeWidth: 0.25 },
              }}
              dependentAxis
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#ABB0AC' },
                axisLabel: { fontSize: 16 },
                ticks: { stroke: '#ABB0AC' },
                grid: { stroke: 'white', strokeWidth: 0.25 },
                tickLabels: {
                  fill: 'transparent',
                  fontSize: 12,
                  padding: 1,
                  angle: 45,
                  verticalAnchor: 'middle',
                  textAnchor: 'start',
                },
              }}
            />
            <VictoryGroup offset={25} colorScale={'qualitative'}>
              <VictoryBar
                data={calorieData}
                style={{ data: { fill: '#456990' } }}
                x='date'
                y='calories'
              />
              <VictoryBar
                data={actualsCalorieData}
                style={{ data: { fill: '#EF767A' } }}
                x='date'
                y='calories'
              />
            </VictoryGroup>
          </VictoryChart>
        )}
      </View>
      <Text style={styles.subTitle}>SUMMARY</Text>
      <View style={styles.statContainer}>
        <Icon name='ios-checkmark-outline' style={styles.checkmark} />
        <Text style={styles.statText}>TOTAL CALORIES BURNED:</Text>
        <Text style={styles.statNumber}>
          {totalCalories(actualsCalorieData)} cal
        </Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 370,
    height: 380,
    padding: '2%',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginLeft: '1.2%',
  },
  statContainer: {
    backgroundColor: 'white',
    width: 370,
    height: 100,
    borderRadius: 20,
    flexDirection: 'row',
    padding: '5%',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginBottom: '10%',
    marginLeft: '1.2%',
  },
  checkmark: {
    fontSize: 26,
    color: 'black',
  },
  statText: {
    fontSize: 16,
    padding: 5,
  },
  statNumber: {
    fontSize: 19,
    fontWeight: '700',
    padding: 3,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: '8%',
    marginBottom: '4%',
    marginLeft: '2%',
  },
});
