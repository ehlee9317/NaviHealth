import React from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

const data = [
  { week: 1, calories: 100 },
  { week: 2, calories: 300 },
  { week: 3, calories: 500 },
  { week: 4, calories: 400 },
];

const HealthStatsScreen = ({ navigation }) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <VictoryChart width={350} theme={VictoryTheme.material}>
          <VictoryBar data={data} x='week' y='calories' />
        </VictoryChart>
      </View>
      <View>
        <Text>PLACEHOLDER METRIC</Text>
      </View>
      <Button title='Go back' onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
};

export default HealthStatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
