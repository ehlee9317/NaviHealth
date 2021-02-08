import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function Direction ({route, navigation}){
   const backMap = () =>{
      navigation.navigate("Map")
  }
  const {directions} = route.params
  console.log("Directions in screen-->", directions)
  console.log(typeof directions[0].html_instructions)
  const directionsArr = directions.map((direction)=>{
    <View>
    <Text>{direction.html_instructions}</Text>
  </View>
  })
  console.log(directionsArr)
  
  return (
    <View style={styles.container}>
      <Text>Directions</Text>
      <Text>{directions[0].html_instructions}</Text>
      <Text>
      {directionsArr}
      </Text>
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
});