import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Direction({ route, navigation }) {
  const backMap = () => {
    navigation.navigate("Map");
  };
  const { directions } = route.params;
  console.log("Directions in screen-->", directions);
  // console.log("directions steps ---->", directions.steps)

  let finalDirectionsArr = [];
  for (let i = 0; i < directions.length; i++) {
    let currDirection = directions[i];
    if (currDirection.html_instructions && !currDirection.steps) {
      let regexSanitizedCurrDirection = directions[i].html_instructions.replace(
        /(<([^>]+)>)/gi,
        ""
      );
      if (regexSanitizedCurrDirection.indexOf("(") !== -1) {
        finalDirectionsArr.push(
          regexSanitizedCurrDirection.slice(
            0,
            regexSanitizedCurrDirection.indexOf("(")
          )
        );
      } else {
        finalDirectionsArr.push(regexSanitizedCurrDirection);
      }
    } else if (currDirection.html_instructions && currDirection.steps) {
      for (let j = 0; j < currDirection.steps.length; j++) {
        // let regexSanitizedCurrStepsDirection = currDirection.steps[j].replace(/(<([^>]+)>)/gi, "");
        // finalDirectionsArr.push(regexSanitizedCurrStepsDirection)
        let currStepsDirection = currDirection.steps[j];
        // console.log('currDirection.steps[j]---->', currStepsDirection)
        if (currStepsDirection.html_instructions) {
          let regexSanitizedCurrStepsDirection = currStepsDirection.html_instructions.replace(
            /<[^>]*>?/gm,
            ""
          );
          // console.log('regexSanitizedCurrStepsDirection---->', regexSanitizedCurrStepsDirection)
          if (regexSanitizedCurrStepsDirection.indexOf("(") !== -1) {
            finalDirectionsArr.push(
              regexSanitizedCurrStepsDirection.slice(
                0,
                regexSanitizedCurrStepsDirection.indexOf("(")
              )
            );
          } else {
            finalDirectionsArr.push(regexSanitizedCurrStepsDirection);
          }
        }
      }
    }
    console.log("finalDirectionsArr--->", finalDirectionsArr);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Directions</Text>
      </View>
      <ScrollView>
        <View style={styles.directionContainer}>
          {finalDirectionsArr.map((elem, index) => (
            <View key={index}>
              <Text style={styles.direction}>
                {`${index + 1}. `}
                {elem}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
     <TouchableOpacity>
      <Text style={styles.backButton} onPress={backMap}>Back to Map</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // backgroundColor: "#456990",
  },
  titleContainer:{
    flex:.5, 
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "#49BEAA"
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color:"white"
  },
  direction: {
    padding: 15,
    fontWeight: "bold",
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#EEB868",
    color: "white",
  },
  directionContainer: {
    backgroundColor: "#49BEAA",
    justifyContent: "flex-start",
    marginTop: "6%",

    //  alignItems:"stretch"
  },
  buttonContainer: {
    backgroundColor: "#49BEAA",
  },
  backButton: {
    // marginTop:"10%"
    color:"white",
  },
});
