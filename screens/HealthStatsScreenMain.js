import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';

import DailyHealthStatsScreen from './HealthStatsScreenDaily'
import WeeklyHealthStatsScreen from './HealthStatsWeeklyScreen'
import MonthlyHealthStatsScreen from './HealthStatsMonthlyScreen'

export default function HealthStatsScreen({ navigation }) {
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ['Day', 'Week', 'Month'];

  const rangeClickHandler = (buttonName) => {
    console.log('button clicked!');
    if (buttonName === 'Week') {
      setButtonLabel('Week');
    } else if (buttonName === 'Month') {
      setButtonLabel('Month');
    } else {
      setButtonLabel('Day');
    }
  };

  const displayButtons = (rangeButtons) => {
    return rangeButtons.map((singleButton) => {
      console.log('single button----->', singleButton)
      return (
        <Button
          key={singleButton}
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
        <View style={{ flexDirection: 'row' }}>
          {displayButtons(buttonNames)}
        </View>
        <View>
          {buttonLabel === 'Week' ? (
            <View>
              {<WeeklyHealthStatsScreen />}
            </View>
          ) : buttonLabel === 'Month' ? (
            <View>
              {<MonthlyHealthStatsScreen />}
            </View>
          ) : (
            <View>
              {<DailyHealthStatsScreen />}
            </View>
          )}
        </View>
      </View>

      <Button title='Go back' onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
