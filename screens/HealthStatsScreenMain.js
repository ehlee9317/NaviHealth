import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import DailyHealthStatsScreen from './HealthStatsScreenDaily';
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen';
import MonthlyHealthStatsScreen from './HealthStatsMonthlyScreen';

export default function HealthStatsScreen() {
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ['Day', 'Week', 'Month'];

  const rangeClickHandler = (buttonName) => {
    if (buttonName === 'Week') {
      setButtonLabel('Week');
    } else if (buttonName === 'Month') {
      setButtonLabel('Month');
    } else {
      setButtonLabel('Day');
    }
  };

  const displayButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={buttonLabel === 'Day' ? styles.buttonLine : styles.button}
          onPress={() => rangeClickHandler('Day')}
        >
          <Text style={styles.buttonText}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={buttonLabel === 'Week' ? styles.buttonLine : styles.button}
          onPress={() => rangeClickHandler('Week')}
        >
          <Text style={styles.buttonText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={buttonLabel === 'Month' ? styles.buttonLine : styles.button}
          onPress={() => rangeClickHandler('Month')}
        >
          <Text style={styles.buttonText}>Month</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>DASHBOARD</Text>
      </View>
      <View style={styles.dashboardContainer}>
        <View style={styles.buttonContainer}>
          {displayButtons(buttonNames)}
        </View>
        <View>
          {buttonLabel === 'Week' ? (
            <View>{<WeeklyHealthStatsScreen />}</View>
          ) : buttonLabel === 'Month' ? (
            <View>{<MonthlyHealthStatsScreen />}</View>
          ) : (
            <View>{<DailyHealthStatsScreen />}</View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginTop: '5%',
    marginBottom: '2%',
    marginLeft: '4%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '1.5%',
    marginLeft: '3%',
    justifyContent: 'center',
  },
  button: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '.5%',
  },
  buttonLine: {
    borderBottomWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '.5%',
    borderBottomColor: '#456990',
  },
  buttonText: {
    marginRight: '10%',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: '3%',
    marginLeft: '5%',
  },
  dashboardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
