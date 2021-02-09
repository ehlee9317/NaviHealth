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
  for (let i = 0; i < directions.length; i++) {
      let finalDirectionsArr = []
      let currDirection = directions[i].html_instructions.replace(/(<([^>]+)>)/gi, "");
      // console.log('currDirection---->', currDirection)
      // console.log('typeof currDirection', typeof currDirection)
     
    //   for (let j = 0; j < currDirection.length; j++){
    //       let currLetter = currDirection[j];
    //       console.log('currLetter--->', currLetter)
    //       console.log('currDirection.length -1', currDirection.length-1)
    //       if (currLetter === '(' ) {
    //           finalDirectionsArr.push(currDirection.slice(0 , j+1))
    //       }
    //   }
    //   console.log(finalDirectionsArr)
  }
  
  
  return (
    <View style={styles.container}>
     
     <Text>Directions</Text>
     {/* {directionsArr.length > 0 ? (<View>{directionsArr}</View>): (<Text>Please enter a route</Text>)}
      */}
      <Button title="Back to Map" onPress={backMap} />
    
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  direction: {
      padding:20,
  }
});