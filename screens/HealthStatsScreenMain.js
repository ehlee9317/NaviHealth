import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import DailyHealthStatsScreen from "./HealthStatsScreenDaily";
import WeeklyHealthStatsScreen from "./HealthStatsWeeklyScreen";
import MonthlyHealthStatsScreen from "./HealthStatsMonthlyScreen";

export default function HealthStatsScreen({ navigation }) {
  const [buttonLabel, setButtonLabel] = useState({});
  const buttonNames = ["Day", "Week", "Month"];

  const rangeClickHandler = (buttonName) => {
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
      console.log("single button----->", singleButton);
      return (
        <View >
          <TouchableOpacity
            key={singleButton}
            // title={`${singleButton}`}
            onPress={() => rangeClickHandler(singleButton)}

          >
            <Text style={styles.buttonText}>{singleButton}</Text>
          </TouchableOpacity>
        </View>
      );
    });
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
          {buttonLabel === "Week" ? (
            <View>{<WeeklyHealthStatsScreen />}</View>
          ) : buttonLabel === "Month" ? (
            <View>{<MonthlyHealthStatsScreen />}</View>
          ) : (
            <View>{<DailyHealthStatsScreen />}</View>
          )}
        </View>
      </View>

      {/* <Button title="Go back" onPress={() => navigation.goBack()} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
  },
  titleContainer: {
    marginTop: "12%",
    marginLeft: "6%",
    // marginBottom: "2%",
    // alignItems: "flex-end"
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-around",
    // display: "flex",
    marginBottom: "3%",
    marginLeft: "5%",
    // padding: "5%"
  },
  buttonText:{
    marginRight: "5%",
    fontSize: 17,
    // justifyContent: "center",
    // alignItems: "center",
    // width: 50,
    // backgroundColor: "black"
    // marginLeft: "2%"
    // borderWidth: 1
  },
  dashboardContainer: {
    // backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // marginLeft: "2%",
    // width: 350,
    // height: 500
  },
});
