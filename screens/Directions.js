import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Direction ({route, navigation}){
   const backMap = () =>{
      navigation.navigate("Map")
  }
  const {directions} = route.params
  console.log("Directions in screen-->", directions)

//   const directionsArr = directions.map((direction)=>(
//     <View>
//     <Text style={styles.direction}>{direction.html_instructions.replace(/(<([^>]+)>)/gi, "")}</Text>
//   </View>
    
//   ))
  let finalDirectionsArr = [];
  let key = 0
  for (let i = 0; i < directions.length; i++) {
      let currDirection = directions[i].html_instructions.replace(/(<([^>]+)>)/gi, "");
      // console.log('currDirection---->', currDirection)
      // console.log('typeof currDirection', typeof currDirection)
      if (currDirection.indexOf("(") !== -1) {
        finalDirectionsArr.push(currDirection.slice(0, currDirection.indexOf("(")))
      } else {
        finalDirectionsArr.push(currDirection)
      }
      console.log(finalDirectionsArr)
  }
  
  return (
    <View style={styles.container}>
      <Text>Directions</Text>
      {finalDirectionsArr.map((elem) => <View><Text>{elem}</Text></View>)}
      <Button title="Back to Map" onPress={backMap} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  direction: {
      padding:20,
  }
});