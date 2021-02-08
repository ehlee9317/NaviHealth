import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function Direction ({navigation}){
  useEffect(()=>{
    
  })
  const backMap = () =>{
      navigation.navigate("Map")
  }
  return (
    <View style={styles.container}>
      <Text>Directions</Text>
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