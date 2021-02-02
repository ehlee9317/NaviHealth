import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const HealthStatsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Dashboard Screen</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default HealthStatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
