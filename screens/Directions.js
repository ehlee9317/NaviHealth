import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Direction ({route, navigation}){
   const backMap = () =>{
      navigation.navigate("Map")
  }
  const {directions} = route.params
  console.log("Directions in screen-->", directions)
  // console.log("directions steps ---->", directions.steps)

  let finalDirectionsArr = [];
  for (let i = 0; i < directions.length; i++) {
      let currDirection = directions[i];
      if (currDirection.html_instructions && !currDirection.steps) {
        let regexSanitizedCurrDirection = directions[
          i
        ].html_instructions.replace(/(<([^>]+)>)/gi, "");
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
      } else if (currDirection.html_instructions && currDirection.steps){
        for (let j = 0; j < currDirection.steps.length; j++){
          // let regexSanitizedCurrStepsDirection = currDirection.steps[j].replace(/(<([^>]+)>)/gi, "");
          // finalDirectionsArr.push(regexSanitizedCurrStepsDirection)
          let currStepsDirection =  currDirection.steps[j]
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
      console.log('finalDirectionsArr--->',finalDirectionsArr)
  }
  
  return (
    <SafeAreaView style={styles.container}>
    <View>
      <Text>Directions</Text>
    </View>
    <View>
      {
        finalDirectionsArr.map((elem, index) => <View key={index}>
        <Text style={styles.direction}>{`${index+1}. `}{elem}</Text></View>)}
    </View>
      <Button title="Back to Map" onPress={backMap} />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  direction: {
      padding:10,
  }
});