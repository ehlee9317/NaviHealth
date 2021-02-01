import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as firebase from "firebase";

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("Profile");
      } else {
        navigation.replace("Home");
      }
    });
  });

  return (
    <View>
      <ActivityIndicator size="large" />
    </View>
  );
}
